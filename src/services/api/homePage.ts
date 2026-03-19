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


  async getTestimonials(limit: number = 4): Promise<Testimonial[]> {
    try {
      const response = await apiService.get<Testimonial[]>(`/application/home/testimonials?limit=${limit}`);

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

      throw new Error('No contact info available');
    } catch (error: any) {
      console.error('[HomePage] Error fetching contact info:', error);
      throw error;
    }
  }


  async getCompanyInfo(): Promise<CompanyInfo> {
    try {
      const response = await apiService.get<HomePageData>('/application/home/all');

      if (response.success && response.data?.company) {
        return response.data.company;
      }

      throw new Error('No company info available');
    } catch (error: any) {
      console.error('[HomePage] Error fetching company info:', error);
      throw error;
    }
  }


  async getAllHomeData(): Promise<HomePageData> {
    try {
      const response = await apiService.get<HomePageData>('/application/home/all');

      if (response.success && response.data) {
        return response.data;
      }

      throw new Error('No home page data available');
    } catch (error: any) {
      console.error('[HomePage] Error fetching all home data:', error);
      throw error;
    }
  }


  async updateStats(stats: any[]): Promise<any> {
    try {
      const response = await apiService.put('/application/home/stats', { stats });

      if (response.success) {
        return response.data;
      }

      throw new Error('Failed to update stats');
    } catch (error: any) {
      console.error('[HomePage] Error updating stats:', error);
      throw error;
    }
  }


  async updateTestimonials(testimonials: any[]): Promise<any> {
    try {
      const response = await apiService.put('/application/home/testimonials', { testimonials });

      if (response.success) {
        return response.data;
      }

      throw new Error('Failed to update testimonials');
    } catch (error: any) {
      console.error('[HomePage] Error updating testimonials:', error);
      throw error;
    }
  }


  async updateContact(contact: any): Promise<any> {
    try {
      const response = await apiService.put('/application/home/contact', { contact });

      if (response.success) {
        return response.data;
      }

      throw new Error('Failed to update contact information');
    } catch (error: any) {
      console.error('[HomePage] Error updating contact:', error);
      throw error;
    }
  }


  async updateAllHomeData(data: Partial<HomePageData>): Promise<any> {
    try {
      const response = await apiService.put('/application/home/all', data);

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