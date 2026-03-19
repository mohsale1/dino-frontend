import { apiService } from '../../utils/api';
import { ApiResponse } from '../../types';

export interface HomePageStat {
  number: number;
  suffix: string;
  label: string;
  icon?: any;
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
  address: {
    full: string;
    street: string;
    city: string;
    state: string;
    country: string;
    pincode: string;
  };
  phone: {
    primary: string;
    support: string;
  };
  email: {
    primary: string;
    support: string;
    sales: string;
  };
  social: {
    twitter: string;
    facebook: string;
    instagram: string;
    linkedin: string;
  };
  hours: {
    support: string;
    sales: string;
  };
}

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  website: string;
  founded: string;
  employees: string;
  headquarters: string;
}

export interface HomePageData {
  stats: HomePageStat[];
  testimonials: Testimonial[];
  contact: ContactInfo;
  company: CompanyInfo;
}

class HomePageService {
  /**
   * Get home page statistics
   */
  async getStats(): Promise<HomePageStat[]> {
    try {
      const response = await apiService.get<HomePageStat[]>('/public/home/stats');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[HomePage] Error fetching stats:', error);
      return [];
    }
  }

  /**
   * Get testimonials
   * @param limit - Maximum number of testimonials to return (default: 3)
   */
  async getTestimonials(limit: number = 4): Promise<Testimonial[]> {
    try {
      const response = await apiService.get<Testimonial[]>(`/public/home/testimonials?limit=${limit}`);
      
      if (response.success && response.data) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('[HomePage] Error fetching testimonials:', error);
      return [];
    }
  }

  /**
   * Get contact information
   */
  async getContactInfo(): Promise<ContactInfo> {
    try {
      const response = await apiService.get<ContactInfo>('/public/home/contact');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('No contact info available');
    } catch (error: any) {
      console.error('[HomePage] Error fetching contact info:', error);
      throw error;
    }
  }

  /**
   * Get company information
   */
  async getCompanyInfo(): Promise<CompanyInfo> {
    try {
      const response = await apiService.get<CompanyInfo>('/public/home/company');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('No company info available');
    } catch (error: any) {
      console.error('[HomePage] Error fetching company info:', error);
      throw error;
    }
  }

  /**
   * Get all home page data in one call
   */
  async getAllHomeData(): Promise<HomePageData> {
    try {
      const response = await apiService.get<HomePageData>('/public/home/all');
      
      if (response.success && response.data) {
        return response.data;
      }
      
      throw new Error('No home page data available');
    } catch (error: any) {
      console.error('[HomePage] Error fetching all home data:', error);
      throw error;
    }
  }

  /**
   * Update stats
   */
  async updateStats(stats: any[]): Promise<any> {
    try {
      const response = await apiService.put('/public/home/stats', { stats });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to update stats');
    } catch (error: any) {
      console.error('[HomePage] Error updating stats:', error);
      throw error;
    }
  }

  /**
   * Update testimonials
   */
  async updateTestimonials(testimonials: any[]): Promise<any> {
    try {
      const response = await apiService.put('/public/home/testimonials', { testimonials });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to update testimonials');
    } catch (error: any) {
      console.error('[HomePage] Error updating testimonials:', error);
      throw error;
    }
  }

  /**
   * Update contact information
   */
  async updateContact(contact: any): Promise<any> {
    try {
      const response = await apiService.put('/public/home/contact', { contact });
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to update contact information');
    } catch (error: any) {
      console.error('[HomePage] Error updating contact:', error);
      throw error;
    }
  }

  /**
   * Update all homepage data
   */
  async updateAllHomeData(data: Partial<HomePageData>): Promise<any> {
    try {
      const response = await apiService.put('/public/home/all', data);
      
      if (response.success) {
        return response.data;
      }
      
      throw new Error('Failed to update homepage data');
    } catch (error: any) {
      console.error('[HomePage] Error updating all home data:', error);
      throw error;
    }
  }
}

export const homePageService = new HomePageService();