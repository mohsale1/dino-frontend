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
} from '@mui/material';
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
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ borderBottom: '1px solid #e5e7eb' }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => onTabChange(newValue)}
          sx={{
            px: 2,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#6b7280',
              '&.Mui-selected': {
                color: '#1a1a1a',
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: '#1a1a1a',
              height: 3,
            },
          }}
        >
          <Tab label="Locations" value="locations" />
          <Tab label="Areas" value="areas" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {activeTab === 'locations' && (
          <Grid container spacing={2}>
            {locations.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                    No locations found
                  </Box>
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
          <Grid container spacing={2}>
            {areas.length === 0 ? (
              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Box sx={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                    No areas found
                  </Box>
                </Box>
              </Grid>
            ) : (
              areas.map((area) => (
                <Grid item xs={12} sm={6} md={4} key={area.id}>
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