# ============================================================
# apply-permissions-update.ps1
# Applies all permission-system integration changes to both
# system and app.
#
# Changes applied:
#   1. app/src/contexts/common/Auth.tsx
#      - derivePermissionsFromUser: reads payload.data (not payload.permissions)
#        for application users; stores raw {id,category,resource,action} objects
#      - derivePermissionsFromUser: system user path stores {id,category,resource,action}
#        instead of {name:perm.name} (name field no longer exists in backend)
#      - getPermissionsList: reconstructs dot-notation via category.toLowerCase()
#      - hasBackendPermission: matches via category.toLowerCase()+resource+action
#
#   2. system/src/contexts/common/Auth.tsx
#      - Same Auth.tsx fixes as above (system app copy)
#
#   3. app/src/components/auth/ProtectedRoute.tsx
#      - Added requiredPermission prop for per-route permission gating
#      - Shows inline Access Denied screen instead of redirecting to login
#
#   4. app/src/App.tsx
#      - All /admin/* routes now pass requiredPermission to ProtectedRoute
#
#   5. app/src/components/dashboards/UnifiedDashboard.tsx
#      - Added DASHBOARD_READ permission gate before rendering dashboard
#
#   6. system/src/components/layout/SystemLayout/index.tsx
#      - Added hasNoModuleAccess detection
#      - Shows "no modules assigned" notice when sidebar is empty
#
# Usage:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
#   .\apply-permissions-update.ps1
#
# The script auto-detects the repo root by looking for the
# 'system' and 'app' sibling directories.
# Override by passing -Root 'C:\path\to\frontend'
# ============================================================

param(
    [string]$Root = ''
)

# ── Locate repo root ────────────────────────────────────────
if (-not $Root) {
    $here = Split-Path -Parent $MyInvocation.MyCommand.Path
    if ((Test-Path (Join-Path $here 'system')) -and (Test-Path (Join-Path $here 'app'))) {
        $Root = $here
    } else {
        Write-Error 'Cannot find system / app siblings. Pass -Root <path>.'
        exit 1
    }
}
$Root = $Root.TrimEnd('/\').TrimEnd('\/')
Write-Host "Root: $Root" -ForegroundColor Cyan

$ok  = 0
$err = 0

function Write-File {
    param([string]$RelPath, [string]$Content)
    $dest = Join-Path $Root $RelPath.Replace('/', [IO.Path]::DirectorySeparatorChar)
    $dir  = Split-Path $dest -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    try {
        [IO.File]::WriteAllText($dest, $Content, [System.Text.Encoding]::UTF8)
        Write-Host "  [OK] $RelPath" -ForegroundColor Green
        $script:ok++
    } catch {
        Write-Host "  [FAIL] $RelPath : $_" -ForegroundColor Red
        $script:err++
    }
}

Write-Host ''
Write-Host 'Applying permission integration updates...' -ForegroundColor Yellow
Write-Host ''

# ── 1. app/src/contexts/common/Auth.tsx ────────
Write-File 'app/src/contexts/common/Auth.tsx' @'
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
      // Response shape: { success, data: [{category, resource, action, id, ...}], pagination }
      try {
        const response = await apiService.get<any>('/application/permissions');
        const payload = response.data as any;
        // The permissions array is at payload.data (not payload.permissions)
        const permissions: any[] = payload?.data ?? [];
        permissionsState = {
          role: { name: roleName },
          permissions,
          capabilities: {},
        };
      } catch {
        // Fallback: derive from embedded role permissions if API fails
        const rolePermissions: any[] = userRole?.permissions || [];
        const resolved = rolePermissions
          .filter((p: any) => typeof p === 'object' && p?.category && p?.resource && p?.action)
          .map((p: any) => ({ id: p.id, category: p.category, resource: p.resource, action: p.action }));
        permissionsState = {
          role: { name: roleName },
          permissions: resolved,
          capabilities: {},
        };
      }
    } else {
      // System user — resolve permission IDs from /system/permissions (paginated)
      const rolePermissions: any[] = userRole?.permissions || [];

      // Already-resolved objects have category + resource + action fields
      const alreadyResolved = rolePermissions
        .filter((p: any) => typeof p === 'object' && p?.category && p?.resource && p?.action)
        .map((p: any) => ({ id: p.id, category: p.category, resource: p.resource, action: p.action }));

      // Numeric/string IDs that still need to be resolved
      const ids = rolePermissions.filter((p: any) => typeof p === 'string' || typeof p === 'number');

      let resolved: any[] = [];
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
              ? { id: perm.id, category: perm.category, resource: perm.resource, action: perm.action }
              : null;
          }).filter(Boolean);
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

  // Reconstruct dot-notation as category.toLowerCase() + '.' + resource + '.' + action
  // Backend returns category in UPPERCASE ('SYSTEM', 'APPLICATION') — no 'name' field exists.
  const getPermissionsList = (): string[] => {
    if (!userPermissions?.permissions) return [];
    return userPermissions.permissions
      .filter((p: any) => p?.category && p?.resource && p?.action)
      .map((p: any) => `${p.category.toLowerCase()}.${p.resource}.${p.action}`);
  };

  const hasBackendPermission = (permission: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: any) => {
      if (p?.category && p?.resource && p?.action) {
        return `${p.category.toLowerCase()}.${p.resource}.${p.action}` === permission;
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
'@

# ── 2. system/src/contexts/common/Auth.tsx ─────────────
Write-File 'system/src/contexts/common/Auth.tsx' @'
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
      // Response shape: { success, data: [{category, resource, action, id, ...}], pagination }
      try {
        const response = await apiService.get<any>('/application/permissions');
        const payload = response.data as any;
        const permissions: any[] = payload?.data ?? [];
        permissionsState = {
          role: { name: roleName },
          permissions,
          capabilities: {},
        };
      } catch {
        // Fallback: derive from embedded role permissions if API fails
        const rolePermissions: any[] = userRole?.permissions || [];
        const resolved = rolePermissions
          .filter((p: any) => typeof p === 'object' && p?.category && p?.resource && p?.action)
          .map((p: any) => ({ id: p.id, category: p.category, resource: p.resource, action: p.action }));
        permissionsState = {
          role: { name: roleName },
          permissions: resolved,
          capabilities: {},
        };
      }
    } else {
      // System user — resolve permission IDs from /system/permissions (paginated)
      const rolePermissions: any[] = userRole?.permissions || [];

      // Already-resolved objects have category + resource + action fields
      const alreadyResolved = rolePermissions
        .filter((p: any) => typeof p === 'object' && p?.category && p?.resource && p?.action)
        .map((p: any) => ({ id: p.id, category: p.category, resource: p.resource, action: p.action }));

      // Numeric/string IDs that still need to be resolved
      const ids = rolePermissions.filter((p: any) => typeof p === 'string' || typeof p === 'number');

      let resolved: any[] = [];
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
              ? { id: perm.id, category: perm.category, resource: perm.resource, action: perm.action }
              : null;
          }).filter(Boolean);
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

  // Reconstruct dot-notation as category.toLowerCase() + '.' + resource + '.' + action
  // Backend returns category in UPPERCASE ('SYSTEM', 'APPLICATION') — no 'name' field exists.
  const getPermissionsList = (): string[] => {
    if (!userPermissions?.permissions) return [];
    return userPermissions.permissions
      .filter((p: any) => p?.category && p?.resource && p?.action)
      .map((p: any) => `${p.category.toLowerCase()}.${p.resource}.${p.action}`);
  };

  const hasBackendPermission = (permission: string): boolean => {
    if (!userPermissions?.permissions) return false;
    return userPermissions.permissions.some((p: any) => {
      if (p?.category && p?.resource && p?.action) {
        return `${p.category.toLowerCase()}.${p.resource}.${p.action}` === permission;
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
'@

# ── 3. app/src/components/auth/ProtectedRoute.tsx ──
Write-File 'app/src/components/auth/ProtectedRoute.tsx' @'
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  /** When set, the user must have this backend permission to render children.
   *  If missing, a permission-denied screen is shown instead of redirecting. */
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo, requiredPermission }) => {
  const { user, loading, isAuthenticated, hasBackendPermission } = useAuth();
  const location = useLocation();

  // Check if login bypass is enabled
  const bypassLogin = process.env.REACT_APP_BYPASS_LOGIN === 'true';

  // If bypass is enabled, skip all authentication checks
  if (bypassLogin) {
    return <>{children}</>;
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress size={60} sx={{ color: '#1976D2' }} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo || '/login'}
        state={{ from: location }}
        replace
      />
    );
  }

  // Permission gate — show inline denied screen (do not redirect to login)
  if (requiredPermission && !hasBackendPermission(requiredPermission)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          px: 3,
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(239,68,68,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <LockOutlined sx={{ fontSize: 32, color: '#ef4444' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
          Access Denied
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748b', maxWidth: 360 }}>
          You do not have permission to view this page. Contact your administrator if you believe this is a mistake.
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={() => window.history.back()}
          sx={{ mt: 1, borderRadius: 1.5, textTransform: 'none', fontWeight: 600 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
'@

# ── 4. app/src/App.tsx ─────────────────────────
Write-File 'app/src/App.tsx' @'
import React, { useEffect, memo, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';

import { GlobalErrorBoundary } from './components/errors';
import { ProtectedRoute, PermissionSync } from './components/auth';
import AppLayout from './components/layout/AppLayout';
import { AppInitializer } from './components/common';

import { AuthProvider } from './contexts/common/Auth';
import { ToastProvider } from './contexts/common/Toast';
import { SidebarProvider } from './contexts/common/Sidebar';
import { NotificationProvider } from './contexts/common/Notification';
import { WorkspaceProvider } from './contexts/application/Workspace';
import { UserDataProvider } from './contexts/application/UserData';

import { Home, Login, Register, NotFound } from './pages/common';
import {
  Dashboard as AppDashboard,
  POS,
  Catalog,
  Locations,
  Orders,
  Users,
  Coupons,
  Settings,
} from './pages/application';

import { RUNTIME_CONFIG } from './config/runtime';
import { StorageCleanup } from './utils/storage';
import { tokenRefreshScheduler } from './utils/auth';
import { apiService } from './utils/api';
import { initializePerformanceMonitoring } from './utils/performance';

const theme = createTheme({
  palette: {
    mode: (RUNTIME_CONFIG.DEFAULT_THEME as 'light' | 'dark') || 'light',
    primary: {
      main: '#1976D2',
      light: '#42A5F5',
      dark: '#1565C0',
    },
  },
});

const PublicMenu = React.lazy(() => import('./pages/public/Menu'));

// Inner component — has access to both AuthContext and RouterContext
const AppContent = memo(() => {
  return (
    <>
      <Suspense fallback={null}>
        <Routes>
          {/* Public routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/:organizationId/:tableId/menu" element={<PublicMenu />} />
          </Route>

          {/* Protected application routes */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute requiredPermission="application.dashboard.view"><AppDashboard /></ProtectedRoute>} />
            <Route path="/admin/pos" element={<ProtectedRoute requiredPermission="application.pos.view"><POS /></ProtectedRoute>} />
            <Route path="/admin/catalog" element={<ProtectedRoute requiredPermission="application.catalog.view"><Catalog /></ProtectedRoute>} />
            <Route path="/admin/locations" element={<ProtectedRoute requiredPermission="application.locations.view"><Locations /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute requiredPermission="application.orders.view"><Orders /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredPermission="application.users.view"><Users /></ProtectedRoute>} />
            <Route path="/admin/coupons" element={<ProtectedRoute requiredPermission="application.coupons.view"><Coupons /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredPermission="application.settings.view"><Settings /></ProtectedRoute>} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
});
AppContent.displayName = 'AppContent';

const AppProviders = memo(({ children }: { children: React.ReactNode }) => (
  <GlobalErrorBoundary>
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <SidebarProvider>
          <AuthProvider>
            <PermissionSync>
              <UserDataProvider>
                <AppInitializer>
                  <WorkspaceProvider>
                    <NotificationProvider>
                      {children}
                    </NotificationProvider>
                  </WorkspaceProvider>
                </AppInitializer>
              </UserDataProvider>
            </PermissionSync>
          </AuthProvider>
        </SidebarProvider>
      </ToastProvider>
    </MuiThemeProvider>
  </GlobalErrorBoundary>
));
AppProviders.displayName = 'AppProviders';

function App() {
  useEffect(() => {
    StorageCleanup.performCleanup();
    setTimeout(() => apiService.refreshConfiguration(), 200);
    tokenRefreshScheduler.start();
    initializePerformanceMonitoring();
    return () => { tokenRefreshScheduler.stop(); };
  }, []);

  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

export default App;
'@

# ── 5. app/src/components/dashboards/UnifiedDashboard.tsx ──
# (Only the permission-gate import + check are new; full file written for correctness)
Write-File 'app/src/components/dashboards/UnifiedDashboard.tsx' @'
/**
 * UnifiedDashboard
 * Top-level dashboard container: hero section with KPI tiles + TabbedDashboard
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Alert,
  Button,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  ShoppingCart,
  TableRestaurant,
  AttachMoney,
  LockOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { PERMISSIONS } from '../../types/auth/permissions';
import { useUserData } from '../../contexts/application/UserData';
import { dashboardService } from '../../services/application/dashboard.service';
import { getUserFirstName } from '../../utils/data/userUtils';
import VenueAssignmentCheck from '../common/VenueAssignmentCheck';
import TabbedDashboard from './components/TabbedDashboard';
import type { DashboardData } from '../../types/dashboard/responses';

// ── Design tokens ─────────────────────────────────────────────────────────────

const COLORS = {
  pageBg:      '#0f172a',
  cardBg:      '#1e293b',
  cardBorder:  'rgba(255,255,255,0.08)',
  textPrimary: '#f1f5f9',
  textSecond:  '#94a3b8',
  textMuted:   '#64748b',
  blue:        '#1976D2',
  lightBlue:   '#42A5F5',
  emerald:     '#10b981',
  amber:       '#f59e0b',
  rose:        '#f43f5e',
  violet:      '#8b5cf6',
} as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatINR = (value: number): string =>
  `₹${value.toLocaleString('en-IN')}`;

const formatDate = (): string =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning,';
  if (hour >= 12 && hour < 18) return 'Good afternoon,';
  return 'Good evening,';
};

// ── useCountUp ────────────────────────────────────────────────────────────────

const useCountUp = (target: number, duration = 900): number => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ── KPI Tile definition ───────────────────────────────────────────────────────

interface KpiTileDef {
  label: string;
  rawValue: number;
  displayValue?: string;
  icon: React.ReactElement;
  color: string;
  animate?: boolean;
}

// ── Hero KPI Tile ─────────────────────────────────────────────────────────────

interface HeroKpiTileProps extends KpiTileDef {}

const HeroKpiTile: React.FC<HeroKpiTileProps> = ({
  label,
  rawValue,
  displayValue,
  icon,
  color,
  animate = false,
}) => {
  const animated = useCountUp(animate ? rawValue : 0);
  const shown = displayValue ?? String(animate ? animated : rawValue);

  return (
    <Box
      sx={{
        bgcolor: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        transition: 'background 0.2s, border-color 0.2s',
        '&:hover': {
          bgcolor: 'rgba(255,255,255,0.09)',
          borderColor: 'rgba(255,255,255,0.16)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: `${color}1a`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
          flexShrink: 0,
        }}
      >
        {React.cloneElement(icon, { sx: { fontSize: 20 } })}
      </Box>
      <Typography
        sx={{
          fontWeight: 800,
          color: '#ffffff',
          fontSize: { xs: '1.5rem', md: '1.875rem' },
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {shown}
      </Typography>
      <Typography
        sx={{
          color: 'rgba(255,255,255,0.55)',
          fontSize: '0.75rem',
          fontWeight: 500,
          mt: 0.5,
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

// ── Hero KPI Skeleton ─────────────────────────────────────────────────────────

const HeroKpiSkeleton: React.FC = () => (
  <Box
    sx={{
      bgcolor: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      height: { xs: 130, md: 148 },
      '@keyframes shimmer': {
        '0%':   { opacity: 0.5 },
        '50%':  { opacity: 0.8 },
        '100%': { opacity: 0.5 },
      },
      animation: 'shimmer 1.6s ease-in-out infinite',
    }}
  />
);

// ── Content Skeleton ──────────────────────────────────────────────────────────

const ContentSkeleton: React.FC = () => (
  <Box sx={{ px: { xs: 2.5, sm: 4, md: 5 }, pt: 3, pb: 4 }}>
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '2 1 400px', height: 340 }} />
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '1 1 260px', height: 340 }} />
    </Box>
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '1 1 300px', height: 300 }} />
      <Box sx={{ bgcolor: COLORS.cardBg, border: `1px solid ${COLORS.cardBorder}`, borderRadius: '12px', flex: '1 1 300px', height: 300 }} />
    </Box>
  </Box>
);

// ── Main component ────────────────────────────────────────────────────────────

const UnifiedDashboard: React.FC<{ className?: string }> = ({ className }) => {
  const { user, hasBackendPermission } = useAuth();
  const { userData, loading: userDataLoading } = useUserData();

  const workspaceId: string =
    userData?.workspace?.id ||
    (user as any)?.workspaceId ||
    (user as any)?.workspace_id ||
    '';
  const organizationId: string = userData?.venue?.id || '';
  const venueName: string = userData?.venue?.name || 'Your Venue';
  const firstName: string = getUserFirstName(user as any) || 'there';

  const [rawData, setRawData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const isMountedRef = useRef(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(
    async (isInitial = false) => {
      if (!workspaceId) return;
      if (isInitial) setLoading(true);
      setError(null);
      try {
        const res = await dashboardService.getDashboard({
          workspaceId,
          organizationId: organizationId || undefined,
        });
        if (!isMountedRef.current) return;
        const payload = (res as any)?.data ?? res;
        setRawData(payload as DashboardData);
        setLastUpdated(new Date());
      } catch (err: any) {
        if (!isMountedRef.current) return;
        setError(err?.message || 'Failed to load dashboard data');
      } finally {
        if (isMountedRef.current && isInitial) setLoading(false);
      }
    },
    [workspaceId, organizationId],
  );

  useEffect(() => {
    if (userDataLoading || !workspaceId) return;
    isMountedRef.current = true;
    fetchData(true);
    intervalRef.current = setInterval(() => fetchData(false), 60_000);
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData, userDataLoading, workspaceId]);

  // ── Permission gate ───────────────────────────────────────────────────────────
  if (!hasBackendPermission(PERMISSIONS.DASHBOARD_READ)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          px: 3,
          textAlign: 'center',
          bgcolor: COLORS.pageBg,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'rgba(244,63,94,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 1,
          }}
        >
          <LockOutlined sx={{ fontSize: 32, color: COLORS.rose }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: COLORS.textPrimary }}>
          Access Denied
        </Typography>
        <Typography variant="body2" sx={{ color: COLORS.textSecond, maxWidth: 360 }}>
          You do not have permission to view the dashboard. Contact your administrator to request access.
        </Typography>
      </Box>
    );
  }

  // ── Error state (no data at all) ────────────────────────────────────────────
  if (!loading && error && !rawData) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 2,
          px: 3,
          bgcolor: COLORS.pageBg,
        }}
      >
        <Alert
          severity="error"
          sx={{
            maxWidth: 480,
            width: '100%',
            borderRadius: 2,
            bgcolor: 'rgba(244,63,94,0.1)',
            border: '1px solid rgba(244,63,94,0.25)',
            color: COLORS.textPrimary,
            '& .MuiAlert-icon': { color: COLORS.rose },
          }}
        >
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => fetchData(true)}
          sx={{
            borderColor: COLORS.lightBlue,
            color: COLORS.lightBlue,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            '&:hover': {
              bgcolor: 'rgba(66,165,245,0.08)',
              borderColor: COLORS.lightBlue,
            },
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  const stats = rawData?.stats;
  const todaysRevenue  = stats?.todaysRevenue      ?? 0;
  const todaysOrders   = stats?.todaysOrders        ?? 0;
  const avgOrderValue  = stats?.avgOrderValue       ?? 0;
  const tableOccupancy = stats?.tableOccupancyRate  ?? 0;

  const kpiTiles: KpiTileDef[] = [
    { label: "Today's Revenue", rawValue: todaysRevenue,  displayValue: formatINR(todaysRevenue),  icon: <AttachMoney />, color: COLORS.lightBlue },
    { label: "Today's Orders",  rawValue: todaysOrders,                                            icon: <ShoppingCart />, color: COLORS.emerald, animate: true },
    { label: 'Avg Order Value', rawValue: avgOrderValue,  displayValue: formatINR(avgOrderValue),  icon: <TrendingUp />,   color: COLORS.amber },
    { label: 'Table Occupancy', rawValue: Math.round(tableOccupancy), displayValue: `${Math.round(tableOccupancy)}%`, icon: <TableRestaurant />, color: COLORS.violet, animate: true },
  ];

  return (
    <VenueAssignmentCheck showFullPage={false}>
      <Box className={className} sx={{ bgcolor: COLORS.pageBg, minHeight: '100vh' }}>

        {/* ── Hero Section ─────────────────────────────────────────────────── */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0b1120 0%, #0d1f3c 50%, #0a3060 100%)',
            px: { xs: 2.5, sm: 4, md: 5 },
            pt: { xs: 3, md: 4 },
            pb: { xs: 3, md: 4 },
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              inset: 0,
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: 'absolute', top: -120, right: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(25,118,210,0.28) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          <Box sx={{ position: 'absolute', bottom: -80, left: -60, width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle, rgba(66,165,245,0.18) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between', gap: { xs: 2, sm: 1 }, mb: { xs: 2.5, md: 3 } }}>
              <Box>
                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.02em', lineHeight: 1, mb: 0.5 }}>{getGreeting()}</Typography>
                <Typography sx={{ fontWeight: 800, color: '#ffffff', fontSize: { xs: '1.75rem', md: '2.25rem' }, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{firstName}</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center', mt: 1.25, px: 1.25, py: 0.4, borderRadius: '20px', border: '1px solid rgba(66,165,245,0.3)', bgcolor: 'rgba(66,165,245,0.1)' }}>
                  <Typography sx={{ color: COLORS.lightBlue, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.02em' }}>{venueName}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0, pt: { sm: 0.5 } }}>
                <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontWeight: 400, display: { xs: 'none', sm: 'block' } }}>{formatDate()}</Typography>
                <IconButton onClick={() => fetchData(false)} size="small" title="Refresh dashboard" sx={{ color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px', width: 36, height: 36, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.5)' } }}>
                  <Refresh sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
              {loading && !rawData ? (
                <><HeroKpiSkeleton /><HeroKpiSkeleton /><HeroKpiSkeleton /><HeroKpiSkeleton /></>
              ) : (
                kpiTiles.map((tile) => <HeroKpiTile key={tile.label} {...tile} />)
              )}
            </Box>
          </Box>
        </Box>

        {error && rawData && (
          <Box sx={{ px: { xs: 2.5, sm: 4, md: 5 }, pt: 2 }}>
            <Alert severity="warning" onClose={() => setError(null)} sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: COLORS.textPrimary, '& .MuiAlert-icon': { color: COLORS.amber } }}>
              {error} — Showing last known data.
            </Alert>
          </Box>
        )}

        <Box sx={{ bgcolor: COLORS.pageBg }}>
          {loading && !rawData ? (
            <ContentSkeleton />
          ) : (
            <TabbedDashboard dashboardData={rawData as any} loading={loading} lastUpdated={lastUpdated} />
          )}
        </Box>

      </Box>
    </VenueAssignmentCheck>
  );
};

export default UnifiedDashboard;
'@


# ── 6. system/src/components/layout/SystemLayout/index.tsx ──
Write-File 'system/src/components/layout/SystemLayout/index.tsx' @'
import React, { useState, useMemo } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Button,
  Chip,
  Typography,
  Tooltip,
  alpha,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  AdminPanelSettings,
  People,
  Business,
  Payment,
  Settings,
  Palette,
  Logout,
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
  AccountCircle,
  QrCode2,
} from '@mui/icons-material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import DinoLogo from '../../ui/DinoLogo';
import { useAuth } from '../../../contexts/common/Auth';
import { PERMISSIONS } from '../../../types/auth/permissions';
import { ConfirmationDialog } from '../../dialogs/ConfirmationDialog';

const DRAWER_WIDTH   = 260;
const COLLAPSED_WIDTH = 68;

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  permission?: string;
  path: string;
}

const SystemLayout: React.FC = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, logout, hasBackendPermission, userPermissions } = useAuth();

  // Mobile drawer open/close
  const [mobileOpen, setMobileOpen] = useState(false);
  // Desktop sidebar collapsed (icon-only mode) — does NOT affect mobile
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const roleName = useMemo(() => {
    const name =
      userPermissions?.role?.name ||
      (user as any)?.role?.name ||
      (user as any)?.role ||
      '';
    return typeof name === 'string' ? name : '';
  }, [userPermissions, user]);

  // menuItems is memoized with empty deps since icons and paths are all static constants
  const menuItems = useMemo<MenuItem[]>(() => [
    { title: 'Dashboard',           icon: <DashboardIcon fontSize="small" />,      permission: PERMISSIONS.SYSTEM_DASHBOARD_VIEW,    path: '/system/dashboard' },
    { title: 'Users',               icon: <People fontSize="small" />,             permission: PERMISSIONS.SYSTEM_USERS_VIEW,        path: '/system/users' },
    { title: 'Billing',             icon: <Payment fontSize="small" />,            permission: PERMISSIONS.SYSTEM_BILLING_VIEW,      path: '/system/billing' },
    { title: 'Workspaces',          icon: <Business fontSize="small" />,           permission: PERMISSIONS.SYSTEM_WORKSPACES_VIEW,   path: '/system/workspaces' },
    { title: 'Roles & Permissions', icon: <AdminPanelSettings fontSize="small" />, permission: PERMISSIONS.SYSTEM_ROLES_VIEW,        path: '/system/roles-permissions' },
    { title: 'Registration Codes',  icon: <QrCode2 fontSize="small" />,            permission: PERMISSIONS.SYSTEM_REGISTRATION_VIEW, path: '/system/registration-codes' },
    { title: 'Appearance',          icon: <Palette fontSize="small" />,            permission: PERMISSIONS.SYSTEM_SETTINGS_VIEW,     path: '/system/appearance' },
    { title: 'Profile',             icon: <AccountCircle fontSize="small" />,                                                        path: '/system/profile' },
    { title: 'Settings',            icon: <Settings fontSize="small" />,           permission: PERMISSIONS.SYSTEM_SETTINGS_VIEW,     path: '/system/settings' },
  ], []);

  const availableMenuItems = useMemo(
    () => menuItems.filter(item => !item.permission || hasBackendPermission(item.permission)),
    [menuItems, hasBackendPermission],
  );

  // Items that require a permission (used to detect "no access" state)
  const permissionedItems = useMemo(
    () => menuItems.filter(item => !!item.permission),
    [menuItems],
  );
  const hasNoModuleAccess = useMemo(
    () => permissionedItems.every(item => !hasBackendPermission(item.permission!)),
    [permissionedItems, hasBackendPermission],
  );

  const handleNav = (path: string) => {
    navigate(path);
    if (mobileOpen) setMobileOpen(false);
  };

  // ── Shared nav list (used in both mobile full drawer and desktop collapsed/expanded) ──
  const navList = (isCollapsedMode: boolean) => (
    <List sx={{
      flexGrow: 1,
      overflowY: 'auto',
      overflowX: 'hidden',
      py: 1.5,
      px: isCollapsedMode ? 0.75 : 1,
      '&::-webkit-scrollbar': { width: 4 },
      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
    }}>
      {/* No-access notice — shown when user has no module view permissions */}
      {hasNoModuleAccess && !isCollapsedMode && (
        <Box sx={{ px: 1.5, py: 2, mx: 0.5, mb: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem', lineHeight: 1.5, display: 'block' }}>
            No modules are assigned to your role. Contact a system administrator to request access.
          </Typography>
        </Box>
      )}
      {availableMenuItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        const btn = (
          <ListItemButton
            key={index}
            selected={isActive}
            onClick={() => handleNav(item.path)}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              justifyContent: isCollapsedMode ? 'center' : 'flex-start',
              px: isCollapsedMode ? 1 : 1.5,
              minHeight: 40,
              '&.Mui-selected': {
                bgcolor: alpha('#ffffff', 0.15),
                '&:hover': { bgcolor: alpha('#ffffff', 0.2) },
              },
              '&:hover': { bgcolor: alpha('#ffffff', 0.08) },
            }}
          >
            <ListItemIcon sx={{ color: '#ffffff', minWidth: isCollapsedMode ? 'auto' : 36, '& svg': { fontSize: 20 } }}>
              {item.icon}
            </ListItemIcon>
            {!isCollapsedMode && (
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  sx: { color: '#ffffff', fontWeight: isActive ? 600 : 400, fontSize: '0.875rem' },
                }}
              />
            )}
          </ListItemButton>
        );

        // Wrap in Tooltip when collapsed for accessibility
        return isCollapsedMode ? (
          <Tooltip key={index} title={item.title} placement="right" arrow>
            <span>{btn}</span>
          </Tooltip>
        ) : btn;
      })}
    </List>
  );

  // ── Full sidebar content (mobile always full, desktop depends on collapsed) ──
  // isMobile: true when rendered inside the temporary mobile drawer
  const sidebarContent = (isCollapsedMode: boolean, isMobile = false) => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#0f172a' }}>

      {/* ── Logo header ── */}
      <Box sx={{
        px: isCollapsedMode ? 1 : 2.5,
        py: 2,
        borderBottom: `1px solid ${alpha('#ffffff', 0.1)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: isCollapsedMode ? 'center' : 'space-between',
        minHeight: 64,
      }}>
        {!isCollapsedMode && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <DinoLogo size={32} animated={false} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', lineHeight: 1.2 }}>
                System Admin
              </Typography>
              <Chip
                label={roleName || 'System User'}
                size="small"
                sx={{ mt: 0.5, bgcolor: alpha('#ffffff', 0.15), color: '#ffffff', fontWeight: 600, fontSize: '0.68rem', height: 18, textTransform: 'capitalize' }}
              />
            </Box>
          </Box>
        )}

        {isCollapsedMode && (
          <DinoLogo size={28} animated={false} />
        )}

        {/* Mobile: close (X) button — closes the drawer */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            size="small"
            sx={{ color: alpha('#ffffff', 0.6), flexShrink: 0, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}

        {/* Desktop expanded: collapse toggle */}
        {!isMobile && !isCollapsedMode && (
          <IconButton
            onClick={() => setCollapsed(true)}
            size="small"
            sx={{ color: alpha('#ffffff', 0.6), flexShrink: 0, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Expand button when collapsed */}
      {isCollapsedMode && (
        <Box sx={{ px: 0.75, pt: 1 }}>
          <Tooltip title="Expand sidebar" placement="right" arrow>
            <IconButton
              onClick={() => setCollapsed(false)}
              sx={{ width: '100%', borderRadius: 1.5, color: alpha('#ffffff', 0.6), '&:hover': { bgcolor: alpha('#ffffff', 0.08), color: '#ffffff' } }}
            >
              <ChevronRight fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* ── Nav list ── */}
      {navList(isCollapsedMode)}

      <Divider sx={{ borderColor: alpha('#ffffff', 0.1) }} />

      {/* ── User footer ── */}
      <Box sx={{ p: isCollapsedMode ? 0.75 : 2 }}>
        {!isCollapsedMode ? (
          <>
            {/* Clickable profile row */}
            <Box
              onClick={() => handleNav('/system/profile')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                mb: 1.5,
                px: 1,
                py: 0.75,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: alpha('#ffffff', 0.08) },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: alpha('#ffffff', 0.2), fontSize: '0.875rem', flexShrink: 0 }}>
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 600, fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email?.split('@')[0]}
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#ffffff', 0.6), fontSize: '0.6875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                  {user?.email}
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              variant="outlined"
              startIcon={<Logout fontSize="small" />}
              onClick={() => setShowLogout(true)}
              sx={{
                borderColor: alpha('#ffffff', 0.3),
                color: '#ffffff',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '0.8125rem',
                py: 0.75,
                borderRadius: 1.5,
                '&:hover': { borderColor: '#ffffff', bgcolor: alpha('#ffffff', 0.1) },
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          /* Collapsed: avatar navigates to profile, logout icon below */
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title="My Profile" placement="right" arrow>
              <Avatar
                onClick={() => handleNav('/system/profile')}
                sx={{
                  width: 34, height: 34,
                  bgcolor: alpha('#ffffff', 0.2),
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'background-color 0.15s',
                  '&:hover': { bgcolor: alpha('#ffffff', 0.35) },
                }}
              >
                {user?.email?.charAt(0).toUpperCase()}
              </Avatar>
            </Tooltip>
            <Tooltip title="Logout" placement="right" arrow>
              <IconButton
                onClick={() => setShowLogout(true)}
                sx={{ color: alpha('#ffffff', 0.6), borderRadius: 1.5, '&:hover': { bgcolor: alpha('#ffffff', 0.1), color: '#ffffff' } }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

        {/* ── Mobile drawer — always full width, no collapse ── */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              border: 'none',
              boxSizing: 'border-box',
            },
          }}
        >
          {sidebarContent(false, true)}
        </Drawer>

        {/* ── Desktop drawer — collapsible ── */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 'none',
              boxSizing: 'border-box',
              transition: 'width 0.25s ease',
              overflowX: 'hidden',
              overflowY: 'hidden',
              position: 'fixed',
              height: '100vh',
              top: 0,
              left: 0,
            },
          }}
          open
        >
          {sidebarContent(collapsed)}
        </Drawer>

        {/* ── Main content ── */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            minHeight: '100vh',
            bgcolor: '#f8fafc',
            overflowY: 'auto',
            overflowX: 'hidden',
            // On desktop shift right by sidebar width; on mobile full width with top bar offset
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
            marginLeft: { xs: 0, md: `${drawerWidth}px` },
            transition: 'margin-left 0.25s ease, width 0.25s ease',
            pt: { xs: '56px', md: 0 },
          }}
        >
          {/* ── Mobile top navbar ── */}
          <Box sx={{
            display: { xs: 'flex', md: 'none' },
            position: 'fixed',
            top: 0, left: 0, right: 0,
            height: 56,
            bgcolor: '#0f172a',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            zIndex: 1200,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
            {/* Hamburger */}
            <IconButton onClick={() => setMobileOpen(true)} sx={{ color: '#ffffff', p: 1 }}>
              <MenuIcon />
            </IconButton>

            {/* Title */}
            <Typography variant="subtitle1" sx={{ color: '#ffffff', fontWeight: 700, fontSize: '0.9375rem' }}>
              System Admin
            </Typography>

            {/* Avatar — clickable → profile */}
            <Avatar
              onClick={() => navigate('/system/profile')}
              sx={{
                width: 32, height: 32,
                bgcolor: 'rgba(255,255,255,0.15)',
                fontSize: '0.875rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: '1.5px solid rgba(255,255,255,0.25)',
                transition: 'background-color 0.15s',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.28)' },
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'S'}
            </Avatar>
          </Box>

          <Outlet />
        </Box>
      </Box>

      <ConfirmationDialog
        open={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={() => { setShowLogout(false); logout(); navigate('/login'); }}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access your account."
        confirmLabel="Logout"
        cancelLabel="Cancel"
        severity="info"
      />
    </>
  );
};

export default SystemLayout;

'@

Write-Host ''
Write-Host "Done. $ok file(s) written, $err error(s)." -ForegroundColor $(if ($err -eq 0) { 'Green' } else { 'Yellow' })
Write-Host ''
Write-Host 'Files updated:' -ForegroundColor Cyan
Write-Host '  app/src/contexts/common/Auth.tsx              — permission format fix (category.toLowerCase, payload.data)'
Write-Host '  system/src/contexts/common/Auth.tsx                   — same fix (system app copy)'
Write-Host '  app/src/components/auth/ProtectedRoute.tsx    — added requiredPermission prop + Access Denied screen'
Write-Host '  app/src/App.tsx                               — all /admin/* routes gated with requiredPermission'
Write-Host '  app/src/components/dashboards/UnifiedDashboard.tsx — DASHBOARD_READ permission gate'
Write-Host '  system/src/components/layout/SystemLayout/index.tsx   — hasNoModuleAccess notice when sidebar is empty'
Write-Host ''
