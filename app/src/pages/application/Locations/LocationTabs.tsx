/**
 * LocationTabs Component
 *
 * Two-tab layout: Locations grid and Areas grid.
 * Area filter chips are intentionally absent (area is no longer a field on the
 * location form), but the Areas tab and all area management functionality are
 * fully present.
 */

import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import {
  QrCode2 as QrCodeIcon,
  Print as PrintIcon,
  GridView as GridViewIcon,
  LocationOn as LocationOnIcon,
} from '@mui/icons-material';
import LocationCard from './LocationCard';
import AreaCard from './AreaCard';
import type { ServiceLocation, ServiceArea } from '../../../features/locations/types';

// ─── Props ─────────────────────────────────────────────────────────────────────

interface LocationTabsProps {
  // Locations
  locations: ServiceLocation[];
  searchQuery: string;
  filterStatus: string;
  onEditLocation: (location: ServiceLocation) => void;
  onDeleteLocation: (locationId: string) => void;
  onToggleStatus: (id: string) => void;
  onViewQR: (location: ServiceLocation) => void;
  onBulkPrintQR: () => void;
  // Areas
  areas: ServiceArea[];
  onEditArea: (area: ServiceArea) => void;
  onDeleteArea: (areaId: string) => void;
  // Tab control
  activeTab: number;
  onTabChange: (tab: number) => void;
}

// ─── Empty State ───────────────────────────────────────────────────────────────

const EmptyState: React.FC<{ icon: React.ReactElement; title: string; subtitle: string }> = ({
  icon,
  title,
  subtitle,
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 6, sm: 10 },
      px: 3,
      textAlign: 'center',
    }}
  >
    <Box
      sx={{
        width: { xs: 56, sm: 64 },
        height: { xs: 56, sm: 64 },
        borderRadius: 2.5,
        bgcolor: '#f7f9fa',
        border: '1px solid #e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mb: 2.5,
        color: '#999999',
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 30 } })}
    </Box>
    <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '1rem', mb: 0.75 }}>
      {title}
    </Typography>
    <Typography sx={{ color: '#666666', fontSize: '0.875rem', maxWidth: 320 }}>
      {subtitle}
    </Typography>
  </Box>
);

// ─── Tab label with count badge ────────────────────────────────────────────────

const TabLabel: React.FC<{ label: string; count: number }> = ({ label, count }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
    <span>{label}</span>
    <Box
      sx={{
        minWidth: 20,
        height: 20,
        px: 0.75,
        borderRadius: 10,
        bgcolor: '#e0e0e0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: '#666666', lineHeight: 1 }}>
        {count}
      </Typography>
    </Box>
  </Box>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const LocationTabs: React.FC<LocationTabsProps> = ({
  locations,
  searchQuery,
  filterStatus,
  onEditLocation,
  onDeleteLocation,
  onToggleStatus,
  onViewQR,
  onBulkPrintQR,
  areas,
  onEditArea,
  onDeleteArea,
  activeTab,
  onTabChange,
}) => {
  // ── Filter locations ──────────────────────────────────────────────────────
  const filteredLocations = locations.filter((l) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      (l.name ?? '').toLowerCase().includes(q) ||
      l.identifier.toLowerCase().includes(q) ||
      (l.description ?? '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // ── Filter areas ──────────────────────────────────────────────────────────
  const filteredAreas = areas.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      a.name.toLowerCase().includes(q) ||
      (a.description ?? '').toLowerCase().includes(q);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'available' && a.isActive) ||
      (filterStatus === 'maintenance' && !a.isActive);
    return matchSearch && matchStatus;
  });

  // ── Location count per area ───────────────────────────────────────────────
  const locationCountByArea = (areaId: string): number =>
    locations.filter((l) => l.areaId === areaId).length;

  return (
    <Box sx={{ bgcolor: '#ffffff' }}>
      {/* ── Tab bar ─────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          borderBottom: '1px solid #e0e0e0',
          bgcolor: '#ffffff',
          px: { xs: 2, sm: 3 },
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_e, v) => onTabChange(v as number)}
          sx={{
            minHeight: { xs: 40, sm: 44 },
            '& .MuiTabs-indicator': {
              height: 2,
              borderRadius: '2px 2px 0 0',
              bgcolor: '#1C1C1E',
            },
            '& .MuiTab-root': {
              minHeight: { xs: 40, sm: 44 },
              textTransform: 'none',
              fontWeight: 600,
              fontSize: { xs: '0.8125rem', sm: '0.875rem' },
              color: '#666666',
              px: { xs: 1, sm: 1.5 },
              py: 0,
              '&.Mui-selected': { color: '#1C1C1E' },
            },
          }}
        >
          <Tab
            icon={<GridViewIcon sx={{ fontSize: 16, display: { xs: 'none', sm: 'flex' } }} />}
            iconPosition="start"
            label={<TabLabel label="Locations" count={locations.length} />}
          />
          <Tab
            icon={<LocationOnIcon sx={{ fontSize: 16, display: { xs: 'none', sm: 'flex' } }} />}
            iconPosition="start"
            label={<TabLabel label="Areas" count={areas.length} />}
          />
        </Tabs>
      </Box>

      {/* ── Locations tab ───────────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <>
          {/* Toolbar */}
          <Box
            sx={{
              px: { xs: 2, sm: 3 },
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
              borderBottom: '1px solid #e0e0e0',
              bgcolor: '#f7f9fa',
            }}
          >
            <Typography
              sx={{
                fontSize: '0.75rem',
                color: '#999999',
                fontWeight: 500,
              }}
            >
              {filteredLocations.length} location{filteredLocations.length !== 1 ? 's' : ''}
            </Typography>
            {filteredLocations.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon sx={{ fontSize: 15 }} />}
                onClick={onBulkPrintQR}
                sx={{
                  flexShrink: 0,
                  height: 30,
                  px: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  borderRadius: 1.5,
                  color: '#1C1C1E',
                  borderColor: '#cbd5e1',
                  bgcolor: '#ffffff',
                  '&:hover': {
                    borderColor: '#1976D2',
                    bgcolor: '#f8fafc',
                  },
                }}
              >
                Print All QRs
              </Button>
            )}
          </Box>

          {/* Grid */}
          <Box sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: '#f8fafc' }}>
            {filteredLocations.length === 0 ? (
              <EmptyState
                icon={<QrCodeIcon />}
                title={locations.length === 0 ? 'No locations yet' : 'No results found'}
                subtitle={
                  locations.length === 0
                    ? 'Add your first location to start generating QR codes for your tables.'
                    : 'Try adjusting your search or filter to find what you are looking for.'
                }
              />
            ) : (
              <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }} alignItems="stretch">
                {filteredLocations.map((location) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={location.id} sx={{ display: 'flex' }}>
                    <LocationCard
                      location={location}
                      onEdit={onEditLocation}
                      onDelete={onDeleteLocation}
                      onToggleStatus={onToggleStatus}
                      onViewQR={onViewQR}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* ── Areas tab ───────────────────────────────────────────────────────── */}
      {activeTab === 1 && (
        <Box sx={{ p: { xs: 1.5, sm: 2.5 }, bgcolor: '#f8fafc' }}>
          {filteredAreas.length === 0 ? (
            <EmptyState
              icon={<LocationOnIcon />}
              title={areas.length === 0 ? 'No areas yet' : 'No results found'}
              subtitle={
                areas.length === 0
                  ? 'Create your first area to organise locations into zones.'
                  : 'Try adjusting your search or filter to find what you are looking for.'
              }
            />
          ) : (
            <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
              {filteredAreas.map((area) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={area.id} sx={{ display: 'flex' }}>
                  <AreaCard
                    area={area}
                    locationCount={locationCountByArea(area.id)}
                    onEdit={onEditArea}
                    onDelete={onDeleteArea}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default LocationTabs;
