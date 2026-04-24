import { apiService } from '../../utils/api';

// ============================================================================
// TYPES
// ============================================================================

export interface HomePageStat {
  title?: string;
  value?: string;
  number: number;
  suffix: string;
  label: string;
  icon: any;
  color?: string;
  bgColor?: string;
  decimals?: number;
}

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
  id?: string;
  name: string;
  role?: string;
  restaurant?: string;
  location?: string;
  rating: number;
  comment: string;
  avatar?: string;
  is_approved?: boolean;
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
  // READ
  // --------------------------------------------------------------------------

  async getStats(): Promise<HomePageStat[]> {
    try {
      const response = await apiService.get<HomePageStat[]>('/application/home/stats');
      if (response.success && response.data) return response.data;
      return [];
    } catch {
      return [];
    }
  }

  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const url = limit
        ? `/application/home/testimonials?limit=${limit}`
        : '/application/home/testimonials';
      const response = await apiService.get<any>(url);
      if (response.success && response.data) {
        // Handle both array and paginated { data: [...] } shapes
        const raw = Array.isArray(response.data)
          ? response.data
          : (response.data?.data ?? response.data?.testimonials ?? []);
        return raw.map((t: any) => ({
          id:          t.id          ?? undefined,
          name:        t.name        ?? '',
          role:        t.role        ?? '',
          restaurant:  t.restaurant  ?? '',
          location:    t.location    ?? '',
          rating:      t.rating      ?? 5,
          comment:     t.comment     ?? '',
          avatar:      t.avatar      ?? '',
          is_approved: t.is_approved ?? false,
          created_at:  t.created_at  ?? new Date().toISOString(),
        }));
      }
      return [];
    } catch {
      return [];
    }
  }

  async getContactInfo(): Promise<ContactInfo> {
    try {
      const response = await apiService.get<ContactInfo>('/application/home/contact');
      if (response.success && response.data) return response.data;
      return {};
    } catch {
      return {};
    }
  }

  async getAllHomeData(): Promise<HomePageData> {
    try {
      const response = await apiService.get<HomePageData>('/application/home/all');
      if (response.success && response.data) return response.data;
      return { stats: [], testimonials: [], contact: {} };
    } catch (error: any) {
      throw error;
    }
  }

  // --------------------------------------------------------------------------
  // WRITE
  // --------------------------------------------------------------------------

  async updateStats(stats: HomePageStat[]): Promise<HomePageStat[]> {
    try {
      const response = await apiService.put<HomePageStat[]>('/application/home/stats', { stats });
      if (response.success) return (response.data as HomePageStat[]) ?? stats;
      throw new Error(response.message || 'Failed to update stats');
    } catch (error: any) {
      throw error;
    }
  }

  async updateTestimonials(testimonials: Testimonial[]): Promise<Testimonial[]> {
    try {
      const response = await apiService.put<Testimonial[]>('/application/home/testimonials', { testimonials });
      if (response.success) return (response.data as Testimonial[]) ?? testimonials;
      throw new Error(response.message || 'Failed to update testimonials');
    } catch (error: any) {
      throw error;
    }
  }

  async updateContact(contact: ContactInfo): Promise<ContactInfo> {
    try {
      const response = await apiService.put<ContactInfo>('/application/home/contact', { contact });
      if (response.success) return (response.data as ContactInfo) ?? contact;
      throw new Error(response.message || 'Failed to update contact information');
    } catch (error: any) {
      throw error;
    }
  }

  async updateAllHomeData(data: Partial<HomePageData>): Promise<HomePageData> {
    try {
      const response = await apiService.put<HomePageData>('/application/home/all', data);
      if (response.success) return (response.data as HomePageData) ?? { stats: [], testimonials: [], contact: {} };
      throw new Error(response.message || 'Failed to update homepage data');
    } catch (error: any) {
      throw error;
    }
  }
}

export const homePageService = new HomePageService();

