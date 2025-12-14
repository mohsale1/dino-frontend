import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  useTheme,
  Avatar,
  Stack,
  LinearProgress,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
} from '@mui/material';
import {
  TableRestaurant,
  People,
  CheckCircle,
  Schedule,
  Warning,
  AccessTime,
  Refresh,
  CleaningServices,
  Edit,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../../auth';
import { dashboardService, tableService } from '../../../../services/business';
import { useUserData } from '../../../../contexts/UserDataContext';
import { useAuth } from '../../../../contexts/AuthContext';

interface TableStatus {
  id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  current_order_id?: string;
  occupancy_time?: number;
  capacity?: number;
  area_id?: string;
}

interface TablesOrdersTabProps {
  tableStatuses?: TableStatus[];
  analyticsData?: any;
}

type TableStatusType = 'available' | 'occupied' | 'reserved' | 'maintenance';

const TablesOrdersTab: React.FC<TablesOrdersTabProps> = ({ tableStatuses: propTableStatuses, analyticsData }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { canManageTables } = usePermissions();
  const { userData } = useUserData();
  const { user } = useAuth();
  const currentVenue = userData?.venue;
  
  const [tableStatuses, setTableStatuses] = useState<TableStatus[]>(propTableStatuses || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selectedTable, setSelectedTable] = useState<TableStatus | null>(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<TableStatusType>('available');
  const [updating, setUpdating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Fetch real table data from backend using tables API
  const fetchTableData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get tables directly from the tables API
      const tablesResponse = await tableService.getTables({
        venueId: currentVenue?.id,
        isActive: true
      });
      
      if (tablesResponse && tablesResponse.data && tablesResponse.data.length > 0) {
        // Map the table data to our TableStatus interface
        const mappedTables: TableStatus[] = tablesResponse.data.map((table: any) => ({
          id: table.id,
          table_number: table.table_number || table.tableNumber || 'Unknown',
          status: table.table_status || table.status || 'available',
          current_order_id: table.current_order_id || table.currentOrderId,
          occupancy_time: table.occupancy_time || table.occupancyTime,
          capacity: table.capacity,
          area_id: table.area_id || table.areaId,
        }));
        
        setTableStatuses(mappedTables);
        setLastRefresh(new Date());
        return;
      }
      
      // Fallback: Try to get from dashboard data
      const dashboardData = await dashboardService.getAdminDashboard();
      
      if (dashboardData && (dashboardData as any).tables) {
        const tables = (dashboardData as any).tables as TableStatus[];
        setTableStatuses(tables);
        setLastRefresh(new Date());
      } else {
        // No tables found
        setTableStatuses([]);
      }
    } catch (err: any) {
      console.error('Error fetching table data:', err);
      setError(err?.message || 'Failed to load table data');
      setTableStatuses([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and auto-refresh
  useEffect(() => {
    // Always try to fetch table data, even without venue
    fetchTableData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchTableData();
    }, 30000);

    return () => clearInterval(interval);
  }, [currentVenue?.id, user]);

  // Update when prop changes
  useEffect(() => {
    if (propTableStatuses && propTableStatuses.length > 0) {
      setTableStatuses(propTableStatuses);
    }
  }, [propTableStatuses]);

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return '#F44336';
      case 'available': return '#4CAF50';
      case 'reserved': return '#FF9800';
      case 'maintenance': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied': return <People sx={{ fontSize: 12 }} />;
      case 'available': return <CheckCircle sx={{ fontSize: 12 }} />;
      case 'reserved': return <Schedule sx={{ fontSize: 12 }} />;
      case 'maintenance': return <CleaningServices sx={{ fontSize: 12 }} />;
      default: return <Warning sx={{ fontSize: 12 }} />;
    }
  };

  const handleOpenStatusDialog = (table: TableStatus) => {
    setSelectedTable(table);
    setNewStatus(table.status);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setOpenStatusDialog(false);
    setSelectedTable(null);
  };

  const handleUpdateStatus = async () => {
    if (!selectedTable || newStatus === selectedTable.status) {
      handleCloseStatusDialog();
      return;
    }

    setUpdating(true);
    try {
      console.log('Updating table status:', {
        tableId: selectedTable.id,
        currentStatus: selectedTable.status,
        newStatus: newStatus
      });
      
      await tableService.updateTableStatus(selectedTable.id, newStatus);
      
      // Update local state
      setTableStatuses(prev => prev.map(table => 
        table.id === selectedTable.id ? { ...table, status: newStatus } : table
      ));
      
      setSnackbar({
        open: true,
        message: `Table ${selectedTable.table_number} status updated to ${newStatus}`,
        severity: 'success'
      });
      
      handleCloseStatusDialog();
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchTableData();
      }, 1000);
    } catch (err: any) {
      console.error('Error updating table status:', err);
      setSnackbar({
        open: true,
        message: err?.message || 'Failed to update table status',
        severity: 'error'
      });
    } finally {
      setUpdating(false);
    }
  };

  // Calculate table analytics
  const totalTables = tableStatuses.length;
  const occupiedTables = tableStatuses.filter(table => table.status === 'occupied').length;
  const availableTables = tableStatuses.filter(table => table.status === 'available').length;
  const reservedTables = tableStatuses.filter(table => table.status === 'reserved').length;
  const maintenanceTables = tableStatuses.filter(table => table.status === 'maintenance').length;
  const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;
  const avgOccupancyTime = tableStatuses
    .filter(table => table.occupancy_time)
    .reduce((sum, table) => sum + (table.occupancy_time || 0), 0) / 
    Math.max(tableStatuses.filter(table => table.occupancy_time).length, 1);

  const statusStats = [
    { label: 'Available', count: availableTables, color: '#4CAF50', icon: <CheckCircle /> },
    { label: 'Occupied', count: occupiedTables, color: '#F44336', icon: <People /> },
    { label: 'Reserved', count: reservedTables, color: '#FF9800', icon: <Schedule /> },
    { label: 'Maintenance', count: maintenanceTables, color: '#9E9E9E', icon: <CleaningServices /> },
  ];

  const statusOptions: { value: TableStatusType; label: string; description: string }[] = [
    { value: 'available', label: 'Available', description: 'Table is ready for guests' },
    { value: 'occupied', label: 'Occupied', description: 'Table is currently in use' },
    { value: 'reserved', label: 'Reserved', description: 'Table is reserved for upcoming guests' },
    { value: 'maintenance', label: 'Maintenance', description: 'Table is under maintenance/cleaning' },
  ];

  return (
    <Grid container spacing={1}>
      {/* Error Alert */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Status Distribution */}
      <Grid item xs={12} md={4}>
        <Card sx={{ 
          borderRadius: 1,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Tables Distribution
              </Typography>
              <Tooltip title="Refresh">
                <IconButton 
                  size="small" 
                  onClick={fetchTableData}
                  disabled={loading}
                  sx={{ 
                    backgroundColor: 'primary.50',
                    '&:hover': { backgroundColor: 'primary.100' }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : <Refresh fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
            
            <Stack spacing={1}>
              {statusStats.map((stat) => (
                <Box key={stat.label} sx={{ 
                  p: 1.5, 
                  backgroundColor: `${stat.color}15`,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: `${stat.color}40`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ 
                        backgroundColor: stat.color,
                        width: 32,
                        height: 32
                      }}>
                        {React.cloneElement(stat.icon, { fontSize: 'small' })}
                      </Avatar>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {stat.label}
                      </Typography>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.count}
                    </Typography>
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={totalTables > 0 ? (stat.count / totalTables) * 100 : 0} 
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.5)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 3,
                        backgroundColor: stat.color
                      }
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {totalTables > 0 ? Math.round((stat.count / totalTables) * 100) : 0}% of total tables
                  </Typography>
                </Box>
              ))}
            </Stack>

            {/* Quick Stats */}
            <Box sx={{ mt: 1, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {occupancyRate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Occupancy Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {Math.round(avgOccupancyTime || 0)}m
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Avg Duration
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Last Refresh */}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
              Last updated: {lastRefresh.toLocaleTimeString()}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Table Status Grid */}
      <Grid item xs={12} md={8}>
        <Card sx={{ 
          borderRadius: 1,
          boxShadow: theme.shadows[2],
          border: '1px solid',
          borderColor: 'divider',
          height: '100%'
        }}>
          <CardContent sx={{ p: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Table Status Grid
              </Typography>
              {canManageTables && (
                <Chip
                  label="Manage Tables"
                  onClick={() => navigate('/admin/tables')}
                  sx={{
                    fontWeight: 600,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.main',
                      color: 'white'
                    }
                  }}
                />
              )}
            </Box>

            {loading && tableStatuses.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                py: 8 
              }}>
                <CircularProgress />
              </Box>
            ) : tableStatuses.length === 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: 1, 
                py: 8,
                backgroundColor: 'grey.50',
                borderRadius: 1,
                border: '2px dashed',
                borderColor: 'grey.300'
              }}>
                <TableRestaurant sx={{ fontSize: 64, color: 'grey.400' }} />
                <Typography variant="h6" color="text.secondary">No Table Data Available</Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Table status information will appear here once tables are configured.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={1} sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
                {tableStatuses.map((table) => (
                  <Grid item xs={12} sm={6} lg={4} key={table.id}>
                    <Card sx={{ 
                      border: '2px solid',
                      borderColor: getTableStatusColor(table.status),
                      borderRadius: 1,
                      transition: 'all 0.3s ease',
                      backgroundColor: `${getTableStatusColor(table.status)}08`,
                      '&:hover': {
                        boxShadow: theme.shadows[4],
                        transform: 'translateY(-2px)'
                      }
                    }}>
                      <CardContent sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TableRestaurant sx={{ color: getTableStatusColor(table.status) }} />
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                              {table.table_number}
                            </Typography>
                          </Box>
                          <Chip
                            icon={getTableStatusIcon(table.status)}
                            label={table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                            size="small"
                            sx={{
                              backgroundColor: getTableStatusColor(table.status),
                              color: 'white',
                              fontWeight: 600,
                              '& .MuiChip-icon': {
                                color: 'white'
                              }
                            }}
                          />
                        </Box>
                        
                        <Stack spacing={1}>
                          {table.capacity && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <People sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Capacity: {table.capacity} guests
                              </Typography>
                            </Box>
                          )}

                          {table.current_order_id && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" color="text.secondary">Order:</Typography>
                              <Chip 
                                label={table.current_order_id} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                            </Box>
                          )}
                          
                          {table.occupancy_time && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Occupied: {table.occupancy_time} minutes
                              </Typography>
                            </Box>
                          )}
                          
                          {table.status === 'available' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircle sx={{ fontSize: 12, color: 'success.main' }} />
                              <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                                Ready for guests
                              </Typography>
                            </Box>
                          )}

                          {table.status === 'maintenance' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CleaningServices sx={{ fontSize: 12, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                Under maintenance
                              </Typography>
                            </Box>
                          )}
                        </Stack>

                        {/* Update Status Button */}
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleOpenStatusDialog(table)}
                          sx={{ 
                            mt: 1,
                            borderRadius: 1,
                            fontWeight: 600,
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-1px)',
                              boxShadow: 2
                            }
                          }}
                        >
                          Update Status
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 1 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="600">
            Update Table Status
          </Typography>
          {selectedTable && (
            <Typography variant="body2" color="text.secondary">
              Table {selectedTable.table_number}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent>
          {selectedTable && (
            <>
              {/* Current Status */}
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Status
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={getTableStatusIcon(selectedTable.status)}
                    label={selectedTable.status.charAt(0).toUpperCase() + selectedTable.status.slice(1)}
                    sx={{
                      backgroundColor: getTableStatusColor(selectedTable.status),
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': {
                        color: 'white'
                      }
                    }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 1 }} />

              {/* Status Selection */}
              <FormControl fullWidth sx={{ mb: 1 }}>
                <InputLabel>New Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TableStatusType)}
                  label="New Status"
                  disabled={updating}
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Box sx={{ color: getTableStatusColor(option.value) }}>
                          {getTableStatusIcon(option.value)}
                        </Box>
                        <Box>
                          <Typography variant="body1">{option.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {option.description}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Status Preview */}
              {newStatus !== selectedTable.status && (
                <Box sx={{ 
                  p: 1, 
                  backgroundColor: 'grey.50', 
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      icon={getTableStatusIcon(newStatus)}
                      label={newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}
                      sx={{
                        backgroundColor: getTableStatusColor(newStatus),
                        color: 'white',
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'white'
                        }
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {statusOptions.find(opt => opt.value === newStatus)?.description}
                    </Typography>
                  </Box>
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 1.5, pt: 1 }}>
          <Button 
            onClick={handleCloseStatusDialog}
            disabled={updating}
            sx={{ borderRadius: 1 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateStatus}
            disabled={updating || !selectedTable || newStatus === selectedTable.status}
            variant="contained"
            startIcon={updating ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{ borderRadius: 1 }}
          >
            {updating ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default TablesOrdersTab;