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
    const userRole = userData?.role;
    const roleName = typeof userRole === 'string' ? userRole : userRole?.name;

    const userType = isSystemUser !== undefined
      ? isSystemUser
      : StorageManager.getItem<string>('user_type') === 'system';

    let permissionsState: any;

    if (!userType) {
      // Application user — fetch from dedicated application permissions endpoint
      try {
        const response = await apiService.get<any>('/application/permissions');
        const payload = response.data as any;
        // Response shape: { role: {...}, permissions: [...] }
        const role = payload?.role ?? { name: roleName };
        const permissions: any[] = payload?.permissions ?? [];
        permissionsState = {
          role,
          permissions,
          capabilities: {},
        };
      } catch {
        // Fallback: derive from embedded role permissions if API fails
        const rolePermissions: any[] = userRole?.permissions || [];
        const resolved = rolePermissions
          .filter((p: any) => typeof p === 'object' && p?.name)
          .map((p: any) => ({ name: p.name, id: p.id, resource: p.resource, action: p.action, description: p.description }));
        permissionsState = {
          role: { name: roleName },
          permissions: resolved,
          capabilities: {},
        };
      }
    } else {
      // System user — resolve from /system/permissions (paginated)
      const rolePermissions: any[] = userRole?.permissions || [];
      const alreadyResolved = rolePermissions
        .filter((p: any) => typeof p === 'object' && p?.name)
        .map((p: any) => ({ name: p.name, id: p.id, resource: p.resource, action: p.action, description: p.description }));
      const ids = rolePermissions.filter((p: any) => typeof p === 'string');

      let resolved: { name: string }[] = [];
      if (ids.length > 0) {
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
          const idToName: Record<string, any> = {};
          allPerms.forEach((p: any) => { if (p.id) idToName[p.id] = p; });
          resolved = ids.map(id => {
            const perm = idToName[id];
            return perm
              ? { name: perm.name, id: perm.id, resource: perm.resource, action: perm.action, description: perm.description }
              : { name: id };
          });
        } catch {
          resolved = ids.map(id => ({ name: id }));
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
            StorageManager.setPermissions(permissions);

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

      if (typeof apiService.debugConfiguration === 'function') {
        apiService.debugConfiguration();
      }

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
        StorageManager.setPermissions(permissions);
      } catch (permError: any) {
        console.warn('Failed to derive permissions from login response:', permError);
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
  }, [user, userPermissions]);

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
        StorageManager.setPermissions(permissions);
      })();

      await refreshPermissionsRef.current;
    } finally {
      refreshPermissionsRef.current = null;
    }
  }, []);

  const getPermissionsList = (): string[] => {
    if (!userPermissions?.permissions) return [];
    return userPermissions.permissions.map((p: any) => p.name);
  };

  const hasBackendPermission = (permission: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: any) => p.name === permission);
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