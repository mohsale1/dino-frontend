import React, { useState } from 'react';
import { Box, Grid, Typography } from '@mui/material';
import { Add, LocationOn, CheckCircle, Block } from '@mui/icons-material';
import {
  PageContainer,
  Breadcrumbs,
  Button,
  StatsCard as StatCard,
  Tabs,
  DataGrid,
  SearchField,
  ConfirmDialog,
  Card,
} from '../../../components';
import { ServiceLocationCardAdmin, ServiceLocationFormDialog, ServiceAreaFormDialog } from '../components';
import type { ServiceLocation, ServiceArea } from '../types';

export const LocationsManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [searchQuery, setSearchQuery] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ServiceLocation | null>(null);
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);

  // Mock data
  const stats = {
    totalLocations: 45,
    available: 32,
    occupied: 13,
  };

  const areas: ServiceArea[] = [
    {
      id: 'area1',
      name: 'Main Floor',
      description: 'Main dining area',
      workspaceId: 'ws1',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ];

  const locations: ServiceLocation[] = [
    {
      id: '1',
      identifier: 'LOC-001',
      name: 'Location 1',
      areaId: 'area1',
      workspaceId: 'ws1',
      status: 'available',
      isActive: true,
      capacity: 4,
      createdAt: new Date().toISOString(),
    },
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin' },
    { label: 'Locations Management' },
  ];

  const tabs = [
    { label: 'Locations', value: 'locations' },
    { label: 'Areas', value: 'areas' },
  ];

  const handleSubmitForm = (_data: any) => {
    setAddDialogOpen(false);
    setSelectedLocation(null);
    setSelectedArea(null);
  };

  const handleEditLocation = (location: ServiceLocation) => {
    setSelectedLocation(location);
    setAddDialogOpen(true);
  };

  const handleEditArea = (area: ServiceArea) => {
    setSelectedArea(area);
    setAddDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedLocation(null);
    setSelectedArea(null);
  };

  return (
    <PageContainer
      title="Locations Management"
      subtitle="Manage service locations and areas"
      breadcrumbs={<Breadcrumbs items={breadcrumbItems} />}
      actions={
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add {activeTab === 'locations' ? 'Location' : 'Area'}
        </Button>
      }
    >
      {/* Statistics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Total Locations"
            value={stats.totalLocations}
            icon={<LocationOn />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Available"
            value={stats.available}
            icon={<CheckCircle />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <StatCard
            title="Occupied"
            value={stats.occupied}
            icon={<Block />}
          />
        </Grid>
      </Grid>

      {/* Search */}
      <Box mb={3}>
        <SearchField
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search locations..."
        />
      </Box>

      {/* Tabs */}
      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab}>
        {(tab) => (
          <>
            {tab === 'locations' && (
              <DataGrid
                data={locations}
                columns={{ xs: 12, sm: 6, md: 4, lg: 3 }}
                renderItem={(location) => (
                  <ServiceLocationCardAdmin
                    location={location}
                    areaName="Main Floor"
                    onEdit={handleEditLocation}
                    onDelete={(_id) => {
                      setSelectedLocation(location);
                      setDeleteDialogOpen(true);
                    }}
                    onToggleStatus={(_id) => {}}
                    onGenerateQR={(_id) => {}}
                    onPrintQR={(_id) => {}}
                  />
                )}
              />
            )}

            {tab === 'areas' && (
              <DataGrid
                data={areas}
                columns={{ xs: 12, sm: 6, md: 4 }}
                renderItem={(area) => (
                  <Card
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      '&:hover': { boxShadow: 3 },
                    }}
                    onClick={() => handleEditArea(area)}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {area.name}
                    </Typography>
                    {area.description && (
                      <Typography variant="body2" color="text.secondary">
                        {area.description}
                      </Typography>
                    )}
                  </Card>
                )}
              />
            )}
          </>
        )}
      </Tabs>

      {/* Add/Edit Location Dialog */}
      {activeTab === 'locations' && (
        <ServiceLocationFormDialog
          open={addDialogOpen}
          onClose={() => {
            setAddDialogOpen(false);
            setSelectedLocation(null);
          }}
          onSave={handleSubmitForm}
          table={selectedLocation}
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
          onSave={handleSubmitForm}
          area={selectedArea}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedLocation(null);
          setSelectedArea(null);
        }}
        onConfirm={handleConfirmDelete}
        title={`Delete ${activeTab === 'locations' ? 'Location' : 'Area'}`}
        message={`Are you sure you want to delete this ${activeTab === 'locations' ? 'location' : 'area'}? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
      />
    </PageContainer>
  );
};

export default LocationsManagementPage;
