import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { UserProfile, UserRegistration } from '../../types';
import { AuthUser, ROLES, PermissionName, RoleName } from '../../types/auth';
import { normalizeRole } from '../../types/auth/roles';
import { authService, PermissionService } from '../../services/common/auth';
// PermissionService used only for getBackendRole / getRoleDefinition / hasPermission / hasRole / canAccessRoute
import { cacheUtils } from '../../utils/storage';
import { StorageManager } from '../../utils/storage';
import { DEFAULTS, SERVICE_TIMEOUTS } from '../../constants/app';
import { tokenRefreshScheduler } from '../../utils/auth/tokenRefreshScheduler';
import { normalizeUserData } from '../../utils/data';
import { apiService } from '../../utils/api';

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, password: string, isSystemUser?: boolean) => Promise<{ user: UserProfile; permissions: any }>;
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
    const roleName = typeof userRole === 'string' ? userRole : (userRole?.name ?? '');

    const userType = isSystemUser !== undefined
      ? isSystemUser
      : StorageManager.getItem<string>(StorageManager.KEYS.USER_TYPE) === DEFAULTS.USER_TYPE_SYSTEM;

    let permissionsState: any;

    if (!userType) {
      // ── Application user ──────────────────────────────────────────────
      try {
        const response = await apiService.get<any>('/application/permissions');
        const payload  = response.data as any;
        const permissions: any[] = payload?.data ?? [];
        permissionsState = { role: { name: roleName }, permissions, capabilities: {} };
      } catch {
        permissionsState = { role: { name: roleName }, permissions: [], capabilities: {} };
      }
    } else {
      // ── System user ───────────────────────────────────────────────────
      // Resolve roleId — /system/auth/me may return role as:
      //   { id, name, ... }  → use id directly
      //   "Operator"         → look up by name via GET /system/roles
      let roleId: number | null =
        typeof userRole === 'object' && userRole?.id ? Number(userRole.id) : null;

      if (!roleId && roleName) {
        try {
          const rolesResp = await apiService.get<any>('/system/roles', {
            params: { page: 1, page_size: SERVICE_TIMEOUTS.PERMISSIONS_PAGE_SIZE },
          });
          const rolesRaw = rolesResp.data as any;
          const roles: any[] = Array.isArray(rolesRaw) ? rolesRaw : (rolesRaw?.data ?? []);
          const match = roles.find(
            (r: any) => r.name?.toLowerCase() === roleName.toLowerCase()
          );
          if (match?.id) roleId = Number(match.id);
        } catch {
          roleId = null;
        }
      }

      let permissions: any[] = [];

      if (roleId) {
        try {
          // Step 1 — permission IDs assigned to this role
          const idsResp = await apiService.get<any>(`/system/roles/${roleId}/permissions`);
          const idsRaw  = idsResp.data as any;

          const permissionIds: number[] = (
            Array.isArray(idsRaw) ? idsRaw : (idsRaw?.data ?? [])
          ).map(Number).filter((n: number) => !isNaN(n) && n > 0);

          if (permissionIds.length > 0) {
            const idSet = new Set(permissionIds);

            // Step 2 — fetch all permission objects, paginate until complete
            let page = 1;
            let collected: any[] = [];

            while (true) {
              const resp  = await apiService.get<any>('/system/permissions', {
                params: { page, page_size: SERVICE_TIMEOUTS.PERMISSIONS_PAGE_SIZE },
              });
              const raw   = resp.data as any;
              const batch: any[] = Array.isArray(raw) ? raw : (raw?.data ?? []);
              collected = collected.concat(batch);

              const total: number =
                raw?.total ?? raw?.pagination?.total ?? raw?.count ?? 0;
              if (batch.length < SERVICE_TIMEOUTS.PERMISSIONS_PAGE_SIZE || collected.length >= total || total === 0) break;
              page++;
            }

            permissions = collected
              .filter((p: any) => idSet.has(Number(p.id)))
              .map((p: any) => ({
                id:       p.id,
                category: (p.category ?? 'system').toLowerCase(),
                resource: p.resource,
                action:   p.action,
              }));
          }
        } catch {
          permissions = [];
        }
      }

      permissionsState = { role: { name: roleName }, permissions, capabilities: {} };
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
        const userType = StorageManager.getItem<string>(StorageManager.KEYS.USER_TYPE);

        if (token && savedUser) {
          if (typeof token === 'string' && isTokenExpired(token)) {
            StorageManager.removeItem(StorageManager.KEYS.TOKEN);
            StorageManager.removeItem(StorageManager.KEYS.USER);
            StorageManager.removeItem(StorageManager.KEYS.PERMISSIONS);
            StorageManager.removeItem(StorageManager.KEYS.USER_TYPE);
            setUser(null);
            setUserPermissions(null);
            apiService.setAuthorizationHeader(null);
            return;
          }

          apiService.setAuthorizationHeader(token);

          try {
            const isSystemUser = userType === DEFAULTS.USER_TYPE_SYSTEM;
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
        StorageManager.removeItem(StorageManager.KEYS.USER_TYPE);
        setUser(null);
        setUserPermissions(null);
        apiService.setAuthorizationHeader(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, isSystemUser: boolean = false): Promise<{ user: UserProfile; permissions: any }> => {
    try {
      setLoading(true);

      apiService.refreshConfiguration();

      const response = await authService.login(email, password, false, isSystemUser);

      StorageManager.setItem(StorageManager.KEYS.TOKEN, response.access_token);
      apiService.setAuthorizationHeader(response.access_token);

      StorageManager.setItem(StorageManager.KEYS.USER_TYPE, isSystemUser ? DEFAULTS.USER_TYPE_SYSTEM : DEFAULTS.USER_TYPE_APPLICATION);

      if (!response.user) {
        throw new Error('Failed to retrieve user data');
      }

      const localUser = normalizeUserData(response.user);

      if ((response.user as any).venue) {
        // 'current_venue' is not yet in StorageManager.KEYS — keep as raw key until promoted
        StorageManager.setItem('current_venue', (response.user as any).venue);
      }

      if ((response.user as any).workspace) {
        // 'current_workspace' is not yet in StorageManager.KEYS — keep as raw key until promoted
        StorageManager.setItem('current_workspace', (response.user as any).workspace);
      }

      setUser(localUser);
      StorageManager.setUserData(localUser);

      let resolvedPermissions: any = null;
      try {
        resolvedPermissions = await derivePermissionsFromUser(response.user, isSystemUser);
        setUserPermissions(resolvedPermissions);
        StorageManager.setPermissions(resolvedPermissions);
      } catch (permError: any) {
        void permError;
      }

      tokenRefreshScheduler.start();

      setTimeout(() => {
        cacheUtils.preloadCriticalData(localUser.id, localUser.venueId);
      }, 100);

      return { user: localUser, permissions: resolvedPermissions };
    } catch (error: any) {
      StorageManager.removeItem(StorageManager.KEYS.TOKEN);
      StorageManager.removeItem(StorageManager.KEYS.USER);
      StorageManager.removeItem(StorageManager.KEYS.PERMISSIONS);
      StorageManager.removeItem(StorageManager.KEYS.USER_TYPE);
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
    if (!user?.id) {
      throw new Error('No authenticated user found');
    }

    const response = await apiService.put(`/application/users/${user.id}`, {
      first_name: userData.firstName,
      last_name: userData.lastName,
      phone: userData.phone,
    });

    const updatedUser = normalizeUserData(response.data || userData);
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
  const refreshPermissions = useCallback(async (): Promise<void> => {
    const now = Date.now();
    if (now - lastRefreshAttempt.current < SERVICE_TIMEOUTS.TOKEN_REFRESH_COOLDOWN_MS) {
      return;
    }

    if (refreshPermissionsRef.current) {
      return refreshPermissionsRef.current;
    }

    try {
      lastRefreshAttempt.current = now;
      refreshPermissionsRef.current = (async () => {
        const userType = StorageManager.getItem<string>(StorageManager.KEYS.USER_TYPE);
        const isSystemUser = userType === DEFAULTS.USER_TYPE_SYSTEM;
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

  // Returns "resource:action" strings — matching the backend codename format.
  const getPermissionsList = (): string[] => {
    if (!userPermissions?.permissions) return [];
    return userPermissions.permissions
      .filter((p: any) => p?.resource && p?.action)
      .map((p: any) => `${p.resource}:${p.action}`);
  };

  const hasBackendPermission = (permission: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: any) => {
      if (p?.resource && p?.action) {
        return `${p.resource}:${p.action}` === permission;
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
