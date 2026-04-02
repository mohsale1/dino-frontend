/**
 * LocationTabs Component - Clean Professional Design
 *
 * Tabs for locations and areas
 */

import React from 'react';
import {
  Box,
  Paper,
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
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
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
                color: '#1976d2',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
            },
          }}
        >
          <Tab label="Locations" value="locations" />
          <Tab label="Areas" value="areas" />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, sm: 3 } }}>
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
                      bgcolor: 'rgba(25,118,210,0.08)',
                      margin: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <LocationOn sx={{ color: '#1976d2', fontSize: 28 }} />
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
                      bgcolor: 'rgba(25,118,210,0.08)',
                      margin: 'auto',
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Business sx={{ color: '#1976d2', fontSize: 28 }} />
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
    </Paper>
  );
};

export default LocationTabs;
