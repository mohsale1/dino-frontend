import { apiService } from '../../utils/api';
import StorageManager from '../../utils/storage';

export interface Venue {
  id: string;
  name: string;
  description?: string;
  location?: any;
  phone?: string;
  email?: string;
  price_range?: string;
  subscription_plan?: string;
  isActive: boolean;
  theme?: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
}

class VenueService {
  /**
   * Get venue by ID
   * Fetches venue data from API and caches it
   */
  async getVenueById(venueId: string): Promise<Venue> {
    try {
      // Check cache first
      const cachedVenue = StorageManager.getVenueData();
      if (cachedVenue && cachedVenue.id === venueId) {
        return cachedVenue;
      }

      // Fetch from API
      const response = await apiService.get<Venue>(`/venues/${venueId}`);
      
      if (response.success && response.data) {
        // Cache the venue data
        StorageManager.setVenueData(response.data);
        return response.data;
      }
      
      throw new Error('Failed to fetch venue data');
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message || 'Failed to fetch venue');
    }
  }

  /**
   * Get current venue from storage
   */
  getCurrentVenue(): Venue | null {
    return StorageManager.getVenueData();
  }

  /**
   * Get current venue ID from user data
   */
  getCurrentVenueId(): string | null {
    const userData = StorageManager.getUserData();
    if (!userData) return null;

    // Handle both venue_ids array and single venue_id
    if (userData.venueIds && Array.isArray(userData.venueIds) && userData.venueIds.length > 0) {
      return userData.venueIds[0]; // Return first venue ID
    }
    
    if (userData.venueId) {
      return userData.venueId;
    }

    return null;
  }

  /**
   * Get all venue IDs for the current user
   */
  getUserVenueIds(): string[] {
    const userData = StorageManager.getUserData();
    if (!userData) return [];

    if (userData.venueIds && Array.isArray(userData.venueIds)) {
      return userData.venueIds;
    }

    if (userData.venueId) {
      return [userData.venueId];
    }

    return [];
  }

  /**
   * Switch to a different venue
   * Fetches and caches the new venue data
   */
  async switchVenue(venueId: string): Promise<Venue> {
    try {
      // Verify user has access to this venue
      const userVenueIds = this.getUserVenueIds();
      if (!userVenueIds.includes(venueId)) {
        throw new Error('You do not have access to this venue');
      }

      // Clear current venue cache
      StorageManager.clearVenueData();

      // Fetch and cache new venue
      const venue = await this.getVenueById(venueId);
      
      return venue;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to switch venue');
    }
  }

  /**
   * Fetch venue data for login
   * Called after user login to get initial venue data
   */
  async fetchVenueForLogin(): Promise<Venue | null> {
    try {
      const venueId = this.getCurrentVenueId();
      if (!venueId) {
        console.warn('No venue ID found for user');
        return null;
      }

      return await this.getVenueById(venueId);
    } catch (error) {
      console.error('Failed to fetch venue data during login:', error);
      return null;
    }
  }

  /**
   * Clear venue cache
   */
  clearVenueCache(): void {
    StorageManager.clearVenueData();
  }

  /**
   * Get multiple venues by IDs
   * Useful for users with access to multiple venues
   */
  async getVenuesByIds(venueIds: string[]): Promise<Venue[]> {
    try {
      const venues: Venue[] = [];
      
      for (const venueId of venueIds) {
        try {
          const venue = await this.getVenueById(venueId);
          venues.push(venue);
        } catch (error) {
          console.error(`Failed to fetch venue ${venueId}:`, error);
        }
      }
      
      return venues;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch venues');
    }
  }
}

export const venueService = new VenueService();

// Make venueService available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).venueService = venueService;
}