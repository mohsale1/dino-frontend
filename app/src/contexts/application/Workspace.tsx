import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Workspace, Venue, PriceRange } from '../../types';
import { personaService } from '../../services/application/persona.service';
import { apiService } from '../../utils/api';
import { useAuth } from '../common/Auth';
import { useUserData } from './UserData';
import { StorageManager } from '../../utils/storage';

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  currentVenue: Venue | null;
  workspaces: Workspace[];
  venues: Venue[];
  loading: boolean;
  workspacesLoading: boolean;
  venuesLoading: boolean;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  switchVenue: (venueId: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshVenues: () => Promise<void>;
  initializeVenueFromUser: () => Promise<void>;
  createWorkspace: (workspaceData: any) => Promise<void>;
  updateWorkspace: (workspaceId: string, workspaceData: any) => Promise<void>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  createVenue: (venueData: any) => Promise<void>;
  updateVenue: (venueId: string, venueData: any) => Promise<void>;
  deleteVenue: (venueId: string) => Promise<void>;
  activateVenue: (venueId: string) => Promise<void>;
  deactivateVenue: (venueId: string) => Promise<void>;
  toggleVenueStatus: (venueId: string, isOpen: boolean) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// ── Helper: map a raw persona/venue object to the Venue type ─────────────────
function mapToVenue(raw: any): Venue {
  const location = raw.location ?? {
    address: raw.address || '',
    city: raw.city || '',
    state: raw.state || '',
    country: raw.country || '',
    postal_code: raw.postal_code || raw.postalCode,
    landmark: undefined,
    latitude: undefined,
    longitude: undefined,
  };
  return {
    id: String(raw.id),
    name: raw.name || '',
    description: raw.description || '',
    location,
    phone: raw.phone || '',
    email: raw.email || '',
    cuisine_types: raw.cuisine_types || [],
    price_range: (raw.price_range as PriceRange) || 'mid_range',
    rating: raw.rating,
    total_reviews: raw.total_reviews,
    isActive: raw.is_active !== undefined ? Boolean(raw.is_active) : Boolean(raw.isActive ?? true),
    is_open: raw.is_open !== undefined ? Boolean(raw.is_open) : Boolean(raw.isOpen ?? false),
    workspaceId: String(raw.workspace_id || raw.workspaceId || ''),
    owner_id: String(raw.owner_id || raw.ownerId || ''),
    operating_hours: raw.operating_hours,
    createdAt: raw.created_at || raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updated_at || raw.updatedAt,
    address: location.address,
    ownerId: String(raw.owner_id || raw.ownerId || ''),
    isOpen: raw.is_open !== undefined ? Boolean(raw.is_open) : Boolean(raw.isOpen ?? false),
  } as Venue;
}

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { userData } = useUserData();

  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentVenue, setCurrentVenue]         = useState<Venue | null>(null);
  const [workspaces, setWorkspaces]             = useState<Workspace[]>([]);
  const [venues, setVenues]                     = useState<Venue[]>([]);
  const [loading, setLoading]                   = useState(false);
  const [workspacesLoading, setWorkspacesLoading] = useState(false);
  const [venuesLoading, setVenuesLoading]       = useState(false);

  const venuesLoadedRef        = useRef(false);
  const currentVenueLoadedRef  = useRef(false);
  const initializationRef      = useRef(false);

  // ── Load venues from persona API ──────────────────────────────────────────
  const loadVenues = useCallback(async (force = false) => {
    if (!isAuthenticated) return;
    if (venuesLoading) return;
    if (!force && venuesLoadedRef.current) return;

    setVenuesLoading(true);
    try {
      const res = await personaService.getPersonas({ page_size: 100 });
      const list: any[] = Array.isArray(res.data) ? res.data : [];
      const mapped = list.map(mapToVenue);
      setVenues(mapped);
      venuesLoadedRef.current = true;
      if (!currentVenue && mapped.length > 0) {
        setCurrentVenue(mapped.find(v => v.isActive) ?? mapped[0]);
      }
    } catch {
      setVenues([]);
      venuesLoadedRef.current = false;
    } finally {
      setVenuesLoading(false);
    }
  }, [isAuthenticated, venuesLoading, currentVenue]);

  // ── Load current venue from UserDataContext (no extra API call) ───────────
  const loadCurrentVenue = useCallback(async (force = false) => {
    if (!isAuthenticated) return;
    if (!force && currentVenueLoadedRef.current) return;
    if (userData?.venue) {
      setCurrentVenue(mapToVenue(userData.venue));
      currentVenueLoadedRef.current = true;
    } else {
      currentVenueLoadedRef.current = false;
    }
  }, [isAuthenticated, userData?.venue]);

  // ── Initialize ────────────────────────────────────────────────────────────
  const initializeWorkspaceData = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      initializationRef.current = false;
      return;
    }
    if (initializationRef.current) return;
    initializationRef.current = true;
    setLoading(true);
    try {
      if (user?.workspaceId) {
        const ws: any = { id: user.workspaceId, name: 'Workspace', description: '', ownerId: user.id, isActive: true, createdAt: new Date(), updatedAt: new Date() };
        setCurrentWorkspace(ws);
        setWorkspaces([ws]);
      }
      await Promise.all([loadVenues(false), loadCurrentVenue(false)]);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.workspaceId, user?.id, isAuthenticated, loadVenues, loadCurrentVenue]);

  useEffect(() => {
    if (isAuthenticated && user) {
      initializeWorkspaceData();
    } else {
      setCurrentWorkspace(null); setCurrentVenue(null);
      setWorkspaces([]); setVenues([]);
      initializationRef.current = false;
      venuesLoadedRef.current = false;
      currentVenueLoadedRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // ── Public actions ────────────────────────────────────────────────────────

  const refreshWorkspaces = async () => {
    setWorkspacesLoading(true);
    try {
      if (user?.workspaceId) {
        const ws: any = { id: user.workspaceId, name: 'Workspace', description: '', ownerId: user.id, isActive: true, createdAt: new Date(), updatedAt: new Date() };
        setWorkspaces([ws]); setCurrentWorkspace(ws);
      }
    } finally {
      setWorkspacesLoading(false);
    }
  };

  const refreshVenues = async () => {
    venuesLoadedRef.current = false;
    await loadVenues(true);
  };

  const switchWorkspace = async (workspaceId: string) => {
    const ws = workspaces.find(w => w.id === workspaceId);
    if (ws) { setCurrentWorkspace(ws); setCurrentVenue(null); StorageManager.setItem(StorageManager.KEYS.WORKSPACE, workspaceId); }
  };

  const switchVenue = async (venueId: string) => {
    const v = venues.find(v => v.id === venueId);
    if (v) { setCurrentVenue(v); StorageManager.setItem(StorageManager.KEYS.VENUE, venueId); }
  };

  // ── Workspace CRUD ────────────────────────────────────────────────────────

  const createWorkspace = async (_data: any) => {
    throw new Error('Workspace creation is handled during registration.');
  };

  const updateWorkspace = async (workspaceId: string, data: any) => {
    await apiService.put(`/application/workspaces/${workspaceId}`, {
      name: data.name,
      description: data.description,
    });
    await refreshWorkspaces();
  };

  const deleteWorkspace = async (_workspaceId: string) => {
    throw new Error('Workspace deletion is not supported.');
  };

  // ── Venue (Persona) CRUD ──────────────────────────────────────────────────

  const createVenue = async (venueData: any) => {
    const persona = await personaService.createPersona({
      name: venueData.name,
      description: venueData.description,
      address: venueData.address,
      phone: venueData.phone,
      email: venueData.email,
    });
    await refreshVenues();
    await switchVenue(String(persona.id));
  };

  const updateVenue = async (venueId: string, venueData: any) => {
    await personaService.updatePersona(Number(venueId), {
      name: venueData.name,
      description: venueData.description,
      address: venueData.address,
      phone: venueData.phone,
      email: venueData.email,
    });
    currentVenueLoadedRef.current = false;
    await Promise.all([refreshVenues(), loadCurrentVenue(true)]);
  };

  const deleteVenue = async (venueId: string) => {
    await personaService.deletePersona(Number(venueId));
    await refreshVenues();
    if (currentVenue?.id === venueId) {
      const remaining = venues.filter(v => v.id !== venueId);
      remaining.length > 0 ? await switchVenue(remaining[0].id) : setCurrentVenue(null);
    }
  };

  const activateVenue = async (venueId: string) => {
    await personaService.restorePersona(Number(venueId));
    currentVenueLoadedRef.current = false;
    await Promise.all([refreshVenues(), loadCurrentVenue(true)]);
  };

  const deactivateVenue = async (venueId: string) => {
    await personaService.deletePersona(Number(venueId));
    currentVenueLoadedRef.current = false;
    await Promise.all([refreshVenues(), loadCurrentVenue(true)]);
  };

  const toggleVenueStatus = async (venueId: string, isOpen: boolean) => {
    await personaService.setPersonaOpenStatus(Number(venueId), isOpen);
    currentVenueLoadedRef.current = false;
    await Promise.all([refreshVenues(), loadCurrentVenue(true)]);
  };

  const initializeVenueFromUser = async () => { await loadCurrentVenue(true); };

  const value: WorkspaceContextType = {
    currentWorkspace, currentVenue, workspaces, venues,
    loading, workspacesLoading, venuesLoading,
    switchWorkspace, switchVenue, refreshWorkspaces, refreshVenues,
    createWorkspace, updateWorkspace, deleteWorkspace,
    createVenue, updateVenue, deleteVenue,
    activateVenue, deactivateVenue, toggleVenueStatus,
    initializeVenueFromUser,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

export const useWorkspace = (): WorkspaceContextType => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within a WorkspaceProvider');
  return context;
};
