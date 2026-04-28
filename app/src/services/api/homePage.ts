import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

// ============================================================================
// TYPES — aligned with the actual backend homepage_info collection structure
// ============================================================================

export interface HomePageStat {
  // Backend fields
  title?: string;
  value?: string;
  number: number;
  suffix: string;
  label: string;
  // API returns icon as a string name (e.g. 'restaurant'); Stats.tsx maps it to a component
  icon: any;
  // UI-only fields used by DEFAULT_STATS fallback in Stats.tsx
  color?: string;
  bgColor?: string;
  decimals?: number;
}


export interface Testimonial {
  name: string;
  role?: string;
  restaurant?: string;
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
  created_at?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
}

export interface HomePageData {
  stats: HomePageStat[];
  testimonials: Testimonial[];
  contact: ContactInfo;
}

// ============================================================================
// SERVICE
// ============================================================================

class HomePageService {
  // --------------------------------------------------------------------------
  // READ — public application endpoints (no auth required)
  // --------------------------------------------------------------------------

  async getStats(): Promise<HomePageStat[]> {
    try {
      const response = await apiService.get<HomePageStat[]>(API_ENDPOINTS.PUBLIC.HOME.STATS);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const response = await apiService.get<Testimonial[]>(
        API_ENDPOINTS.PUBLIC.HOME.TESTIMONIALS,
        { params: limit ? { limit } : undefined }
      );
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch {
      return [];
    }
  }

  async getContactInfo(): Promise<ContactInfo> {
    try {
      const response = await apiService.get<ContactInfo>(API_ENDPOINTS.PUBLIC.HOME.CONTACT);
      if (response.success && response.data) {
        return response.data;
      }
      return {};
    } catch {
      return {};
    }
  }

  async getAllHomeData(): Promise<HomePageData> {
    try {
      const response = await apiService.get<HomePageData>(API_ENDPOINTS.PUBLIC.HOME.ALL);
      if (response.success && response.data) {
        return response.data;
      }
      return { stats: [], testimonials: [], contact: {} };
    } catch (error: any) {
      throw error;
    }
  }


  async updateStats(stats: HomePageStat[]): Promise<HomePageStat[]> {
    const response = await apiService.put<HomePageStat[]>(API_ENDPOINTS.PUBLIC.HOME.STATS, { stats });
    if (response.success) {
      return (response.data as HomePageStat[]) ?? stats;
    }
    throw new Error(response.message || 'Failed to update stats');
  }


  async updateTestimonials(testimonials: Testimonial[]): Promise<Testimonial[]> {
    const response = await apiService.put<Testimonial[]>(API_ENDPOINTS.PUBLIC.HOME.TESTIMONIALS, { testimonials });
    if (response.success) {
      return (response.data as Testimonial[]) ?? testimonials;
    }
    throw new Error(response.message || 'Failed to update testimonials');
  }


  async updateContact(contact: ContactInfo): Promise<ContactInfo> {
    const response = await apiService.put<ContactInfo>(API_ENDPOINTS.PUBLIC.HOME.CONTACT, { contact });
    if (response.success) {
      return (response.data as ContactInfo) ?? contact;
    }
    throw new Error(response.message || 'Failed to update contact information');
  }


  async updateAllHomeData(data: Partial<HomePageData>): Promise<HomePageData> {
    const response = await apiService.put<HomePageData>(API_ENDPOINTS.PUBLIC.HOME.ALL, data);
    if (response.success) {
      return (response.data as HomePageData) ?? { stats: [], testimonials: [], contact: {} };
    }
    throw new Error(response.message || 'Failed to update homepage data');
  }

}

export const homePageService = new HomePageService();
