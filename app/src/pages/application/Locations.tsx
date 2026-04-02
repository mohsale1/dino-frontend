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
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import LocationStats from './Locations/LocationStats';
import LocationFilters from './Locations/LocationFilters';
import LocationTabs from './Locations/LocationTabs';
import { ServiceLocationFormDialog, ServiceAreaFormDialog } from '../../features/locations/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { locationService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import type { ServiceLocation, ServiceArea } from '../../features/locations/types';

const LocationsManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';

  const [activeTab, setActiveTab] = useState('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Data state
  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [areas, setAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch areas
  const fetchAreas = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const data = await locationService.getAreas(workspaceId);
      setAreas(data);
    } catch (err: any) {
      console.error('Failed to fetch areas:', err);
      setError(err.message || 'Failed to load areas');
    }
  }, [workspaceId]);

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    if (!workspaceId) return;

    try {
      const data = await locationService.getLocations(workspaceId);
      setLocations(data);
    } catch (err: any) {
      console.error('Failed to fetch locations:', err);
      setError(err.message || 'Failed to load locations');
    }
  }, [workspaceId]);

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      if (!workspaceId) {
        setLoading(false);
        return;
      }

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
    if (location) {
      setSelectedLocation(location);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteArea = (areaId: string) => {
    const area = areas.find(a => a.id === areaId);
    if (area) {
      setSelectedArea(area);
      setDeleteDialogOpen(true);
    }
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
        await fetchLocations();
      } else if (activeTab === 'areas' && selectedArea) {
        await locationService.deleteArea(selectedArea.id);
        setSnackbar({ open: true, message: 'Area deleted successfully', severity: 'success' });
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
    try {
      const location = locations.find(l => l.id === id);
      if (!location) return;

      const newStatus = location.status === 'available' ? 'maintenance' : 'available';
      await locationService.updateLocationStatus(id, newStatus);
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      await fetchLocations();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to update status', severity: 'error' });
    }
  };

  const handleGenerateQR = async (locationId: string) => {
    try {
      await locationService.generateQRCode(locationId);
      setSnackbar({ open: true, message: 'QR code generated successfully', severity: 'success' });
      await fetchLocations();
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1.0625rem' }}
          >
            Locations
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b' }}>
            Manage service locations and areas
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{
            textTransform: 'none',
            borderRadius: 1.5,
            px: 2.5,
            fontWeight: 600,
            bgcolor: '#1976d2',
            '&:hover': { bgcolor: '#1565c0' },
          }}
        >
          Add {activeTab === 'locations' ? 'Location' : 'Area'}
        </Button>
      </Box>

      {/* Body */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
      >
        <LocationStats stats={stats} />

        <LocationFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          activeTab={activeTab}
        />

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
        />
      </Box>

      {/* Add/Edit Location Dialog */}
      {activeTab === 'locations' && (
        <ServiceLocationFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedLocation(null);
          }}
          onSave={handleSaveLocation}
          location={selectedLocation}
          areas={areas}
        />
      )}

      {/* Add/Edit Area Dialog */}
      {activeTab === 'areas' && (
        <ServiceAreaFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedArea(null);
          }}
          onSave={handleSaveArea}
          area={selectedArea}
        />
      )}

      {/* Delete Confirmation */}
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

      {/* Snackbar */}
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