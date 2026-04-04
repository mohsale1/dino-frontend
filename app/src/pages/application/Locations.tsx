/**
 * Locations Management Page
 *
 * Manage service locations and areas
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  InputBase,
  Select,
  MenuItem,
  FormControl,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { alpha } from '@mui/material/styles';
import {
  Add as AddIcon,
  CalendarToday,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  People as OccupiedIcon,
  Search as SearchIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import LocationTabs from './Locations/LocationTabs';
import QRCodeDialog from './Locations/QRCodeDialog';
import { ServiceLocationFormDialog, ServiceAreaFormDialog } from '../../features/locations/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { locationService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import { useAuth } from '../../contexts/common/Auth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROLE_COLORS } from '../../constants/app';
import type { ServiceLocation, ServiceArea } from '../../features/locations/types';

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------

const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = React.useState(0);
  React.useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setCount(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------

const HeroStat: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
  rc: typeof ROLE_COLORS[keyof typeof ROLE_COLORS];
}> = ({ label, value, icon, rc }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        width: '100%',
        px: { xs: 1.5, sm: 2 },
        py: 1.75,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.11)' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            bgcolor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: alpha(rc.chipText, 0.9),
            flexShrink: 0,
          }}
        >
          {React.cloneElement(icon, { sx: { fontSize: 17 } })}
        </Box>
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: rc.statValue,
              fontSize: { xs: '1.2rem', sm: '1.5rem' },
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {animated}
          </Typography>
          <Typography sx={{ color: rc.statLabel, fontSize: '0.72rem', fontWeight: 500, mt: 0.25 }}>
            {label}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const LocationsManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const { canCreateAreas, canCreateTables } = usePermissions();

  // Role detection
  const { userPermissions } = useAuth();
  const rawRole = (userPermissions?.role?.name || '').toLowerCase();
  const roleKey: 'Owner' | 'Manager' | 'User' = rawRole.includes('owner') || rawRole.includes('super')
    ? 'Owner'
    : rawRole.includes('manager') || rawRole.includes('admin')
    ? 'Manager'
    : 'User';
  const rc = ROLE_COLORS[roleKey];

  const [activeTab, setActiveTab] = useState('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [qrDialogLocation, setQrDialogLocation] = useState<ServiceLocation | null>(null);

  const fetchAreas = useCallback(async () => {
    if (!workspaceId) return;
    setError(null);
    try {
      const data = await locationService.getAreas(workspaceId);
      setAreas(data);
    } catch (err: any) {
      console.error('Failed to fetch areas:', err);
      setError(err.message || 'Failed to load areas');
    }
  }, [workspaceId]);

  const fetchLocations = useCallback(async () => {
    if (!workspaceId) return;
    setError(null);
    try {
      const data = await locationService.getLocations(workspaceId);
      setLocations(data);
    } catch (err: any) {
      console.error('Failed to fetch locations:', err);
      setError(err.message || 'Failed to load locations');
    }
  }, [workspaceId]);

  useEffect(() => {
    const loadData = async () => {
      if (!workspaceId) { setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchAreas(), fetchLocations()]);
      } catch (err: any) {
        console.error('Failed to load data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [workspaceId, fetchAreas, fetchLocations]);

  const stats = {
    totalLocations: locations.length,
    available: locations.filter(l => l.status === 'available').length,
    occupied: locations.filter(l => l.status === 'occupied').length,
  };

  const handleAddNew = () => {
    setSelectedLocation(null);
    setSelectedArea(null);
    setAddDialogOpen(true);
  };

  const handleEditLocation = (location: ServiceLocation) => {
    setSelectedLocation(location);
    setAddDialogOpen(true);
  };

  const handleEditArea = (area: ServiceArea) => {
    setSelectedArea(area);
    setAddDialogOpen(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    if (location) { setSelectedLocation(location); setDeleteDialogOpen(true); }
  };

  const handleDeleteArea = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (area) { setSelectedArea(area); setDeleteDialogOpen(true); }
  };

  const handleSaveLocation = async (data: any) => {
    try {
      if (selectedLocation) {
        await locationService.updateLocation(selectedLocation.id, data);
        setSnackbar({ open: true, message: 'Location updated successfully', severity: 'success' });
      } else {
        await locationService.createLocation({ ...data, workspaceId });
        setSnackbar({ open: true, message: 'Location created successfully', severity: 'success' });
      }
      setAddDialogOpen(false);
      setSelectedLocation(null);
      setError(null);
      await fetchLocations();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save location', severity: 'error' });
    }
  };

  const handleSaveArea = async (data: any) => {
    try {
      if (selectedArea) {
        await locationService.updateArea(selectedArea.id, data);
        setSnackbar({ open: true, message: 'Area updated successfully', severity: 'success' });
      } else {
        await locationService.createArea({ ...data, workspaceId });
        setSnackbar({ open: true, message: 'Area created successfully', severity: 'success' });
      }
      setAddDialogOpen(false);
      setSelectedArea(null);
      setError(null);
      await fetchAreas();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save area', severity: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (activeTab === 'locations' && selectedLocation) {
        await locationService.deleteLocation(selectedLocation.id);
        setSnackbar({ open: true, message: 'Location deleted successfully', severity: 'success' });
        setError(null);
        await fetchLocations();
      } else if (activeTab === 'areas' && selectedArea) {
        await locationService.deleteArea(selectedArea.id);
        setSnackbar({ open: true, message: 'Area deleted successfully', severity: 'success' });
        setError(null);
        await fetchAreas();
      }
      setDeleteDialogOpen(false);
      setSelectedLocation(null);
      setSelectedArea(null);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to delete', severity: 'error' });
    }
  };

  const handleToggleStatus = async (id: string) => {
    const location = locations.find(l => l.id === id);
    if (!location) return;

    // Cannot toggle status while a table is occupied — it must be cleared first.
    if (location.status === 'occupied') {
      setSnackbar({
        open: true,
        message: 'Cannot change status: table is currently occupied',
        severity: 'error',
      });
      return;
    }

    try {
      const newStatus = location.status === 'available' ? 'maintenance' : 'available';
      await locationService.updateLocationStatus(id, newStatus);
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      setError(null);
      await fetchLocations();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
    }
  };

  const handleGenerateQR = async (locationId: string) => {
    try {
      // Store the returned QR URL and open the QR dialog for the relevant location
      const qrUrl = await locationService.generateQRCode(locationId);
      setSnackbar({ open: true, message: 'QR code generated successfully', severity: 'success' });
      setError(null);
      // Refresh so the location record reflects the new qrCode field
      await fetchLocations();
      // Open the QR dialog with the freshly generated URL injected
      const updated = locations.find(l => l.id === locationId);
      if (updated) {
        setQrDialogLocation({ ...updated, qrCode: qrUrl || updated.qrCode });
      }
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to generate QR code', severity: 'error' });
    }
  };

  const handlePrintQR = async (locationId: string) => {
    try {
      await locationService.printQRCode(locationId);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to print QR code', severity: 'error' });
    }
  };

  const handleViewQR = (location: ServiceLocation) => {
    setQrDialogLocation(location);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Compute filtered count for toolbar result count.
  // ServiceArea has no 'status' field — it uses 'isActive' (boolean).
  const total = activeTab === 'locations' ? locations.length : areas.length;
  const filteredCount = activeTab === 'locations'
    ? locations.filter((l) => {
        const matchSearch =
          !searchQuery ||
          l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.identifier?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus =
          filterStatus === 'all' || l.status === filterStatus;
        return matchSearch && matchStatus;
      }).length
    : areas.filter((a) => {
        const matchSearch =
          !searchQuery ||
          a.name?.toLowerCase().includes(searchQuery.toLowerCase());
        // ServiceArea uses isActive, not status. Map the filter values accordingly.
        const matchStatus =
          filterStatus === 'all' ||
          (filterStatus === 'available' ? a.isActive : !a.isActive);
        return matchSearch && matchStatus;
      }).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100%', bgcolor: '#f1f5f9' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: rc.gradient,
          px: { xs: 2, sm: 4, md: 6 },
          pt: { xs: 2.5, md: 4 },
          pb: { xs: 2.5, md: 4 },
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowA} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -60,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${rc.glowB} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Overline above title row */}
          <Typography
            sx={{
              color: alpha(rc.chipText, 0.75),
              fontWeight: 700,
              letterSpacing: 3,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              mb: 1,
            }}
          >
            APPLICATION CONTROL CENTER
          </Typography>

          {/* Title row */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'flex-start', sm: 'flex-start' },
              justifyContent: 'space-between',
              gap: 2,
              mb: 4,
            }}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.025em',
                  lineHeight: 1.2,
                  fontSize: { xs: '1.4rem', md: '2rem' },
                }}
              >
                Locations
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.75 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha(rc.chipText, 0.6) }} />
                <Typography
                  variant="caption"
                  sx={{ color: alpha(rc.chipText, 0.6), fontWeight: 500, fontSize: '0.75rem' }}
                >
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>

            {(canCreateAreas || canCreateTables) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                sx={{
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  width: { xs: '100%', sm: 'auto' },
                  bgcolor: alpha('#fff', 0.15),
                  color: '#fff',
                  fontWeight: 600,
                  textTransform: 'none',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  px: 2.5,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: alpha('#fff', 0.25),
                    border: '1px solid rgba(255,255,255,0.4)',
                    boxShadow: 'none',
                  },
                }}
              >
                Add {activeTab === 'locations' ? 'Location' : 'Area'}
              </Button>
            )}
          </Box>

          {/* Hero stat tiles — CSS Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            <HeroStat label="Total Locations" value={stats.totalLocations} icon={<LocationIcon />} rc={rc} />
            <HeroStat label="Available" value={stats.available} icon={<CheckCircleIcon />} rc={rc} />
            <HeroStat label="Occupied" value={stats.occupied} icon={<OccupiedIcon />} rc={rc} />
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box sx={{ pb: 6 }}>
        {/* Full-width toolbar */}
        <Box sx={{ pt: 0, pb: 0 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 0,
              border: 'none',
              borderTop: '1px solid #e2e8f0',
              borderBottom: '1px solid #e2e8f0',
              bgcolor: '#ffffff',
            }}
          >
            <Box
              sx={{
                px: 2.5,
                pt: 2,
                pb: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              {/* Search */}
              <Box
                sx={{
                  flex: '1 1 220px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                }}
              >
                <SearchIcon sx={{ fontSize: 17, color: '#94a3b8', flexShrink: 0 }} />
                <InputBase
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flex: 1, fontSize: '0.875rem', color: '#0f172a' }}
                />
                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    sx={{ p: 0.25, color: '#94a3b8' }}
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Box>

              {/* Status filter */}
              <FormControl size="small" sx={{ minWidth: 130, flexShrink: 0 }}>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  displayEmpty
                  sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
                >
                  <MenuItem value="all">
                    <Typography variant="body2" sx={{ color: '#94a3b8' }}>All Status</Typography>
                  </MenuItem>
                  <MenuItem value="available">Available</MenuItem>
                  <MenuItem value="occupied">Occupied</MenuItem>
                  <MenuItem value="maintenance">Maintenance</MenuItem>
                </Select>
              </FormControl>

              {/* Result count */}
              <Box sx={{ ml: 'auto', flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                  {filteredCount} of {total}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Content */}
        <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, pt: 2, pb: 2 }}>
          <LocationTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            locations={locations}
            areas={areas}
            onEditLocation={handleEditLocation}
            onDeleteLocation={handleDeleteLocation}
            onEditArea={handleEditArea}
            onDeleteArea={handleDeleteArea}
            onToggleStatus={handleToggleStatus}
            onGenerateQR={handleGenerateQR}
            onPrintQR={handlePrintQR}
            onViewQR={handleViewQR}
          />
        </Box>
      </Box>

      {activeTab === 'locations' && (
        <ServiceLocationFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedLocation(null); }}
          onSave={handleSaveLocation}
          location={selectedLocation}
          areas={areas}
        />
      )}

      {activeTab === 'areas' && (
        <ServiceAreaFormDialog
          open={addDialogOpen}
          onClose={() => { setAddDialogOpen(false); setSelectedArea(null); }}
          onSave={handleSaveArea}
          area={selectedArea}
        />
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedLocation(null);
          setSelectedArea(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${activeTab === 'locations' ? 'Location' : 'Area'}`}
        itemName={selectedLocation?.name || selectedArea?.name || ''}
        itemType={activeTab === 'locations' ? 'location' : 'area'}
        description={`This will remove this ${activeTab === 'locations' ? 'location' : 'area'} from the system. This action can be undone later.`}
        requireTyping={false}
      />

      <QRCodeDialog
        open={!!qrDialogLocation}
        location={qrDialogLocation}
        areaName={areas.find(a => a.id === qrDialogLocation?.areaId)?.name}
        organizationId={userData?.venue?.id || ''}
        onClose={() => setQrDialogLocation(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationsManagementPage;