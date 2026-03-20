import { apiService } from '../../utils/api';

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

// Kept for backward compatibility with existing imports
export interface CompanyInfo {
  name?: string;
  tagline?: string;
  description?: string;
  website?: string;
  founded?: string;
  employees?: string;
  headquarters?: string;
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
      const response = await apiService.get<HomePageStat[]>('/application/home/stats');
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('[HomePage] Error fetching stats:', error);
      return [];
    }
  }

  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const url = limit
        ? `/application/home/testimonials?limit=${limit}`
        : '/application/home/testimonials';
      const response = await apiService.get<Testimonial[]>(url);
      if (response.success && response.data) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('[HomePage] Error fetching testimonials:', error);
      return [];
    }
  }

  async getContactInfo(): Promise<ContactInfo> {
    try {
      const response = await apiService.get<ContactInfo>('/application/home/contact');
      if (response.success && response.data) {
        return response.data;
      }
      return {};
    } catch (error: any) {
      console.error('[HomePage] Error fetching contact info:', error);
      return {};
    }
  }

  async getAllHomeData(): Promise<HomePageData> {
    try {
      const response = await apiService.get<HomePageData>('/application/home/all');
      if (response.success && response.data) {
        return response.data;
      }
      return { stats: [], testimonials: [], contact: {} };
    } catch (error: any) {
      console.error('[HomePage] Error fetching all home data:', error);
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // WRITE — application endpoints (require application Admin role)
  // These are called from the system Appearance page using the system token.
  // PUT /application/home/stats      → { stats: [...] }
  // PUT /application/home/testimonials → { testimonials: [...] }
  // PUT /application/home/contact    → { contact: {...} }
  // --------------------------------------------------------------------------

  async updateStats(stats: HomePageStat[]): Promise<HomePageStat[]> {
    try {
      const response = await apiService.put<HomePageStat[]>('/application/home/stats', { stats });
      if (response.success) {
        return (response.data as HomePageStat[]) ?? stats;
      }
      throw new Error(response.message || 'Failed to update stats');
    } catch (error: any) {
      console.error('[HomePage] Error updating stats:', error);
      throw error;
    }
  }

  async updateTestimonials(testimonials: Testimonial[]): Promise<Testimonial[]> {
    try {
      const response = await apiService.put<Testimonial[]>('/application/home/testimonials', { testimonials });
      if (response.success) {
        return (response.data as Testimonial[]) ?? testimonials;
      }
      throw new Error(response.message || 'Failed to update testimonials');
    } catch (error: any) {
      console.error('[HomePage] Error updating testimonials:', error);
      throw error;
    }
  }

  async updateContact(contact: ContactInfo): Promise<ContactInfo> {
    try {
      const response = await apiService.put<ContactInfo>('/application/home/contact', { contact });
      if (response.success) {
        return (response.data as ContactInfo) ?? contact;
      }
      throw new Error(response.message || 'Failed to update contact information');
    } catch (error: any) {
      console.error('[HomePage] Error updating contact:', error);
      throw error;
    }
  }

  async updateAllHomeData(data: Partial<HomePageData>): Promise<HomePageData> {
    try {
      const response = await apiService.put<HomePageData>('/application/home/all', data);
      if (response.success) {
        return (response.data as HomePageData) ?? { stats: [], testimonials: [], contact: {} };
      }
      throw new Error(response.message || 'Failed to update homepage data');
    } catch (error: any) {
      console.error('[HomePage] Error updating all home data:', error);
      throw error;
    }
  }
}

export const homePageService = new HomePageService();
