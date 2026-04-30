import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { userDataService, UserData } from '../../services/common/auth';
import { useAuth } from '../common/Auth';
import { validateVenueAccess, getVenueDisplayName as getVenueDisplayNameUtil } from '../../utils/data/venueUtils';
import StorageManager from '../../utils/storage';

interface UserDataContextType {
  // Current data
  userData: UserData | null;
  
  // Loading states
  loading: boolean;
  
  // Actions
  refreshUserData: () => Promise<void>;
  
  // Persona switching
  activePersonaId: number | null;
  switchPersona: (personaId: number) => Promise<void>;
  
  // Convenience methods
  hasPermission: (permission: string) => boolean;
  getUserRole: () => string;
  isUser: () => boolean;
  getVenueDisplayName: () => string;
  hasVenue: () => boolean;
  getWorkspaceDisplayName: () => string;
  getUserDisplayName: () => string;
  getVenueStatsSummary: () => string;
  
  // Data getters
  getUser: () => UserData['user'] | null;
  getVenue: () => UserData['venue'] | null;
  getWorkspace: () => UserData['workspace'] | null;
  getStatistics: () => any | null;
  getMenuItems: () => any[];
  getTables: () => any[];
  getRecentOrders: () => any[];
  getUsers: () => any[];
  getPermissions: () => any | null;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

interface UserDataProviderProps {
  children: ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const loadingRef = useRef(false);

  // Raw personas list cached so switchPersona can update venue instantly without a network call
  const rawPersonasRef = useRef<any[]>([]);

  const [activePersonaId, setActivePersonaId] = useState<number | null>(() => {
    const stored = localStorage.getItem('active_persona_id');
    return stored ? Number(stored) : null;
  });

  // Load user data when authenticated
  const loadUserData = useCallback(async (force: boolean = false) => {
    if (!isAuthenticated) {
      setUserData(null);
      setInitialized(true);
      loadingRef.current = false;
      return;
    }

    // System users do not have application venue data — skip this fetch entirely
    const userType = StorageManager.getItem<string>('user_type');
    if (userType === 'system') {
      setUserData(null);
      setInitialized(true);
      loadingRef.current = false;
      return;
    }

    // Check if we have a token
    const token = StorageManager.getItem<string>(StorageManager.KEYS.TOKEN);
    if (!token) {
      setUserData(null);
      setInitialized(true);
      loadingRef.current = false;
      return;
    }

    // Prevent duplicate calls - only load if forced or not already loading/loaded
    if (!force && (loadingRef.current || (userData && initialized))) {
      return;
    }

    loadingRef.current = true;
    setLoading(true);
    try {
      const data = await userDataService.getUserData();
      // Cache raw personas for instant switching
      if (data) rawPersonasRef.current = (data as any)._rawPersonas ?? [];
      setUserData(data);
      setInitialized(true);
    } catch (error: any) {
      setUserData(null);
      setInitialized(true);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated, userData, initialized]);

  // Initialize user data when authentication changes - SINGLE EFFECT ONLY
  useEffect(() => {
    if (isAuthenticated && !initialized && !loadingRef.current) {
      loadUserData(true);
    } else if (!isAuthenticated) {
      setUserData(null);
      setInitialized(false);
      loadingRef.current = false;
    }
  }, [isAuthenticated, initialized, loadUserData]);

  // Refresh user data — bypasses the debounce so status changes reflect immediately
  const refreshUserData = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await userDataService.refreshUserData();
      if (data) rawPersonasRef.current = (data as any)._rawPersonas ?? rawPersonasRef.current;
      setUserData(data);
    } catch {
      // silently ignore — stale data stays in place
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Auto-set activePersonaId from userData when not yet stored
  useEffect(() => {
    if (userData && activePersonaId === null) {
      const personaId = userData.venue?.personaId ?? null;
      if (personaId !== null && personaId !== undefined) {
        localStorage.setItem('active_persona_id', String(personaId));
        setActivePersonaId(Number(personaId));
      }
    }
  }, [userData, activePersonaId]);

  // Persona switching — instant UI update + background refresh
  const switchPersona = async (personaId: number): Promise<void> => {
    localStorage.setItem('active_persona_id', String(personaId));
    setActivePersonaId(personaId);

    // Instant update: pick the matching persona from the cached raw list
    // and update userData.venue without waiting for a network call
    const rawPersonas = rawPersonasRef.current;
    const match = rawPersonas.find((p: any) => Number(p.id) === personaId);
    if (match && userData) {
      const normalizedVenue = userDataService.normalizeVenuePublic(match);
      setUserData({ ...userData, venue: normalizedVenue });
    }

    // Background refresh to sync any server-side changes
    await refreshUserData();
  };

  // Convenience methods
  const hasPermission = (permission: string): boolean => {
    return userDataService.hasPermission(userData, permission);
  };

  const getUserRole = (): string => {
    return userDataService.getUserRole(userData);
  };

  const isUser = (): boolean => {
    return userDataService.isUser(userData);
  };

  const getVenueDisplayName = (): string => {
    return getVenueDisplayNameUtil(userData, user);
  };

  const hasVenue = (): boolean => {
    const validation = validateVenueAccess(userData, user);
    return validation.hasVenue;
  };

  const getWorkspaceDisplayName = (): string => {
    return userDataService.getWorkspaceDisplayName(userData);
  };

  const getUserDisplayName = (): string => {
    return userDataService.getUserDisplayName(userData);
  };

  const getVenueStatsSummary = (): string => {
    return userDataService.getVenueStatsSummary(userData);
  };

  // Data getters
  const getUser = () => userData?.user || null;
  const getVenue = () => userData?.venue || null;
  const getWorkspace = () => userData?.workspace || null;
  const getStatistics = () => null;
  const getMenuItems = () => [];
  const getTables = () => [];
  const getRecentOrders = () => [];
  const getUsers = () => [];
  const getPermissions = () => null;

  const value: UserDataContextType = {
    userData,
    loading,
    refreshUserData,
    activePersonaId,
    switchPersona,
    hasPermission,
    getUserRole,
    isUser,
    getVenueDisplayName,
    getWorkspaceDisplayName,
    getUserDisplayName,
    getVenueStatsSummary,
    hasVenue,
    getUser,
    getVenue,
    getWorkspace,
    getStatistics,
    getMenuItems,
    getTables,
    getRecentOrders,
    getUsers,
    getPermissions,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
};


export const useUserData = (): UserDataContextType => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};