import { apiService } from '../../utils/api';
import { API_ENDPOINTS } from '../../config/apiEndpoints';

// ============================================================================
// TYPES
// ============================================================================

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

// ============================================================================
// SERVICE
// ============================================================================

class HomePageService {
  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const response = await apiService.get<any>(API_ENDPOINTS.PUBLIC.HOME.TESTIMONIALS, {
        params: limit ? { limit } : undefined,
      });
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

  async updateTestimonials(testimonials: Testimonial[]): Promise<Testimonial[]> {
    const response = await apiService.put<Testimonial[]>(API_ENDPOINTS.PUBLIC.HOME.TESTIMONIALS, { testimonials });
    if (response.success) return (response.data as Testimonial[]) ?? testimonials;
    throw new Error(response.message || 'Failed to update testimonials');
  }
}

export const homePageService = new HomePageService();
