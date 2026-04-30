/**
 * useLocations Hook
 * Manages service locations and areas state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services';
import type { ServiceLocation, ServiceArea, ServiceLocationCreate, ServiceLocationUpdate, ServiceAreaCreate, ServiceAreaUpdate } from '../types';

export interface UseLocationsOptions {
  workspaceId?: string;
  personaId?: number;
  autoLoad?: boolean;
}


export interface UseLocationsResult {
  // Data
  locations: ServiceLocation[];
  areas: ServiceArea[];
  
  // Loading states
  loading: boolean;
  locationsLoading: boolean;
  areasLoading: boolean;
  
  // Error states
  error: string | null;
  
  // Location operations
  loadLocations: (areaId?: string) => Promise<void>;
  createLocation: (data: ServiceLocationCreate) => Promise<void>;
  updateLocation: (id: string, data: ServiceLocationUpdate) => Promise<void>;
  deleteLocation: (id: string) => Promise<void>;
  toggleLocationStatus: (id: string, isActive: boolean) => Promise<void>;
  updateLocationStatus: (id: string, status: 'available' | 'occupied' | 'reserved' | 'out_of_service') => Promise<void>;
  generateQRCode: (id: string) => Promise<string>;
  
  // Area operations
  loadAreas: () => Promise<void>;
  createArea: (data: ServiceAreaCreate) => Promise<void>;
  updateArea: (id: string, data: ServiceAreaUpdate) => Promise<void>;
  deleteArea: (id: string) => Promise<void>;
  
  // Utility
  getAreaName: (areaId: string) => string;
  refresh: () => Promise<void>;
}

export function useLocations({ workspaceId: _workspaceId, personaId, autoLoad = true }: UseLocationsOptions): UseLocationsResult {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load areas
  const loadAreas = useCallback(async () => {
    if (!personaId) return;
    
    setAreasLoading(true);
    setError(null);
    
    try {
      const data = await locationService.getVenueAreas(personaId);
      setAreas(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load areas');
    } finally {
      setAreasLoading(false);
    }
  }, [personaId]);

  // Load locations
  const loadLocations = useCallback(async (_areaId?: string) => {
    if (!personaId) return;
    
    setLocationsLoading(true);
    setError(null);
    
    try {
      const data = await locationService.getTables(personaId);
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load locations');
    } finally {
      setLocationsLoading(false);
    }
  }, [personaId]);

  // Create location
  const createLocation = useCallback(async (data: ServiceLocationCreate) => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.createTable(personaId, data as any);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to create location');
      throw err;
    }
  }, [personaId, loadLocations]);

  // Update location
  const updateLocation = useCallback(async (id: string, data: ServiceLocationUpdate) => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.updateTable(id, personaId, data as any);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to update location');
      throw err;
    }
  }, [personaId, loadLocations]);

  // Delete location
  const deleteLocation = useCallback(async (id: string) => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.deleteTable(id, personaId);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete location');
      throw err;
    }
  }, [personaId, loadLocations]);

  // Toggle location status (delegates to updateTableStatus)
  const toggleLocationStatus = useCallback(async (id: string, isActive: boolean) => {
    if (!personaId) return;
    setError(null);
    
    try {
      const newStatus = isActive ? 'available' : 'out_of_service';
      await locationService.updateTableStatus(id, personaId, newStatus);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status');
      throw err;
    }
  }, [personaId, loadLocations]);

  // Update location status
  const updateLocationStatus = useCallback(async (id: string, status: 'available' | 'occupied' | 'reserved' | 'out_of_service') => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.updateTableStatus(id, personaId, status);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      throw err;
    }
  }, [personaId, loadLocations]);

  // Generate QR code
  const generateQRCode = useCallback(async (id: string): Promise<string> => {
    if (!personaId) throw new Error('No persona ID');
    setError(null);
    
    try {
      const response = await locationService.getQRCode(id, personaId);
      return response.qr_code_url ?? response.qr_code;
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
      throw err;
    }
  }, [personaId]);

  // Create area
  const createArea = useCallback(async (data: ServiceAreaCreate) => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.createArea({ ...data, persona_id: personaId });
      await loadAreas();
    } catch (err: any) {
      setError(err.message || 'Failed to create area');
      throw err;
    }
  }, [personaId, loadAreas]);

  // Update area
  const updateArea = useCallback(async (id: string, data: ServiceAreaUpdate) => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.updateArea(id, personaId, data);
      await loadAreas();
    } catch (err: any) {
      setError(err.message || 'Failed to update area');
      throw err;
    }
  }, [personaId, loadAreas]);

  // Delete area
  const deleteArea = useCallback(async (id: string) => {
    if (!personaId) return;
    setError(null);
    
    try {
      await locationService.deleteArea(id, personaId);
      await loadAreas();
      await loadLocations(); // Reload locations as they might be affected
    } catch (err: any) {
      setError(err.message || 'Failed to delete area');
      throw err;
    }
  }, [personaId, loadAreas, loadLocations]);

  // Get area name by ID
  const getAreaName = useCallback((areaId: string): string => {
    const area = areas.find(a => a.id === areaId);
    return area?.name || 'Unknown';
  }, [areas]);

  // Refresh all data
  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadAreas(), loadLocations()]);
    setLoading(false);
  }, [loadAreas, loadLocations]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && personaId) {
      refresh();
    }
  }, [autoLoad, personaId]); // Only run on mount or personaId change

  return {
    // Data
    locations,
    areas,
    
    // Loading states
    loading: loading || locationsLoading || areasLoading,
    locationsLoading,
    areasLoading,
    
    // Error state
    error,
    
    // Location operations
    loadLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    toggleLocationStatus,
    updateLocationStatus,
    generateQRCode,
    
    // Area operations
    loadAreas,
    createArea,
    updateArea,
    deleteArea,
    
    // Utility
    getAreaName,
    refresh,
  };
}


export default useLocations;