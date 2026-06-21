/**
 * Locations Management Page
 *
 * Manage service locations (tables) and areas.
 * Follows the canonical layout: white header bar, stat strip, toolbar, tabs, content area, mobile FAB.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  InputBase,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogActions,
  Radio,
  Paper,
  Fab,
  TablePagination,
  Divider,
  Grid,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  QrCode2 as QrCodeIcon,
  LocationOn as LocationOnIcon,
  TableBar as TableBarIcon,
} from '@mui/icons-material';
import { Button } from '../../components';
import { Tabs as MuiTabs, Tab } from '@mui/material';
import LocationCard from './Locations/LocationCard';
import AreaCard from './Locations/AreaCard';
import QRCodeDialog from './Locations/QRCodeDialog';
import { ServiceLocationFormDialog, ServiceAreaFormDialog } from '../../features/locations/components';
import { DeleteConfirmationDialog } from '../../components/dialogs';
import { locationService } from '../../services/application';
import { useUserData } from '../../contexts/application/UserData';
import { usePermissions } from '../../hooks/usePermissions';
import { APP_CONFIG } from '../../constants/app';
import type { ServiceLocation, ServiceArea } from '../../features/locations/types';

// ── Brand constants ──────────────────────────────────────────────────────────

const PRIMARY    = '#1976D2';
const PRIMARY_BG = 'rgba(25,118,210,0.08)';

// ── Bulk Print ───────────────────────────────────────────────────────────────

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
    ? `<div style="background:linear-gradient(135deg,#0f172a,#312e81);padding:5px 10px;text-align:center;"><span style="color:#fff;font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">${APP_CONFIG.NAME}</span></div>`
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
    .url { font-size: 7px; color: #94a3b8; word-break: break-all; font-family: monospace; padding-top: 6px; border-top: 1px solid #e0e0e0; width: 100%; }
  </style>
</head>
<body>
  <div class="grid">${cards}</div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`;
};

// ── Page Component ───────────────────────────────────────────────────────────

const LocationsManagementPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { userData } = useUserData();
  const personaId = userData?.venue?.personaId;
  const organizationId = userData?.venue?.id || '';
  const { canCreateTables, canCreateAreas } = usePermissions();

  // ── Core state ──

  const [activeTab, setActiveTab]       = useState<'locations' | 'areas'>('locations');
  const [searchQuery, setSearchQuery]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // ── Tables pagination ──

  const [page, setPage]               = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal]             = useState(0);

  // ── Areas pagination ──

  const [areaPage, setAreaPage]               = useState(0);
  const [areaRowsPerPage, setAreaRowsPerPage] = useState(10);

  // ── Dialog state ──

  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationDeleteOpen, setLocationDeleteOpen] = useState(false);
  const [selectedLocation, setSelectedLocation]     = useState<ServiceLocation | null>(null);

  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [areaDeleteOpen, setAreaDeleteOpen] = useState(false);
  const [selectedArea, setSelectedArea]     = useState<ServiceArea | null>(null);

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

  // ── Data fetching ──

  const fetchLocations = useCallback(async () => {
    if (!personaId) return;
    const response = await locationService.getTables(personaId, {
      page: page + 1,
      page_size: rowsPerPage,
    });
    // Handle both array and paginated object responses
    if (Array.isArray(response)) {
      setLocations(response);
      setTotal(response.length);
    } else {
      const data = (response as any).data ?? [];
      const pagination = (response as any).pagination;
      setLocations(data);
      setTotal(pagination?.total ?? data.length);
    }
  }, [personaId, page, rowsPerPage]);

  const fetchAreas = useCallback(async () => {
    if (!personaId) return;
    const data = await locationService.getVenueAreas(personaId);
    setAreas(data);
  }, [personaId]);

  useEffect(() => {
    const load = async () => {
      if (!personaId) { setLoading(false); return; }
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
  }, [personaId, fetchLocations, fetchAreas]);

  // Re-fetch tables when page/rowsPerPage changes
  useEffect(() => {
    if (!loading) {
      fetchLocations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage]);

  // ── Filtered data (client-side within loaded page) ──

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

  // Paginated slice for areas (client-side)
  const pagedAreas = filteredAreas.slice(
    areaPage * areaRowsPerPage,
    areaPage * areaRowsPerPage + areaRowsPerPage,
  );

  const locationCountByArea = (areaId: string): number =>
    locations.filter((l) => l.areaId === areaId).length;

  // ── Helpers ──

  const showSnack = (message: string, severity: 'success' | 'error' | 'info') =>
    setSnackbar({ open: true, message, severity });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'locations' | 'areas');
    setSearchQuery('');
    setFilterStatus('all');
    setPage(0);
    setAreaPage(0);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(0);
    setAreaPage(0);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
    setPage(0);
    setAreaPage(0);
  };

  // ── Location handlers ──

  const handleAddNew = () => {
    if (activeTab === 'locations') {
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
    if (!personaId) return;
    try {
      if (selectedLocation) {
        await locationService.updateTable(selectedLocation.id, personaId, {
          table_number: data.table_number,
          area_id: data.area_id || undefined,
          capacity: data.capacity,
          status: data.status,
        });
        showSnack('Table updated successfully', 'success');
      } else {
        await locationService.createTable(personaId, {
          table_number: data.table_number,
          area_id: data.area_id || undefined,
          capacity: data.capacity,
          status: data.status,
        });
        showSnack('Table created successfully', 'success');
      }
      setLocationDialogOpen(false);
      setSelectedLocation(null);
      await fetchLocations();
    } catch (err: any) {
      showSnack(err.message || 'Failed to save table', 'error');
    }
  };

  const handleConfirmDeleteLocation = async () => {
    if (!personaId) return;
    try {
      if (selectedLocation) {
        await locationService.deleteTable(selectedLocation.id, personaId);
        showSnack('Table deleted successfully', 'success');
        await fetchLocations();
      }
      setLocationDeleteOpen(false);
      setSelectedLocation(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to delete table', 'error');
    }
  };

  const handleToggleStatus = async (id: string) => {
    if (!personaId) return;
    const location = locations.find((l) => l.id === id);
    if (!location) return;
    if (location.status === 'occupied') {
      showSnack('Cannot change status: table is currently occupied', 'error');
      return;
    }
    try {
      const newStatus = location.status === 'available' ? 'out_of_service' : 'available';
      await locationService.updateTableStatus(id, personaId, newStatus);
      showSnack('Status updated successfully', 'success');
      await fetchLocations();
    } catch (err: any) {
      showSnack(err.message || 'Failed to update status', 'error');
    }
  };

  const handleViewQR = async (location: ServiceLocation) => {
    if (!personaId) { setQrDialogLocation(location); return; }
    try {
      const fresh = await locationService.getTable(location.id, personaId);
      setQrDialogLocation(fresh);
    } catch {
      setQrDialogLocation(location);
    }
  };

  // ── Area handlers ──

  const handleEditArea = (area: ServiceArea) => {
    setSelectedArea(area);
    setAreaDialogOpen(true);
  };

  const handleDeleteArea = (areaId: string) => {
    const area = areas.find((a) => a.id === areaId);
    if (area) { setSelectedArea(area); setAreaDeleteOpen(true); }
  };

  const handleSaveArea = async (data: any) => {
    if (!personaId) return;
    try {
      if (selectedArea) {
        await locationService.updateArea(selectedArea.id, personaId, data);
        showSnack('Area updated successfully', 'success');
      } else {
        await locationService.createArea({ ...data, persona_id: personaId });
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
    if (!personaId) return;
    try {
      if (selectedArea) {
        await locationService.deleteArea(selectedArea.id, personaId);
        showSnack('Area deleted successfully', 'success');
        await fetchAreas();
      }
      setAreaDeleteOpen(false);
      setSelectedArea(null);
    } catch (err: any) {
      showSnack(err.message || 'Failed to delete area', 'error');
    }
  };

  // ── Bulk Print QR ──

  const handleBulkPrintQR = () => {
    if (filteredLocations.length === 0) {
      showSnack('No tables to print', 'error');
      return;
    }
    setBulkStyleOpen(true);
  };

  const handleBulkPrintConfirm = async () => {
    if (!personaId) return;
    setBulkStyleOpen(false);
    showSnack(`Generating QR codes for ${filteredLocations.length} table(s)...`, 'info');
    try {
      const items = await Promise.all(
        filteredLocations.map(async (loc): Promise<BulkQRItem> => {
          const qrResponse = await locationService.getQRCode(loc.id, personaId);
          const qrUrl = qrResponse.qr_code_url ?? qrResponse.qr_code;
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

  // ── Loading / error states ──

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: PRIMARY }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 480 }}>{error}</Alert>
      </Box>
    );
  }

  // ── Derived ──

  const canAdd   = activeTab === 'locations' ? canCreateTables : canCreateAreas;
  const addLabel = activeTab === 'locations' ? 'Add Table' : 'Add Area';

  const availableCount = locations.filter((l) => l.status === 'available').length;

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 3,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '22px', letterSpacing: '-0.3px', color: '#1C1C1E', lineHeight: 1.2 }}>
            Locations Management
          </Typography>
          <Typography sx={{ fontSize: '0.875rem', color: '#666666', mt: 0.5 }}>
            Manage tables and service areas
          </Typography>
        </Box>
        {!isMobile && canAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddNew}
            disableElevation
            sx={{
              bgcolor: PRIMARY,
              color: '#ffffff',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              py: 0.875,
              fontSize: '0.875rem',
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            {addLabel}
          </Button>
        )}
      </Box>

      {/* ── Stat Strip ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          py: 2.5,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        {[
          { icon: <TableBarIcon sx={{ fontSize: 18 }} />,   value: total || locations.length, label: 'Total Tables'     },
          { icon: <LocationOnIcon sx={{ fontSize: 18 }} />, value: areas.length,              label: 'Total Areas'      },
          { icon: <QrCodeIcon sx={{ fontSize: 18 }} />,     value: availableCount,            label: 'Available Tables' },
        ].map(({ icon, value, label }) => (
          <Box
            key={label}
            sx={{
              flex: '1 1 140px',
              bgcolor: '#f8fafc',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              px: 2.5,
              py: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: PRIMARY_BG,
                color: PRIMARY,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', lineHeight: 1.1, color: '#1C1C1E' }}>
                {value}
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#666666', mt: 0.25 }}>
                {label}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Toolbar ── */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #e0e0e0', bgcolor: '#ffffff' }}
      >
        <Box sx={{ px: 2.5, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>

          {/* Search */}
          <Box
            sx={{
              flex: '1 1 220px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#f8fafc',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              px: 1.5,
              py: 0.75,
              '&:focus-within': { borderColor: PRIMARY, boxShadow: `0 0 0 2px ${PRIMARY_BG}` },
              transition: 'border-color 0.15s, box-shadow 0.15s',
            }}
          >
            <SearchIcon sx={{ fontSize: 17, color: '#999999', flexShrink: 0 }} />
            <InputBase
              placeholder={activeTab === 'locations' ? 'Search tables...' : 'Search areas...'}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              sx={{ flex: 1, fontSize: '0.875rem', color: '#1C1C1E', '& input::placeholder': { color: '#999999' } }}
            />
            {searchQuery && (
              <IconButton size="small" onClick={() => handleSearchChange('')} sx={{ p: 0.25, color: '#999999' }}>
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>

          {/* Status filter */}
          <Select
            size="small"
            value={filterStatus}
            onChange={(e) => handleFilterChange(e.target.value)}
            displayEmpty
            sx={{
              minWidth: 130,
              borderRadius: 2,
              fontSize: '0.875rem',
              bgcolor: '#f8fafc',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#e0e0e0' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#c0c0c0' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PRIMARY },
            }}
          >
            <MenuItem value="all"         sx={{ fontSize: '0.875rem' }}>All Status</MenuItem>
            <MenuItem value="available"   sx={{ fontSize: '0.875rem' }}>Available</MenuItem>
            <MenuItem value="occupied"    sx={{ fontSize: '0.875rem' }}>Occupied</MenuItem>
            <MenuItem value="reserved"    sx={{ fontSize: '0.875rem' }}>Reserved</MenuItem>
            <MenuItem value="maintenance" sx={{ fontSize: '0.875rem' }}>Maintenance</MenuItem>
          </Select>

          {/* Result count */}
          <Typography sx={{ fontSize: '0.875rem', color: '#999999', ml: 'auto', flexShrink: 0 }}>
            {activeTab === 'locations'
              ? `${filteredLocations.length} table${filteredLocations.length !== 1 ? 's' : ''}`
              : `${filteredAreas.length} area${filteredAreas.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>
      </Paper>

      {/* ── Tabs ── */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 0, border: 'none', borderBottom: '1px solid #e0e0e0', bgcolor: '#ffffff' }}
      >
        <MuiTabs
          value={activeTab}
          onChange={(_, v) => handleTabChange(v)}
          sx={{
            px: 2,
            minHeight: 44,
            '& .MuiTabs-indicator': { bgcolor: PRIMARY, height: 2 },
            '& .MuiTab-root': {
              minHeight: 44,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.875rem',
              color: '#666666',
              px: 2,
              '&.Mui-selected': { color: '#1C1C1E' },
            },
          }}
        >
          <Tab value="locations" label={`Tables (${total || locations.length})`} />
          <Tab value="areas"     label={`Areas (${areas.length})`} />
        </MuiTabs>
      </Paper>

      {/* ── Content Area ── */}
      <Box sx={{ bgcolor: '#f8fafc', px: { xs: 2, sm: 3, md: 5 }, pt: 3, pb: 6 }}>

        {/* ── Tables tab ── */}
        {activeTab === 'locations' && (
          <>
            {filteredLocations.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontSize: '0.875rem', color: '#999999' }}>
                  {filteredLocations.length} table{filteredLocations.length !== 1 ? 's' : ''}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PrintIcon sx={{ fontSize: 15 }} />}
                  onClick={handleBulkPrintQR}
                  sx={{
                    height: 32,
                    px: 1.5,
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderRadius: 2,
                    color: '#1C1C1E',
                    borderColor: '#e0e0e0',
                    '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_BG },
                  }}
                >
                  Print All QRs
                </Button>
              </Box>
            )}

            {filteredLocations.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ p: 6, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 3, bgcolor: '#ffffff', mt: 3 }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <QrCodeIcon sx={{ fontSize: 28, color: '#999999' }} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#666666', fontSize: '0.95rem', mb: 0.5 }}>
                  {searchQuery || filterStatus !== 'all' ? 'No results found' : 'No tables yet'}
                </Typography>
                <Typography sx={{ color: '#999999', fontSize: '0.82rem' }}>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first table'}
                </Typography>
                {!(searchQuery || filterStatus !== 'all') && canCreateTables && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelectedLocation(null); setLocationDialogOpen(true); }}
                    disableElevation
                    sx={{
                      mt: 3,
                      bgcolor: PRIMARY,
                      color: '#ffffff',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontSize: '0.875rem',
                      '&:hover': { bgcolor: '#1565C0' },
                    }}
                  >
                    Add Table
                  </Button>
                )}
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', bgcolor: '#ffffff' }}>
                {filteredLocations.map((location, idx) => (
                  <React.Fragment key={location.id}>
                    <LocationCard
                      location={location}
                      areaName={areas.find((a) => a.id === location.areaId)?.name}
                      onEdit={handleEditLocation}
                      onDelete={handleDeleteLocation}
                      onToggleStatus={handleToggleStatus}
                      onViewQR={handleViewQR}
                    />
                    {idx < filteredLocations.length - 1 && <Divider sx={{ borderColor: '#f3f4f6' }} />}
                  </React.Fragment>
                ))}
                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[10, 25, 50]}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  sx={{
                    borderTop: '1px solid #e0e0e0',
                    bgcolor: '#ffffff',
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.8125rem',
                      color: '#666666',
                    },
                  }}
                />
              </Paper>
            )}
          </>
        )}

        {/* ── Areas tab ── */}
        {activeTab === 'areas' && (
          <>
            {filteredAreas.length === 0 ? (
              <Paper
                elevation={0}
                sx={{ p: 6, textAlign: 'center', border: '1px solid #e0e0e0', borderRadius: 3, bgcolor: '#ffffff', mt: 3 }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    bgcolor: '#f8fafc',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 28, color: '#999999' }} />
                </Box>
                <Typography sx={{ fontWeight: 600, color: '#666666', fontSize: '0.95rem', mb: 0.5 }}>
                  {searchQuery || filterStatus !== 'all' ? 'No results found' : 'No areas yet'}
                </Typography>
                <Typography sx={{ color: '#999999', fontSize: '0.82rem' }}>
                  {searchQuery || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria'
                    : 'Get started by adding your first area'}
                </Typography>
                {!(searchQuery || filterStatus !== 'all') && canCreateAreas && (
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => { setSelectedArea(null); setAreaDialogOpen(true); }}
                    disableElevation
                    sx={{
                      mt: 3,
                      bgcolor: PRIMARY,
                      color: '#ffffff',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 3,
                      py: 1,
                      fontSize: '0.875rem',
                      '&:hover': { bgcolor: '#1565C0' },
                    }}
                  >
                    Add Area
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                <Grid container spacing={2}>
                  {pagedAreas.map((area) => (
                    <Grid item xs={12} sm={6} md={4} key={area.id}>
                      <AreaCard
                        area={area}
                        locationCount={locationCountByArea(area.id)}
                        onEdit={handleEditArea}
                        onDelete={handleDeleteArea}
                      />
                    </Grid>
                  ))}
                </Grid>
                {filteredAreas.length > areaRowsPerPage && (
                  <Paper
                    elevation={0}
                    sx={{ mt: 2, border: '1px solid #e0e0e0', borderRadius: 2, overflow: 'hidden', bgcolor: '#ffffff' }}
                  >
                    <TablePagination
                      component="div"
                      count={filteredAreas.length}
                      page={areaPage}
                      rowsPerPage={areaRowsPerPage}
                      rowsPerPageOptions={[10, 25, 50]}
                      onPageChange={(_, newPage) => setAreaPage(newPage)}
                      onRowsPerPageChange={(e) => {
                        setAreaRowsPerPage(parseInt(e.target.value, 10));
                        setAreaPage(0);
                      }}
                      sx={{
                        bgcolor: '#ffffff',
                        '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                          fontSize: '0.8125rem',
                          color: '#666666',
                        },
                      }}
                    />
                  </Paper>
                )}
              </>
            )}
          </>
        )}

      </Box>

      {/* ── Mobile FAB ── */}
      {isMobile && canAdd && (
        <Fab
          onClick={handleAddNew}
          sx={{
            position: 'fixed',
            bottom: 80,
            right: 16,
            bgcolor: PRIMARY,
            color: '#ffffff',
            '&:hover': { bgcolor: '#1565C0' },
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* ── Location form dialog ── */}
      <ServiceLocationFormDialog
        open={locationDialogOpen}
        onClose={() => { setLocationDialogOpen(false); setSelectedLocation(null); }}
        onSave={handleSaveLocation}
        table={selectedLocation}
        areas={areas}
      />

      {/* ── Location delete dialog ── */}
      <DeleteConfirmationDialog
        open={locationDeleteOpen}
        onClose={() => { setLocationDeleteOpen(false); setSelectedLocation(null); }}
        onConfirm={handleConfirmDeleteLocation}
        title="Delete Table"
        itemName={selectedLocation?.name || selectedLocation?.identifier || ''}
        itemType="table"
        description="This will remove this table from the system. This action can be undone later."
        requireTyping={false}
      />

      {/* ── Area form dialog ── */}
      <ServiceAreaFormDialog
        open={areaDialogOpen}
        onClose={() => { setAreaDialogOpen(false); setSelectedArea(null); }}
        onSave={handleSaveArea}
        area={selectedArea}
      />

      {/* ── Area delete dialog ── */}
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
        PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
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
              Choose a card style for all {filteredLocations.length} QR codes
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
                  border: `1.5px solid ${bulkStyle === s.value ? PRIMARY : '#e0e0e0'}`,
                  bgcolor: bulkStyle === s.value ? PRIMARY_BG : '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: PRIMARY, bgcolor: PRIMARY_BG },
                }}
              >
                <Radio
                  checked={bulkStyle === s.value}
                  size="small"
                  sx={{ p: 0, color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
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
              bgcolor: PRIMARY,
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
            }}
          >
            Print All QRs
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── QR viewer ── */}
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