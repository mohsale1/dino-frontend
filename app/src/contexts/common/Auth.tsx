import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { UserProfile, UserRegistration } from '../../types';
import { AuthUser, ROLES, PermissionName, RoleName } from '../../types/auth';
import { normalizeRole } from '../../types/auth/roles';
import { authService, PermissionService } from '../../services/common/auth';
// PermissionService used only for getBackendRole / getRoleDefinition / hasPermission / hasRole / canAccessRoute
import { cacheUtils } from '../../utils/storage';
import { StorageManager } from '../../utils/storage';
import { tokenRefreshScheduler } from '../../utils/auth/tokenRefreshScheduler';
import { normalizeUserData } from '../../utils/data';
import { apiService } from '../../utils/api';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, isSystemUser?: boolean) => Promise<{ user: UserProfile }>;
  register: (userData: UserRegistration) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<UserProfile>) => Promise<void>;
  refreshUser: () => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
  hasPermission: (permission: PermissionName) => boolean;
  hasRole: (role: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  getUserWithRole: () => AuthUser | null;
  userPermissions: any | null;
  refreshPermissions: () => Promise<void>;
  getPermissionsList: () => string[];
  hasBackendPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<any | null>(null);

  const derivePermissionsFromUser = async (userData: any, isSystemUser?: boolean): Promise<any> => {
    // Auth/me returns { user, workspace } — unwrap if needed.
    // After getCurrentUser normalizes, the raw role is preserved on _rawRole.
    const userRole = userData?._rawRole ?? userData?.role;
    const roleName = typeof userRole === 'string' ? userRole : userRole?.name;

    const userType = isSystemUser !== undefined
      ? isSystemUser
      : StorageManager.getItem<string>('user_type') === 'system';

    let permissionsState: any;

    if (!userType) {
      // Application user — /application/auth/me already returns role.permissions as
      // codename strings ("resource:action") via the dependency layer (Dependencies.py).
      // No extra API call needed — parse them directly from the embedded role object.
      const rolePermissions: any[] = userRole?.permissions || [];

      const permissions = rolePermissions
        .filter((p: any) => typeof p === 'string' && p.includes(':'))
        .map((p: string) => {
          const [resource, action] = p.split(':');
          return { resource, action, name: p };
        });

      permissionsState = {
        role: { name: roleName },
        permissions,
        capabilities: {},
      };
    } else {
      // System user — /system/auth/me returns role with id+name only (no permissions array).
      // Strategy:
      //   1. If role.permissions is already populated (full objects), use them directly.
      //   2. If role.permissions contains IDs, resolve via /system/permissions.
      //   3. If role.permissions is empty/missing, fetch the full role via /system/roles/{id}
      //      which includes the permissions array, then resolve those IDs.
      const rolePermissions: any[] = userRole?.permissions || [];
      const roleId = userRole?.id ?? userData?.roleId ?? userData?.role_id;

      // Already-resolved objects have category + resource + action fields
      const alreadyResolved = rolePermissions
        .filter((p: any) => typeof p === 'object' && p?.category && p?.resource && p?.action)
        .map((p: any) => ({ id: p.id, category: p.category, resource: p.resource, action: p.action }));

      // Numeric/string IDs that still need to be resolved
      let ids: any[] = rolePermissions.filter((p: any) => typeof p === 'string' || typeof p === 'number');

      // If no permissions at all on the role object, fetch the full role by ID
      if (alreadyResolved.length === 0 && ids.length === 0 && roleId) {
        try {
          const roleResponse = await apiService.get<any>(`/system/roles/${roleId}`);
          const roleData = roleResponse.data as any;
          const fullRole = roleData?.data ?? roleData;
          const rolePerms: any[] = fullRole?.permissions || [];
          for (const p of rolePerms) {
            if (typeof p === 'object' && p?.category && p?.resource && p?.action) {
              alreadyResolved.push({ id: p.id, category: p.category, resource: p.resource, action: p.action });
            } else if (typeof p === 'string' || typeof p === 'number') {
              ids.push(p);
            }
          }
        } catch {
          // Role fetch failed — fall through to resolve via all permissions
        }
      }

      // Resolve any remaining IDs by fetching all system permissions
      let resolved: any[] = [];
      if (ids.length > 0 || (alreadyResolved.length === 0 && roleId)) {
        try {
          let allPerms: any[] = [];
          let page = 1;
          let hasNext = true;
          while (hasNext) {
            const response = await apiService.get<any>('/system/permissions', {
              params: { page, page_size: 100 },
            });
            const items: any[] = response.data?.data ?? response.data ?? [];
            allPerms = allPerms.concat(items);
            hasNext = response.data?.pagination?.hasNext ?? response.data?.pagination?.has_next ?? false;
            page++;
          }

          if (ids.length > 0) {
            const idMap: Record<string, any> = {};
            allPerms.forEach((p: any) => { if (p.id != null) idMap[String(p.id)] = p; });
            resolved = ids.map(id => {
              const perm = idMap[String(id)];
              return perm
                ? { id: perm.id, category: perm.category, resource: perm.resource, action: perm.action }
                : null;
            }).filter(Boolean);
          } else if (alreadyResolved.length === 0) {
            resolved = allPerms.map((p: any) => ({
              id: p.id, category: p.category, resource: p.resource, action: p.action,
            }));
          }
        } catch {
          resolved = [];
        }
      }

      permissionsState = {
        role: { name: roleName },
        permissions: [...alreadyResolved, ...resolved],
        capabilities: {},
      };
    }

    StorageManager.setPermissions(permissionsState);
    return permissionsState;
  };



  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = StorageManager.getItem<string>(StorageManager.KEYS.TOKEN);
        const savedUser = StorageManager.getUserData();
        const savedPermissions = StorageManager.getPermissions();
        const userType = StorageManager.getItem<string>('user_type');

        if (token && savedUser) {
          if (typeof token === 'string' && isTokenExpired(token)) {
            StorageManager.removeItem(StorageManager.KEYS.TOKEN);
            StorageManager.removeItem(StorageManager.KEYS.USER);
            StorageManager.removeItem(StorageManager.KEYS.PERMISSIONS);
            StorageManager.removeItem('user_type');
            setUser(null);
            setUserPermissions(null);
            apiService.setAuthorizationHeader(null);
            return;
          }

          apiService.setAuthorizationHeader(token);

          try {
            const isSystemUser = userType === 'system';
            const currentUser = await authService.getCurrentUser(isSystemUser);
            const localUser = normalizeUserData(currentUser);

            setUser(localUser);
            StorageManager.setUserData(localUser);

            const permissions = await derivePermissionsFromUser(currentUser, isSystemUser);
            setUserPermissions(permissions);

            tokenRefreshScheduler.start();
          } catch {
            // Fall back to cached data on network failure
            setUser(savedUser);
            if (savedPermissions) {
              setUserPermissions(savedPermissions);
            }
          }
        } else {
          setUser(null);
          setUserPermissions(null);
          apiService.setAuthorizationHeader(null);
        }
      } catch {
        StorageManager.removeItem(StorageManager.KEYS.TOKEN);
        StorageManager.removeItem(StorageManager.KEYS.USER);
        StorageManager.removeItem(StorageManager.KEYS.PERMISSIONS);
        StorageManager.removeItem('user_type');
        setUser(null);
        setUserPermissions(null);
        apiService.setAuthorizationHeader(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, isSystemUser: boolean = false): Promise<{ user: UserProfile }> => {
    try {
      setLoading(true);

      apiService.refreshConfiguration();

      const response = await authService.login(email, password, false, isSystemUser);

      StorageManager.setItem(StorageManager.KEYS.TOKEN, response.access_token);
      apiService.setAuthorizationHeader(response.access_token);

      StorageManager.setItem('user_type', isSystemUser ? 'system' : 'application');

      if (!response.user) {
        throw new Error('Failed to retrieve user data');
      }

      const localUser = normalizeUserData(response.user);

      if ((response.user as any).venue) {
        StorageManager.setItem('current_venue', (response.user as any).venue);
      }

      if ((response.user as any).workspace) {
        StorageManager.setItem('current_workspace', (response.user as any).workspace);
      }

      setUser(localUser);
      StorageManager.setUserData(localUser);

      try {
        const permissions = await derivePermissionsFromUser(response.user, isSystemUser);
        setUserPermissions(permissions);
      } catch (permError: any) {
        // Permission derivation failed — user is still logged in, permissions will be empty
      }

      tokenRefreshScheduler.start();

      setTimeout(() => {
        cacheUtils.preloadCriticalData(localUser.id, localUser.venueId);
      }, 100);

      return { user: localUser };
    } catch (error: any) {
      StorageManager.removeItem(StorageManager.KEYS.TOKEN);
      StorageManager.removeItem(StorageManager.KEYS.USER);
      StorageManager.removeItem(StorageManager.KEYS.PERMISSIONS);
      StorageManager.removeItem('user_type');
      setUser(null);
      setUserPermissions(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: UserRegistration): Promise<void> => {
    try {
      setLoading(true);
      await authService.signup(userData as any);
    } finally {
      setLoading(false);
    }
  };

  const logout = (): void => {
    tokenRefreshScheduler.stop();
    apiService.setAuthorizationHeader(null);
    authService.logout();
    StorageManager.clearAuthData();
    setUser(null);
    setUserPermissions(null);
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<void> => {
    // Send camelCase — the apiService interceptor auto-converts to snake_case for the backend
    const payload = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    };

    let response: any;
    try {
      // Self-update via auth/me endpoint (preferred — no ID needed)
      response = await apiService.put('/application/auth/me', payload);
    } catch {
      // Fall back to users/{id} endpoint
      const userId = user?.id || (StorageManager.getUserData() as any)?.id;
      if (!userId) throw new Error('No authenticated user found');
      response = await apiService.put(`/application/users/${userId}`, payload);
    }

    const updatedUser = normalizeUserData(response.data || { ...user, ...userData });
    setUser(updatedUser as UserProfile);
    StorageManager.setUserData(updatedUser as UserProfile);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      const localUser = normalizeUserData(currentUser);
      setUser(localUser);
      StorageManager.setUserData(localUser);
    } catch (error) {
      logout();
      throw error;
    }
  };

  const getUserWithRole = useMemo((): AuthUser | null => {
    if (!user) return null;

    const backendRole = PermissionService.getBackendRole();
    let roleName: RoleName = ROLES.USER;

    if (backendRole && backendRole.name) {
      const normalized = normalizeRole(backendRole.name);
      roleName = normalized || ROLES.USER;
    } else {
      const userRole = (user as any).role;
      const normalized = normalizeRole(userRole);
      roleName = normalized || ROLES.USER;
    }

    const role = PermissionService.getRoleDefinition(roleName);
    if (!role) return null;

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: roleName,
      permissions: role.permissions,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [user]);

  const hasPermission = useCallback((permission: PermissionName): boolean => {
    return PermissionService.hasPermission(getUserWithRole, permission);
  }, [getUserWithRole]);

  const hasRole = useCallback((role: string): boolean => {
    const backendRole = PermissionService.getBackendRole();

    if (backendRole && backendRole.name) {
      const roleName = typeof backendRole.name === 'string'
        ? backendRole.name
        : String(backendRole.name);
      return roleName.toLowerCase() === role.toLowerCase();
    }

    return PermissionService.hasRole(getUserWithRole, role);
  }, [getUserWithRole]);

  const canAccessRoute = useCallback((route: string): boolean => {
    return PermissionService.canAccessRoute(getUserWithRole, route);
  }, [getUserWithRole]);

  const refreshPermissionsRef = useRef<Promise<void> | null>(null);
  const lastRefreshAttempt = useRef<number>(0);
  const refreshCooldown = 30000;

  const refreshPermissions = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (now - lastRefreshAttempt.current < refreshCooldown) {
      return;
    }

    if (refreshPermissionsRef.current) {
      return refreshPermissionsRef.current;
    }

    try {
      lastRefreshAttempt.current = now;
      refreshPermissionsRef.current = (async () => {
        const userType = StorageManager.getItem<string>('user_type');
        const isSystemUser = userType === 'system';
        const currentUser = await authService.getCurrentUser(isSystemUser);
        const permissions = await derivePermissionsFromUser(currentUser, isSystemUser);
        setUserPermissions(permissions);
      })();

      await refreshPermissionsRef.current;
    } finally {
      refreshPermissionsRef.current = null;
    }
  }, []);

  const getPermissionsList = (): string[] => {
    if (!userPermissions?.permissions) return [];
    return userPermissions.permissions
      .filter((p: any) => p?.resource && p?.action)
      .map((p: any) => p.name ?? `${p.resource}:${p.action}`);
  };

  const hasBackendPermission = (permission: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: any) => {
      if (p?.resource && p?.action) {
        return (p.name ?? `${p.resource}:${p.action}`) === permission;
      }
      return false;
    });
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    loading,
    isAuthenticated: !!user,
    hasPermission,
    hasRole,
    canAccessRoute,
    getUserWithRole: () => getUserWithRole,
    userPermissions,
    refreshPermissions,
    getPermissionsList,
    hasBackendPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};