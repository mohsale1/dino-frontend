/**
 * useLocations Hook
 * Manages service locations and areas state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { locationService } from '../services';
import type { ServiceLocation, ServiceArea, ServiceLocationCreate, ServiceLocationUpdate, ServiceAreaCreate, ServiceAreaUpdate } from '../types';

export interface UseLocationsOptions {
  workspaceId: string;
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

export function useLocations({ workspaceId, autoLoad = true }: UseLocationsOptions): UseLocationsResult {
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [areasLoading, setAreasLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load areas
  const loadAreas = useCallback(async () => {
    if (!workspaceId) return;
    
    setAreasLoading(true);
    setError(null);
    
    try {
      const data = await locationService.getVenueAreas(workspaceId);
      setAreas(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load areas');
    } finally {
      setAreasLoading(false);
    }
  }, [workspaceId]);

  // Load locations
  const loadLocations = useCallback(async (_areaId?: string) => {
    if (!workspaceId) return;
    
    setLocationsLoading(true);
    setError(null);
    
    try {
      const data = await locationService.getVenueTables(workspaceId);
      setLocations(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load locations');
    } finally {
      setLocationsLoading(false);
    }
  }, [workspaceId]);

  // Create location
  const createLocation = useCallback(async (data: ServiceLocationCreate) => {
    setError(null);
    
    try {
      await locationService.createTable(data);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to create location');
      throw err;
    }
  }, [loadLocations]);

  // Update location
  const updateLocation = useCallback(async (id: string, data: ServiceLocationUpdate) => {
    setError(null);
    
    try {
      await locationService.updateTable(id, data);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to update location');
      throw err;
    }
  }, [loadLocations]);

  // Delete location
  const deleteLocation = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await locationService.deleteTable(id);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete location');
      throw err;
    }
  }, [loadLocations]);

  // Toggle location status (delegates to updateTableStatus)
  const toggleLocationStatus = useCallback(async (id: string, isActive: boolean) => {
    setError(null);
    
    try {
      const newStatus = isActive ? 'available' : 'out_of_service';
      await locationService.updateTableStatus(id, newStatus);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status');
      throw err;
    }
  }, [loadLocations]);

  // Update location status
  const updateLocationStatus = useCallback(async (id: string, status: 'available' | 'occupied' | 'reserved' | 'out_of_service') => {
    setError(null);
    
    try {
      await locationService.updateTableStatus(id, status);
      await loadLocations();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      throw err;
    }
  }, [loadLocations]);

  // Generate QR code
  const generateQRCode = useCallback(async (id: string): Promise<string> => {
    setError(null);
    
    try {
      const response = await locationService.getQRCode(id);
      return response.qr_code_url ?? response.qr_code;
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
      throw err;
    }
  }, []);

  // Create area
  const createArea = useCallback(async (data: ServiceAreaCreate) => {
    setError(null);
    
    try {
      await locationService.createArea(data);
      await loadAreas();
    } catch (err: any) {
      setError(err.message || 'Failed to create area');
      throw err;
    }
  }, [loadAreas]);

  // Update area
  const updateArea = useCallback(async (id: string, data: ServiceAreaUpdate) => {
    setError(null);
    
    try {
      await locationService.updateArea(id, data);
      await loadAreas();
    } catch (err: any) {
      setError(err.message || 'Failed to update area');
      throw err;
    }
  }, [loadAreas]);

  // Delete area
  const deleteArea = useCallback(async (id: string) => {
    setError(null);
    
    try {
      await locationService.deleteArea(id);
      await loadAreas();
      await loadLocations(); // Reload locations as they might be affected
    } catch (err: any) {
      setError(err.message || 'Failed to delete area');
      throw err;
    }
  }, [loadAreas, loadLocations]);

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
    if (autoLoad && workspaceId) {
      refresh();
    }
  }, [autoLoad, workspaceId]); // Only run on mount or workspaceId change

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
