/**
 * LocationTabs Component - Clean Professional Design
 *
 * Tabs for locations and areas
 */

import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Grid,
  Typography,
} from '@mui/material';
import { LocationOn, Business } from '@mui/icons-material';
import LocationCard from './LocationCard';
import AreaCard from './AreaCard';
import type { ServiceLocation, ServiceArea } from '../../../features/locations/types';

interface LocationTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  locations: ServiceLocation[];
  areas: ServiceArea[];
  onEditLocation: (location: ServiceLocation) => void;
  onDeleteLocation: (locationId: string) => void;
  onEditArea: (area: ServiceArea) => void;
  onDeleteArea: (areaId: string) => void;
  onToggleStatus: (id: string) => void;
  onGenerateQR: (locationId: string) => void;
  onPrintQR: (locationId: string) => void;
  onViewQR: (location: ServiceLocation) => void;
}

const LocationTabs: React.FC<LocationTabsProps> = ({
  activeTab,
  onTabChange,
  locations,
  areas,
  onEditLocation,
  onDeleteLocation,
  onEditArea,
  onDeleteArea,
  onToggleStatus,
  onGenerateQR,
  onPrintQR,
  onViewQR,
}) => {
  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      <Box sx={{ borderBottom: '1px solid #e2e8f0' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            px: { xs: 2, sm: 3 },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#64748b',
              '&.Mui-selected': {
                color: '#0f172a',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#0f172a',
              height: 3,
            },
          }}
        >
          <Tab label="Locations" value="locations" />
          <Tab label="Areas" value="areas" />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f1f5f9' }}>
        {activeTab === 'locations' && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {locations.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(15,23,42,0.06)',
                      margin: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocationOn sx={{ color: '#0f172a', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mb: 0.5 }}>
                    No locations found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Add a location to get started
                  </Typography>
                </Box>
              </Grid>
            ) : (
              locations.map((location) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={location.id}>
                  <LocationCard
                    location={location}
                    areaName={areas.find(a => a.id === location.areaId)?.name}
                    onEdit={onEditLocation}
                    onDelete={onDeleteLocation}
                    onToggleStatus={onToggleStatus}
                    onGenerateQR={onGenerateQR}
                    onPrintQR={onPrintQR}
                    onViewQR={onViewQR}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}

        {activeTab === 'areas' && (
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            {areas.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'rgba(15,23,42,0.06)',
                      margin: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Business sx={{ color: '#0f172a', fontSize: 28 }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0f172a', fontWeight: 600, mb: 0.5 }}>
                    No areas found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Add an area to get started
                  </Typography>
                </Box>
              </Grid>
            ) : (
              areas.map((area) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={area.id}>
                  <AreaCard
                    area={area}
                    onEdit={onEditArea}
                    onDelete={onDeleteArea}
                  />
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default LocationTabs;