import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  Payment,
  TrendingUp,
  Receipt,
  CreditCard,
  Visibility,
  Edit,
  Close,
} from '@mui/icons-material';
import { systemBillingService } from '../../services/system/billing';

const Billing: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Dialog states
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Form states
  const [editForm, setEditForm] = useState({
    plan: '',
    status: '',
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [billingData, statsData] = await Promise.all([
        systemBillingService.getAllBilling(1, 100),
        systemBillingService.getStats(),
      ]);
      setSubscriptions(billingData);
      setStats(statsData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch billing data:', err);
      setError(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'past due':
        return '#ef4444';
      case 'cancelled':
      case 'inactive':
        return '#64748b';
      case 'trial':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'premium':
      case 'pro':
        return '#f59e0b';
      case 'standard':
      case 'basic':
        return '#3b82f6';
      case 'enterprise':
        return '#8b5cf6';
      default:
        return '#64748b';
    }
  };

  const handleViewDetails = async (workspace: any) => {
    setSelectedWorkspace(workspace);
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    
    try {
      const details = await systemBillingService.getWorkspaceBilling(workspace.workspace_id);
      setWorkspaceDetails(details);
    } catch (err: any) {
      console.error('Failed to fetch workspace details:', err);
      setWorkspaceDetails(workspace);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEditSubscription = (workspace: any) => {
    setSelectedWorkspace(workspace);
    setEditForm({
      plan: workspace.subscription_plan || '',
      status: workspace.subscription_status || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveSubscription = async () => {
    if (!selectedWorkspace) return;

    try {
      await systemBillingService.updateSubscription(
        selectedWorkspace.workspace_id,
        editForm.plan,
        editForm.status
      );
      setSnackbar({
        open: true,
        message: 'Subscription updated successfully',
        severity: 'success',
      });
      setEditDialogOpen(false);
      setSelectedWorkspace(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update subscription',
        severity: 'error',
      });
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            Billing Management
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage subscriptions and billing
          </Typography>
        </Box>

        {/* Stats */}
        {stats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                }}
              >
                <Payment sx={{ fontSize: 32, color: '#0f172a', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.active_subscriptions || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Subscriptions
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                }}
              >
                <TrendingUp sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  ${stats.monthly_revenue || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Revenue
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                }}
              >
                <Receipt sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.total_invoices || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Invoices
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: 2,
                }}
              >
                <CreditCard sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.past_due || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Past Due
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Subscriptions Table */}
        {subscriptions.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <Payment sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
              No Subscriptions Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no billing records in the system yet.
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Workspace</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Plan</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Next Billing</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subscriptions.map((sub) => (
                  <TableRow
                    key={sub.workspace_id}
                    sx={{
                      '&:hover': { bgcolor: '#f8fafc' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sub.workspace_name || sub.workspace_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.subscription_plan || 'Free'}
                        size="small"
                        sx={{
                          bgcolor: alpha(getPlanColor(sub.subscription_plan), 0.1),
                          color: getPlanColor(sub.subscription_plan),
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={sub.subscription_status || 'Active'}
                        size="small"
                        sx={{
                          bgcolor: alpha(getStatusColor(sub.subscription_status), 0.1),
                          color: getStatusColor(sub.subscription_status),
                          fontWeight: 600,
                          border: `1px solid ${alpha(getStatusColor(sub.subscription_status), 0.3)}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        ${sub.amount || 0}/{sub.billing_cycle === 'Yearly' ? 'yr' : 'mo'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: sub.next_billing_date ? '#10b981' : '#64748b' }}>
                        {sub.next_billing_date ? new Date(sub.next_billing_date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" sx={{ color: '#3b82f6' }} onClick={() => handleViewDetails(sub)}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Subscription">
                        <IconButton size="small" sx={{ color: '#0f172a' }} onClick={() => handleEditSubscription(sub)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: alpha('#0f172a', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Payment sx={{ fontSize: 24, color: '#0f172a' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Billing Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedWorkspace?.workspace_name || selectedWorkspace?.workspace_id}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setDetailsDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 0 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : workspaceDetails ? (
            <Box>
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Subscription Information
                </Typography>
                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Subscription Plan</Typography>}
                      secondary={
                        <Chip
                          label={workspaceDetails.subscription_plan || 'Free'}
                          size="small"
                          sx={{
                            bgcolor: alpha(getPlanColor(workspaceDetails.subscription_plan), 0.1),
                            color: getPlanColor(workspaceDetails.subscription_plan),
                            fontWeight: 600,
                            mt: 0.5,
                          }}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Status</Typography>}
                      secondary={
                        <Chip
                          label={workspaceDetails.subscription_status || 'Active'}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(workspaceDetails.subscription_status), 0.1),
                            color: getStatusColor(workspaceDetails.subscription_status),
                            fontWeight: 600,
                            mt: 0.5,
                          }}
                        />
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Billing Email</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.billing_email || 'N/A'}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Billing Address</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.billing_address || 'N/A'}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Next Billing Date</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                          {workspaceDetails.next_billing_date 
                            ? new Date(workspaceDetails.next_billing_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })
                            : 'N/A'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Billing Cycle</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.billing_cycle || 'Monthly'}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Amount</Typography>}
                      secondary={
                        <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '1.125rem', color: '#0f172a' }}>
                          ${workspaceDetails.amount || 0} {workspaceDetails.currency || 'USD'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Payment Method</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.payment_method || 'Not Set'}</Typography>}
                    />
                  </ListItem>
                </List>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No details available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setDetailsDialogOpen(false)} variant="outlined" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Edit Subscription
          </Typography>
          <IconButton onClick={() => setEditDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Subscription Plan</InputLabel>
              <Select
                value={editForm.plan}
                onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                label="Subscription Plan"
              >
                <MenuItem value="Free">Free</MenuItem>
                <MenuItem value="Basic">Basic</MenuItem>
                <MenuItem value="Standard">Standard</MenuItem>
                <MenuItem value="Premium">Premium</MenuItem>
                <MenuItem value="Pro">Pro</MenuItem>
                <MenuItem value="Enterprise">Enterprise</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                label="Status"
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Trial">Trial</MenuItem>
                <MenuItem value="Past Due">Past Due</MenuItem>
                <MenuItem value="Cancelled">Cancelled</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSubscription}
            variant="contained"
            sx={{
              textTransform: 'none',
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

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
          sx={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: 1.5,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Billing;