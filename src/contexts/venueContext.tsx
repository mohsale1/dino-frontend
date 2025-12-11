import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { venueService, Venue } from '../services/venue';
import { useAuth } from './AuthContext';

interface VenueContextType {
  currentVenue: Venue | null;
  availableVenues: Venue[];
  loading: boolean;
  switchVenue: (venueId: string) => Promise<void>;
  refreshVenue: () => Promise<void>;
  refreshAvailableVenues: () => Promise<void>;
}

const VenueContext = createContext<VenueContextType | undefined>(undefined);

interface VenueProviderProps {
  children: ReactNode;
}

export const VenueProvider: React.FC<VenueProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [currentVenue, setCurrentVenue] = useState<Venue | null>(null);
  const [availableVenues, setAvailableVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);

  // Load venue data when user is authenticated
  useEffect(() => {
    const loadVenueData = async () => {
      if (!isAuthenticated || !user) {
        setCurrentVenue(null);
        setAvailableVenues([]);
        return;
      }

      try {
        setLoading(true);

        // Try to get cached venue first
        const cachedVenue = venueService.getCurrentVenue();
        if (cachedVenue) {
          setCurrentVenue(cachedVenue);
        } else {
          // Fetch current venue
          const venue = await venueService.fetchVenueForLogin();
          if (venue) {
            setCurrentVenue(venue);
          }
        }

        // Fetch all available venues for the user
        const venueIds = venueService.getUserVenueIds();
        if (venueIds.length > 1) {
          // Only fetch multiple venues if user has access to more than one
          const venues = await venueService.getVenuesByIds(venueIds);
          setAvailableVenues(venues);
        } else if (venueIds.length === 1 && currentVenue) {
          setAvailableVenues([currentVenue]);
        }
      } catch (error) {
        console.error('Failed to load venue data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVenueData();
  }, [isAuthenticated, user]);

  const switchVenue = useCallback(async (venueId: string): Promise<void> => {
    try {
      setLoading(true);
      const venue = await venueService.switchVenue(venueId);
      setCurrentVenue(venue);
      
      // Trigger a page reload or navigation to refresh data for new venue
      // This can be customized based on your app's needs
      window.location.reload();
    } catch (error: any) {
      console.error('Failed to switch venue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshVenue = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const venueId = venueService.getCurrentVenueId();
      if (venueId) {
        // Clear cache and fetch fresh data
        venueService.clearVenueCache();
        const venue = await venueService.getVenueById(venueId);
        setCurrentVenue(venue);
      }
    } catch (error) {
      console.error('Failed to refresh venue:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAvailableVenues = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const venueIds = venueService.getUserVenueIds();
      const venues = await venueService.getVenuesByIds(venueIds);
      setAvailableVenues(venues);
    } catch (error) {
      console.error('Failed to refresh available venues:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const value: VenueContextType = {
    currentVenue,
    availableVenues,
    loading,
    switchVenue,
    refreshVenue,
    refreshAvailableVenues,
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
};

export const useVenue = (): VenueContextType => {
  const context = useContext(VenueContext);
  if (context === undefined) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return context;
};
