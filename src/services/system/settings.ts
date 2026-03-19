/**
 * System Settings Service
 * Handles API calls for system settings management
 */

import { apiService } from '../../utils/api';

export interface HomePageSettings {
  company?: {
    name?: string;
    tagline?: string;
    description?: string;
    founded?: string;
    mission?: string;
    vision?: string;
    logo?: string;
  };
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  social_media?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  hero?: {
    title?: string;
    subtitle?: string;
    cta_text?: string;
    cta_link?: string;
    image?: string;
    background_image?: string;
  };
  features?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
  };
  testimonials?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
  };
  stats?: {
    enabled?: boolean;
    title?: string;
  };
  faq?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
  };
  cta?: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    button_text?: string;
    button_link?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
  };
  theme?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
  };
  settings?: {
    show_login_button?: boolean;
    show_signup_button?: boolean;
    show_demo_button?: boolean;
    maintenance_mode?: boolean;
    maintenance_message?: string;
  };
}

class SystemSettingsService {
  private baseUrl = '/system/settings';

  async getHomePageSettings() {
    const response = await apiService.get(`${this.baseUrl}/homepage`);
    return response.data as any;
  }

  async updateHomePageSettings(data: HomePageSettings) {
    const response = await apiService.put(`${this.baseUrl}/homepage`, data);
    return response.data as any;
  }

  async getCompanyInfo() {
    const response = await apiService.get(`${this.baseUrl}/homepage/company`);
    return response.data as any;
  }

  async getContactInfo() {
    const response = await apiService.get(`${this.baseUrl}/homepage/contact`);
    return response.data as any;
  }
}

export const systemSettingsService = new SystemSettingsService();
export default systemSettingsService;