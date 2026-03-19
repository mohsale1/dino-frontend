import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback, useRef } from 'react';
import { UserProfile, UserRegistration } from '../../types';
import { AuthUser, ROLES, PermissionName, RoleName } from '../../types/auth';
import { isOwner, isManager, isUser, isOperator, normalizeRole } from '../../types/auth/roles';
import { authService, PermissionService } from '../../services/common/auth';
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
  // Role-based access control methods
  hasPermission: (permission: PermissionName) => boolean;
  hasRole: (role: string) => boolean;
  canAccessRoute: (route: string) => boolean;
  isOwner: () => boolean;
  isManager: () => boolean;
  isUser: () => boolean;
  isOperator: () => boolean;
  getUserWithRole: () => AuthUser | null;
  // Permission management
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

  useEffect(() => {
    // Check for existing token on app load
    const initializeAuth = async () => {
      try {
        const token = StorageManager.getItem<string>(StorageManager.KEYS.TOKEN);
        const savedUser = StorageManager.getUserData();
        const savedPermissions = StorageManager.getPermissions();
        const userType = StorageManager.getItem<string>('user_type');
        
        if (token && savedUser) {
          // Check if token is expired
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
            
            if (savedPermissions) {
              setUserPermissions(savedPermissions);
            } else {
              const permissions = derivePermissionsFromUser(currentUser);
              setUserPermissions(permissions);
              StorageManager.setPermissions(permissions);
            }
            
            tokenRefreshScheduler.start();
          } catch (error) {
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
      } catch (error) {
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

  /**
   * Derive a permissions object from the user's role data returned by the backend.
   * Used in place of a dedicated /auth/permissions endpoint which does not exist.
   */
  const derivePermissionsFromUser = (userData: any) => {
    const userRole = userData?.role;
    const rolePermissions = userRole?.permissions || [];
    const roleName = typeof userRole === 'string' ? userRole : userRole?.name;
    return {
      role: { name: roleName },
      permissions: rolePermissions.map((p: any) =>
        typeof p === 'string' ? { name: p } : p
      ),
      capabilities: {},
    };
  };

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
        const permissions = derivePermissionsFromUser(response.user);
        setUserPermissions(permissions);
        StorageManager.setPermissions(permissions);
      } catch (permError: any) {
        console.warn('Failed to set permissions from user role:', permError);
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

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  const updateUser = async (userData: Partial<UserProfile>): Promise<void> => {
    try {
      if (!user?.id) {
        throw new Error('No authenticated user found');
      }

      // Use PUT /application/users/{id} to update profile fields
      const response = await apiService.put(`/application/users/${user.id}`, {
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
      });

      const updatedUser = normalizeUserData(response.data || userData);
      setUser(updatedUser as UserProfile);
      StorageManager.setUserData(updatedUser as UserProfile);
    } catch (error) {
      throw error;
    }
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
    let roleName: RoleName = ROLES.USER; // Default fallback
    
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

  const checkIsOwner = (): boolean => {
    return isOwner(getUserWithRole?.role);
  };

  const checkIsManager = (): boolean => {
    return isManager(getUserWithRole?.role);
  };

  const checkIsUser = (): boolean => {
    return isUser(getUserWithRole?.role);
  };

  const checkIsOperator = (): boolean => {
    return isOperator(getUserWithRole?.role);
  };

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
        // Re-fetch the current user to get fresh role/permissions data
        const currentUser = await authService.getCurrentUser();
        const permissions = derivePermissionsFromUser(currentUser);
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

  useEffect(() => {
    const initializePermissions = async () => {
      try {
        const savedPermissions = StorageManager.getPermissions();
        if (savedPermissions) {
          setUserPermissions(savedPermissions);
          return;
        }
        
        if (user && !savedPermissions && !userPermissions) {
          const token = StorageManager.getItem(StorageManager.KEYS.TOKEN);
          if (token && typeof token === 'string' && !isTokenExpired(token)) {
            try {
              // Derive permissions from the current user's role data
              const currentUser = await authService.getCurrentUser();
              const permissions = derivePermissionsFromUser(currentUser);
              setUserPermissions(permissions);
              StorageManager.setPermissions(permissions);
            } catch (error) {
              // Silent fail
            }
          }
        }
      } catch (error) {
        // Silent fail
      }
    };

    if (!loading) {
      initializePermissions();
    }
  }, [user, loading]);

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
    isOwner: checkIsOwner,
    isManager: checkIsManager,
    isUser: checkIsUser,
    isOperator: checkIsOperator,
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