/**
 * Locations Management Page
 *
 * Manage service locations (tables) and areas.
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
  Dialog,
  DialogContent,
  DialogActions,
  Radio,
  Grid,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  People as OccupiedIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Schedule as ReservedIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import LocationTabs from './Locations/LocationTabs';
import QRCodeDialog from './Locations/QRCodeDialog';
import { ServiceLocationFormDialog, ServiceAreaFormDialog } from '../../features/locations/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { locationService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import type { ServiceLocation, ServiceArea } from '../../features/locations/types';

// ─── StatCard ──────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactElement;
}> = ({ label, value, icon }) => (
  <Box
    sx={{
      bgcolor: '#ffffff',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      p: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      height: '100%',
    }}
  >
    <Box
      sx={{
        width: 40,
        height: 40,
        borderRadius: '8px',
        flexShrink: 0,
        bgcolor: 'rgba(25,118,210,0.08)',
        border: '1px solid rgba(25,118,210,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#1976D2',
        '& svg': { fontSize: 20 },
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: 24,
          color: '#1C1C1E',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#666666', mt: 0.25, fontWeight: 500 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ─── Bulk Print ────────────────────────────────────────────────────────────────

type BulkQRStyle = 'classic' | 'rounded' | 'dark' | 'branded' | 'minimal' | 'framed';

interface BulkQRItem {
  qrUrl: string;
  name: string;
  areaName: string;
  menuUrl: string;
}

const BULK_STYLE_CSS: Record<BulkQRStyle, { wrap: string; imgCss: string; bg: string }> = {
  classic:  { wrap: 'background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);display:inline-block;', imgCss: 'border-radius:4px;', bg: '#f8fafc' },
  rounded:  { wrap: 'background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:14px;box-shadow:0 4px 16px rgba(0,0,0,0.08);display:inline-block;', imgCss: 'border-radius:14px;', bg: '#f8fafc' },
  dark:     { wrap: 'background:#0f172a;border-radius:10px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,0.35);display:inline-block;', imgCss: 'border-radius:6px;filter:invert(1);', bg: '#1e293b' },
  branded:  { wrap: 'background:#fff;border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;display:inline-block;box-shadow:0 2px 8px rgba(0,0,0,0.06);', imgCss: 'padding:8px;', bg: '#f8fafc' },
  minimal:  { wrap: 'display:inline-block;padding:6px;', imgCss: 'border-radius:4px;', bg: '#ffffff' },
  framed:   { wrap: 'background:#fff;border-radius:10px;padding:12px;border:3px solid #0f172a;box-shadow:3px 3px 0 #0f172a;display:inline-block;', imgCss: 'border-radius:4px;', bg: '#f8fafc' },
};

const buildBulkPrintHtml = (items: BulkQRItem[], style: BulkQRStyle = 'classic'): string => {
  const sc = BULK_STYLE_CSS[style];
  const brandedHeader = style === 'branded'
    ? `<div style="background:linear-gradient(135deg,#0f172a,#312e81);padding:5px 10px;text-align:center;"><span style="color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Dino</span></div>`
    : '';

  const cards = items.map((item) => `
    <div class="card">
      <div style="${sc.wrap}">
        ${brandedHeader}
        <img src="${item.qrUrl}" style="width:120px;height:120px;display:block;${sc.imgCss}" alt="QR" />
      </div>
      <p class="name">${item.name}</p>
      ${item.areaName ? `<p class="area">${item.areaName}</p>` : ''}
      <p class="url">${item.menuUrl}</p>
    </div>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <title>Bulk QR Codes</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; background: ${sc.bg}; padding: 4px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .card { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 16px 10px 12px; break-inside: avoid; page-break-inside: avoid; gap: 6px; }
    .name { font-size: 12px; font-weight: 800; color: #0f172a; }
    .area { font-size: 9px; color: #64748b; }
    .url { font-size: 7px; color: #94a3b8; word-break: break-all; font-family: monospace; padding-top: 6px; border-top: 1px solid #f1f5f9; width: 100%; }
  </style>
</head>
<body>
  <div class="grid">${cards}</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
};

// ─── Main Component ────────────────────────────────────────────────────────────

const LocationsManagementPage: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.venue?.workspaceId || '';
  const organizationId = userData?.venue?.id || '';
  const { canCreateTables, canCreateAreas } = usePermissions();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab]             = useState(0);
  const [searchQuery, setSearchQuery]         = useState('');
  const [filterStatus, setFilterStatus]       = useState('all');

  // Location dialog state
  const [locationDialogOpen, setLocationDialogOpen]   = useState(false);
  const [locationDeleteOpen, setLocationDeleteOpen]   = useState(false);
  const [selectedLocation, setSelectedLocation]       = useState<ServiceLocation | null>(null);

  // Area dialog state
  const [areaDialogOpen, setAreaDialogOpen]   = useState(false);
  const [areaDeleteOpen, setAreaDeleteOpen]   = useState(false);
  const [selectedArea, setSelectedArea]       = useState<ServiceArea | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  const [locations, setLocations] = useState<ServiceLocation[]>([]);
  const [areas, setAreas]         = useState<ServiceArea[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [qrDialogLocation, setQrDialogLocation] = useState<ServiceLocation | null>(null);
  const [bulkStyleOpen, setBulkStyleOpen]       = useState(false);
  const [bulkStyle, setBulkStyle]               = useState<BulkQRStyle>('classic');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchLocations = useCallback(async () => {
    if (!workspaceId) return;
    const data = await locationService.getLocations(workspaceId);
    setLocations(data);
  }, [workspaceId]);

  const fetchAreas = useCallback(async () => {
    if (!workspaceId) return;
    const data = await locationService.getAreas(workspaceId);
    setAreas(data);
  }, [workspaceId]);

  useEffect(() => {
    const load = async () => {
      if (!workspaceId) { setLoading(false); return; }
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchLocations(), fetchAreas()]);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [workspaceId, fetchLocations, fetchAreas]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = {
    total:     locations.length,
    available: locations.filter((l) => l.status === 'available').length,
    occupied:  locations.filter((l) => l.status === 'occupied').length,
    reserved:  locations.filter((l) => l.status === 'reserved').length,
  };

  // ── Filtered locations (for bulk print) ───────────────────────────────────

  const getFilteredLocations = useCallback(
    (): ServiceLocation[] =>
      locations.filter((l) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          !q ||
          (l.name ?? '').toLowerCase().includes(q) ||
          l.identifier.toLowerCase().includes(q) ||
          (l.description ?? '').toLowerCase().includes(q);
        const matchStatus = filterStatus === 'all' || l.status === filterStatus;
        return matchSearch && matchStatus;
      }),
    [locations, searchQuery, filterStatus],
  );

  // ── Shared helpers ─────────────────────────────────────────────────────────

  const showSnack = (message: string, severity: 'success' | 'error' | 'info') =>
    setSnackbar({ open: true, message, severity });

  // ── Location handlers ──────────────────────────────────────────────────────

  const handleAddNew = () => {
    if (activeTab === 0) {
      setSelectedLocation(null);
      setLocationDialogOpen(true);
    } else {
      setSelectedArea(null);
      setAreaDialogOpen(true);
    }
  };

  const handleEditLocation = (location: ServiceLocation) => {
    setSelectedLocation(location);
    setLocationDialogOpen(true);
  };

  const handleDeleteLocation = (locationId: string) => {
    const loc = locations.find((l) => l.id === locationId);
    if (loc) { setSelectedLocation(loc); setLocationDeleteOpen(true); }
  };

  const handleSaveLocation = async (data: any) => {
    try {
      if (selectedLocation) {
        await locationService.updateLocation(selectedLocation.id, data);
        showSnack('Location updated successfully', 'success');
      } else {
        await locationService.createLocation(data);
        showSnack('Location created successfully', 'success');
      }
      setLocationDialogOpen(false);
      setSelectedLocation(null);
      await fetchLocations();
    } catch (err: any) {
      showSnack(err.message || 'Failed to save location', 'error');
    }
  };

  const handleConfirmDeleteLocation = async () => {
    try {
      if (selectedLocation) {
        await locationService.deleteLocation(selectedLocation.id);
        showSnack('Location deleted successfully', 'success');
        await fetchLocations();
      }
      setLocationDeleteOpen(false);
      setSelectedLocation(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to delete location', 'error');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const location = locations.find((l) => l.id === id);
    if (!location) return;
    if (location.status === 'occupied') {
      showSnack('Cannot change status: table is currently occupied', 'error');
      return;
    }
    try {
      const newStatus = location.status === 'available' ? 'out_of_service' : 'available';
      await locationService.updateLocationStatus(id, newStatus);
      showSnack('Status updated successfully', 'success');
      await fetchLocations();
    } catch (err: any) {
      showSnack(err.message || 'Failed to update status', 'error');
    }
  };

  const handleViewQR = async (location: ServiceLocation) => {
    try {
      const fresh = await locationService.getLocation(location.id);
      setQrDialogLocation(fresh);
    } catch {
      setQrDialogLocation(location);
    }
  };

  // ── Area handlers ──────────────────────────────────────────────────────────

  const handleEditArea = (area: ServiceArea) => {
    setSelectedArea(area);
    setAreaDialogOpen(true);
  };

  const handleDeleteArea = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    if (area) { setSelectedArea(area); setAreaDeleteOpen(true); }
  };

  const handleSaveArea = async (data: any) => {
    try {
      if (selectedArea) {
        await locationService.updateArea(selectedArea.id, data);
        showSnack('Area updated successfully', 'success');
      } else {
        await locationService.createArea(data);
        showSnack('Area created successfully', 'success');
      }
      setAreaDialogOpen(false);
      setSelectedArea(null);
      await fetchAreas();
    } catch (err: any) {
      showSnack(err.message || 'Failed to save area', 'error');
    }
  };

  const handleConfirmDeleteArea = async () => {
    try {
      if (selectedArea) {
        await locationService.deleteArea(selectedArea.id);
        showSnack('Area deleted successfully', 'success');
        await fetchAreas();
      }
      setAreaDeleteOpen(false);
      setSelectedArea(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to delete area', 'error');
    }
  };

  // ── Bulk Print QR ──────────────────────────────────────────────────────────

  const handleBulkPrintQR = () => {
    const visibleLocations = getFilteredLocations();
    if (visibleLocations.length === 0) {
      showSnack('No locations to print', 'error');
      return;
    }
    setBulkStyleOpen(true);
  };

  const handleBulkPrintConfirm = async () => {
    setBulkStyleOpen(false);
    const visibleLocations = getFilteredLocations();
    showSnack(`Generating QR codes for ${visibleLocations.length} location(s)...`, 'info');
    try {
      const items = await Promise.all(
        visibleLocations.map(async (loc): Promise<BulkQRItem> => {
          const qrUrl = await locationService.generateQRCode(loc.id, workspaceId);
          const area = loc.areaId ? areas.find((a) => a.id === loc.areaId) : undefined;
          return { qrUrl, name: loc.name ?? loc.identifier, areaName: area?.name ?? '', menuUrl: qrUrl };
        }),
      );
      const html = buildBulkPrintHtml(items, bulkStyle);
      const win = window.open('', '_blank');
      if (!win) { showSnack('Pop-up blocked. Please allow pop-ups and try again.', 'error'); return; }
      win.document.open();
      win.document.write(html);
      win.document.close();
      showSnack(`${items.length} QR code(s) ready to print`, 'success');
    } catch (err: any) {
      showSnack(err.message || 'Failed to generate QR codes', 'error');
    }
  };

  // ── Loading / error states ─────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f8fafc', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 480 }}>{error}</Alert>
      </Box>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const canAdd = activeTab === 0 ? canCreateTables : canCreateAreas;
  const addLabel = activeTab === 0 ? 'Add Location' : 'Add Area';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ───────────────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 2, sm: '32px' },
          pt: '24px',
          pb: '20px',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: 20, lineHeight: 1.3 }}>
            Locations
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
            {locations.length} location{locations.length !== 1 ? 's' : ''} &middot; {areas.length} area{areas.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        {canAdd && (
          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            sx={{
              bgcolor: '#1976D2',
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 2.5,
              py: 1,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            {addLabel}
          </Button>
        )}
      </Box>

      {/* ── Stat Cards ────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 0 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Total Locations" value={stats.total}     icon={<LocationIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Available"        value={stats.available} icon={<CheckCircleIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Occupied"         value={stats.occupied}  icon={<OccupiedIcon />} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard label="Reserved"         value={stats.reserved}  icon={<ReservedIcon />} />
          </Grid>
        </Grid>
      </Box>

      {/* ── Toolbar ───────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: 'none',
            borderTop: '1px solid #e0e0e0',
            borderBottom: '1px solid #e0e0e0',
            bgcolor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              px: { xs: 2, sm: 2.5 },
              pt: 2,
              pb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            {/* Search */}
            <Box
              sx={{
                flex: '1 1 220px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: '#f7f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
              }}
            >
              <SearchIcon sx={{ fontSize: 17, color: '#999999', flexShrink: 0 }} />
              <InputBase
                placeholder={activeTab === 0 ? 'Search locations...' : 'Search areas...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem', color: '#1C1C1E' }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ p: 0.25, color: '#999999' }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Status filter */}
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f7f9fa' }}
              >
                <MenuItem value="all">
                  <Typography variant="body2" sx={{ color: '#999999' }}>All Status</Typography>
                </MenuItem>
                <MenuItem value="available">Available</MenuItem>
                <MenuItem value="occupied">Occupied</MenuItem>
                <MenuItem value="reserved">Reserved</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Paper>
      </Box>

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <Box sx={{ px: { xs: 2, sm: '32px' }, pt: 3, pb: 6 }}>
        <LocationTabs
          locations={locations}
          searchQuery={searchQuery}
          filterStatus={filterStatus}
          onEditLocation={handleEditLocation}
          onDeleteLocation={handleDeleteLocation}
          onToggleStatus={handleToggleStatus}
          onViewQR={handleViewQR}
          onBulkPrintQR={handleBulkPrintQR}
          areas={areas}
          onEditArea={handleEditArea}
          onDeleteArea={handleDeleteArea}
          activeTab={activeTab}
          onTabChange={(tab) => { setActiveTab(tab); setSearchQuery(''); setFilterStatus('all'); }}
        />
      </Box>

      {/* ── Dialogs ────────────────────────────────────────────────────────────── */}

      {/* Location form */}
      <ServiceLocationFormDialog
        open={locationDialogOpen}
        onClose={() => { setLocationDialogOpen(false); setSelectedLocation(null); }}
        onSave={handleSaveLocation}
        location={selectedLocation}
      />

      {/* Location delete */}
      <DeleteConfirmationDialog
        open={locationDeleteOpen}
        onClose={() => { setLocationDeleteOpen(false); setSelectedLocation(null); }}
        onConfirm={handleConfirmDeleteLocation}
        title="Delete Location"
        itemName={selectedLocation?.name || selectedLocation?.identifier || ''}
        itemType="location"
        description="This will remove this location from the system. This action can be undone later."
        requireTyping={false}
      />

      {/* Area form */}
      <ServiceAreaFormDialog
        open={areaDialogOpen}
        onClose={() => { setAreaDialogOpen(false); setSelectedArea(null); }}
        onSave={handleSaveArea}
        area={selectedArea}
      />

      {/* Area delete */}
      <DeleteConfirmationDialog
        open={areaDeleteOpen}
        onClose={() => { setAreaDeleteOpen(false); setSelectedArea(null); }}
        onConfirm={handleConfirmDeleteArea}
        title="Delete Area"
        itemName={selectedArea?.name || ''}
        itemType="area"
        description="This will remove this area from the system. Locations in this area will not be deleted."
        requireTyping={false}
      />

      {/* ── Bulk Print Style Picker ── */}
      <Dialog
        open={bulkStyleOpen}
        onClose={() => setBulkStyleOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}
      >
        <Box
          sx={{
            bgcolor: '#ffffff',
            px: 3,
            py: 2.5,
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ color: '#1C1C1E', fontWeight: 700, fontSize: '1rem' }}>Print All QRs</Typography>
            <Typography sx={{ color: '#666666', fontSize: '0.75rem', mt: 0.25 }}>
              Choose a card style for all {getFilteredLocations().length} QR codes
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setBulkStyleOpen(false)}
            sx={{ color: '#999999', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <DialogContent sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {(
              [
                { value: 'classic',  label: 'Classic',  desc: 'Clean white card with subtle shadow' },
                { value: 'rounded',  label: 'Rounded',  desc: 'Soft rounded corners, modern look' },
                { value: 'dark',     label: 'Dark',     desc: 'Dark background, inverted QR' },
                { value: 'branded',  label: 'Branded',  desc: 'Dino branded header above QR' },
                { value: 'minimal',  label: 'Minimal',  desc: 'No border, clean and simple' },
                { value: 'framed',   label: 'Framed',   desc: 'Bold decorative frame border' },
              ] as { value: BulkQRStyle; label: string; desc: string }[]
            ).map((s) => (
              <Box
                key={s.value}
                onClick={() => setBulkStyle(s.value)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderRadius: '8px',
                  border: `1.5px solid ${bulkStyle === s.value ? '#1976D2' : '#e0e0e0'}`,
                  bgcolor: bulkStyle === s.value ? 'rgba(25,118,210,0.04)' : '#fafafa',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: '#1976D2', bgcolor: 'rgba(25,118,210,0.04)' },
                }}
              >
                <Radio
                  checked={bulkStyle === s.value}
                  size="small"
                  sx={{ p: 0, color: '#1976D2', '&.Mui-checked': { color: '#1976D2' } }}
                />
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#1C1C1E', lineHeight: 1.2 }}>
                    {s.label}
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: '#666666', lineHeight: 1.3 }}>
                    {s.desc}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2.5, pt: 0, gap: 1 }}>
          <Button
            onClick={() => setBulkStyleOpen(false)}
            sx={{ textTransform: 'none', fontWeight: 600, color: '#666666', borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={handleBulkPrintConfirm}
            startIcon={<PrintIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#1976D2',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            Print All QRs
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR viewer */}
      <QRCodeDialog
        open={!!qrDialogLocation}
        location={qrDialogLocation}
        areaName={qrDialogLocation?.areaId ? areas.find((a) => a.id === qrDialogLocation.areaId)?.name : undefined}
        organizationId={organizationId}
        onClose={() => setQrDialogLocation(null)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LocationsManagementPage;
