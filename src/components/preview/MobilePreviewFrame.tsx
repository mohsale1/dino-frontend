import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart,
  ArrowBack,
  SignalCellularAlt,
  Wifi,
  BatteryFull,
} from '@mui/icons-material';
import { MenuTemplateConfig } from '../../config/menuTemplates';
import DynamicMenuRenderer from '../menu/DynamicMenuRenderer';
import TemplateHeader from './TemplateHeader';
import TemplateCategoryFilter from './TemplateCategoryFilter';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg?: boolean;
  image?: string;
  rating?: number;
  isPopular?: boolean;
  isNew?: boolean;
  spicyLevel?: number;
}

interface MobilePreviewFrameProps {
  template: MenuTemplateConfig;
  menuItems: MenuItem[];
  venueName?: string;
  tableNumber?: string;
}

const MobilePreviewFrame: React.FC<MobilePreviewFrameProps> = ({
  template,
  menuItems,
  venueName = 'Demo Restaurant',
  tableNumber = 'T-5',
}) => {
  const theme = useTheme();
  
  // Real-time clock for status bar
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Debug: Log menu items
  console.log('📱 MobilePreviewFrame - Menu Items:', menuItems.length, menuItems);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        p: 2,
      }}
    >
      {/* Mobile Device Frame */}
      <Box
        sx={{
          width: 360,
          height: 700,
          backgroundColor: '#1c1c1e',
          borderRadius: '24px',
          padding: '12px',
          boxShadow: '0 25px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Dynamic Island / Notch */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 32,
            backgroundColor: '#000',
            borderRadius: '18px',
            zIndex: 1001,
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        />

        {/* Screen */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            backgroundColor: template.colors.background,
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Status Bar - Fixed at top */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              backgroundColor: '#ffffff',
              color: '#000000',
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              pt: 0.5,
              flexShrink: 0,
            }}
          >
            {/* Left side - Time */}
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                letterSpacing: '-0.3px',
                color: '#000000',
              }}
            >
              {formatTime(currentTime)}
            </Typography>

            {/* Right side - Network & Battery */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <SignalCellularAlt sx={{ fontSize: 16, color: '#000000' }} />
              <Wifi sx={{ fontSize: 16, color: '#000000' }} />
              <BatteryFull sx={{ fontSize: 20, color: '#000000' }} />
            </Box>
          </Box>

          {/* Scrollable Content Area */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              '&::-webkit-scrollbar': {
                width: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: alpha(template.colors.primary, 0.3),
                borderRadius: '2px',
              },
            }}
          >
            {/* Customer Navbar - Sticky */}
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                backgroundColor: template.colors.primary,
                color: 'white',
                px: 2,
                py: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                minHeight: 48,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ArrowBack sx={{ fontSize: 20 }} />
                <Typography variant="body2" fontWeight="600" sx={{ fontSize: '0.875rem' }}>
                  Menu
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: alpha('#fff', 0.2),
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <ShoppingCart sx={{ fontSize: 16 }} />
                <Typography variant="caption" fontWeight="600">
                  0
                </Typography>
              </Box>
            </Box>

            {/* Template-specific Header */}
            <Box sx={{ flexShrink: 0 }}>
              <TemplateHeader
                template={template}
                venueName={venueName}
                tableNumber={tableNumber}
              />
            </Box>

            {/* Template-specific Category Filter - Sticky */}
            <Box 
              sx={{ 
                position: 'sticky',
                top: 48,
                zIndex: 99,
                flexShrink: 0,
              }}
            >
              <TemplateCategoryFilter
                template={template}
                categories={['All', 'Pizza', 'Main Course', 'Salads', 'Desserts']}
                selectedCategory="All"
              />
            </Box>

            {/* Menu Items - Dynamic Renderer */}
            <Box 
              sx={{ 
                px: 1.5,
                py: 1,
                backgroundColor: template.colors.background,
                minHeight: 300,
              }}
            >
              {menuItems.length > 0 ? (
                <DynamicMenuRenderer
                  items={menuItems}
                  template={template}
                />
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No menu items to display
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Footer - Always at bottom */}
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                borderTop: `2px solid ${template.colors.primary}`,
                px: 2,
                py: 2.5,
                textAlign: 'center',
                flexShrink: 0,
                width: '100%',
                mt: 2,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.8rem',
                  color: template.colors.primary,
                  display: 'block',
                  mb: 0.5,
                  fontWeight: 700,
                }}
              >
                Powered by Dino
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  color: template.colors.textSecondary,
                  fontWeight: 500,
                }}
              >
                Digital Menu & Ordering System
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Home Indicator */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 140,
            height: 5,
            backgroundColor: alpha('#fff', 0.4),
            borderRadius: 3,
          }}
        />
      </Box>
    </Box>
  );
};

export default MobilePreviewFrame;