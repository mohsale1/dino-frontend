/**
 * Menu Template Configurations
 * These define how the menu page looks and behaves for customers
 */

export interface MenuTemplateConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  
  // Layout configuration
  layout: {
    type: 'grid' | 'list' | 'masonry';
    columns: { xs: number; sm: number; md: number; lg: number };
    spacing: number;
    cardStyle: 'elevated' | 'outlined' | 'flat';
  };
  
  // Color scheme
  colors: {
    primary: string;
    secondary: string;
    background: string;
    cardBackground: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
  
  // Typography
  typography: {
    headerFont: string;
    bodyFont: string;
    headerSize: string;
    bodySize: string;
    headerWeight: number;
    bodyWeight: number;
  };
  
  // Card configuration
  card: {
    borderRadius: number;
    showImage: boolean;
    imageHeight: number;
    imagePosition: 'top' | 'left' | 'right';
    showShadow: boolean;
    shadowLevel: number;
    padding: number;
    hoverEffect: 'lift' | 'glow' | 'scale' | 'none';
  };
  
  // Item display
  item: {
    showDescription: boolean;
    showPrice: boolean;
    showCategory: boolean;
    showBadges: boolean;
    showRating: boolean;
    pricePosition: 'top' | 'bottom' | 'inline';
    descriptionLines: number;
  };
  
  // Header/Hero section
  hero: {
    show: boolean;
    height: number;
    background: string;
    showVenueInfo: boolean;
    showSearch: boolean;
  };
  
  // Header configuration
  header: {
    showLogo: boolean;
    logoSize: 'small' | 'medium' | 'large';
    showRating: boolean;
    showLocation: boolean;
    showDeliveryTime: boolean;
    showDescription: boolean;
    style: 'classic' | 'modern' | 'minimal' | 'elegant';
  };
  
  // Filter/Category configuration
  filter: {
    style: 'chips' | 'icons' | 'text' | 'images';
    showIcons: boolean;
    showImages: boolean;
  };
}

export const menuTemplates: Record<string, MenuTemplateConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic Grid',
    description: 'Traditional grid layout with cards and images',
    icon: '🏛️',
    color: '#2196F3',
    
    layout: {
      type: 'grid',
      columns: { xs: 1, sm: 2, md: 3, lg: 4 },
      spacing: 1.5,
      cardStyle: 'elevated',
    },
    
    colors: {
      primary: '#2196F3', // Blue - consistent across all templates
      secondary: '#1976D2',
      background: '#F5F5F5',
      cardBackground: '#FFFFFF',
      textPrimary: '#212121',
      textSecondary: '#757575',
      accent: '#2196F3',
    },
    
    typography: {
      headerFont: 'Roboto, sans-serif',
      bodyFont: 'Roboto, sans-serif',
      headerSize: '1.25rem',
      bodySize: '0.875rem',
      headerWeight: 600,
      bodyWeight: 400,
    },
    
    card: {
      borderRadius: 12,
      showImage: true,
      imageHeight: 200,
      imagePosition: 'top',
      showShadow: true,
      shadowLevel: 2,
      padding: 16,
      hoverEffect: 'lift',
    },
    
    item: {
      showDescription: true,
      showPrice: true,
      showCategory: true,
      showBadges: true,
      showRating: true,
      pricePosition: 'bottom',
      descriptionLines: 2,
    },
    
    hero: {
      show: true,
      height: 200,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      showVenueInfo: true,
      showSearch: true,
    },
    
    header: {
      showLogo: true,
      logoSize: 'medium',
      showRating: true,
      showLocation: true,
      showDeliveryTime: true,
      showDescription: false,
      style: 'classic',
    },
    
    filter: {
      style: 'chips',
      showIcons: true,
      showImages: false,
    },
  },

  modern: {
    id: 'modern',
    name: 'Modern List',
    description: 'Clean list view with horizontal cards',
    icon: '🚀',
    color: '#2196F3', // Blue - consistent
    
    layout: {
      type: 'list',
      columns: { xs: 1, sm: 1, md: 1, lg: 1 },
      spacing: 1.5,
      cardStyle: 'outlined',
    },
    
    colors: {
      primary: '#2196F3', // Blue - consistent
      secondary: '#1976D2',
      background: '#F5F5F5',
      cardBackground: '#FFFFFF',
      textPrimary: '#212121',
      textSecondary: '#757575',
      accent: '#2196F3',
    },
    
    typography: {
      headerFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      headerSize: '1.5rem',
      bodySize: '1rem',
      headerWeight: 700,
      bodyWeight: 400,
    },
    
    card: {
      borderRadius: 8,
      showImage: true,
      imageHeight: 120,
      imagePosition: 'left',
      showShadow: false,
      shadowLevel: 0,
      padding: 20,
      hoverEffect: 'glow',
    },
    
    item: {
      showDescription: true,
      showPrice: true,
      showCategory: false,
      showBadges: true,
      showRating: false,
      pricePosition: 'inline',
      descriptionLines: 3,
    },
    
    hero: {
      show: true,
      height: 150,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      showVenueInfo: true,
      showSearch: true,
    },
    
    header: {
      showLogo: false,
      logoSize: 'small',
      showRating: false,
      showLocation: false,
      showDeliveryTime: false,
      showDescription: false,
      style: 'modern',
    },
    
    filter: {
      style: 'icons',
      showIcons: true,
      showImages: false,
    },
  },

  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Simple text-focused design with minimal images',
    icon: '⚪',
    color: '#2196F3', // Blue - consistent
    
    layout: {
      type: 'list',
      columns: { xs: 1, sm: 1, md: 2, lg: 2 },
      spacing: 1.5,
      cardStyle: 'flat',
    },
    
    colors: {
      primary: '#2196F3', // Blue - consistent
      secondary: '#1976D2',
      background: '#F5F5F5',
      cardBackground: '#FFFFFF',
      textPrimary: '#212121',
      textSecondary: '#757575',
      accent: '#2196F3',
    },
    
    typography: {
      headerFont: 'Georgia, serif',
      bodyFont: 'system-ui, sans-serif',
      headerSize: '1.125rem',
      bodySize: '0.875rem',
      headerWeight: 500,
      bodyWeight: 400,
    },
    
    card: {
      borderRadius: 0,
      showImage: false,
      imageHeight: 80,
      imagePosition: 'left',
      showShadow: false,
      shadowLevel: 0,
      padding: 12,
      hoverEffect: 'none',
    },
    
    item: {
      showDescription: true,
      showPrice: true,
      showCategory: true,
      showBadges: false,
      showRating: false,
      pricePosition: 'inline',
      descriptionLines: 1,
    },
    
    hero: {
      show: false,
      height: 100,
      background: '#FFFFFF',
      showVenueInfo: true,
      showSearch: false,
    },
    
    header: {
      showLogo: false,
      logoSize: 'small',
      showRating: false,
      showLocation: false,
      showDeliveryTime: false,
      showDescription: false,
      style: 'minimal',
    },
    
    filter: {
      style: 'text',
      showIcons: false,
      showImages: false,
    },
  },

  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Sophisticated layout with large images',
    icon: '✨',
    color: '#2196F3', // Blue - consistent
    
    layout: {
      type: 'grid',
      columns: { xs: 1, sm: 2, md: 2, lg: 3 },
      spacing: 1.5,
      cardStyle: 'elevated',
    },
    
    colors: {
      primary: '#2196F3', // Blue - consistent
      secondary: '#1976D2',
      background: '#F5F5F5',
      cardBackground: '#FFFFFF',
      textPrimary: '#212121',
      textSecondary: '#757575',
      accent: '#2196F3',
    },
    
    typography: {
      headerFont: 'Playfair Display, serif',
      bodyFont: 'Lato, sans-serif',
      headerSize: '1.5rem',
      bodySize: '0.9375rem',
      headerWeight: 700,
      bodyWeight: 400,
    },
    
    card: {
      borderRadius: 16,
      showImage: true,
      imageHeight: 280,
      imagePosition: 'top',
      showShadow: true,
      shadowLevel: 4,
      padding: 24,
      hoverEffect: 'scale',
    },
    
    item: {
      showDescription: true,
      showPrice: true,
      showCategory: false,
      showBadges: true,
      showRating: true,
      pricePosition: 'bottom',
      descriptionLines: 3,
    },
    
    hero: {
      show: true,
      height: 250,
      background: 'linear-gradient(135deg, #1A1A1A 0%, #3D3D3D 100%)',
      showVenueInfo: true,
      showSearch: true,
    },
    
    header: {
      showLogo: true,
      logoSize: 'large',
      showRating: true,
      showLocation: true,
      showDeliveryTime: true,
      showDescription: true,
      style: 'elegant',
    },
    
    filter: {
      style: 'images',
      showIcons: false,
      showImages: true,
    },
  },
};

export const getTemplateConfig = (templateId: string): MenuTemplateConfig => {
  return menuTemplates[templateId] || menuTemplates.classic;
};

export const getTemplatesList = () => {
  return Object.values(menuTemplates);
};
