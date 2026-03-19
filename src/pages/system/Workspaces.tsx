import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Business,
  TrendingUp,
  AttachMoney,
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
} from '@mui/icons-material';
import { systemWorkspaceService } from '../../services/system/workspace';

const Workspaces: React.FC = () => {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState<any | null>(null);
  const [workspaceDetails, setWorkspaceDetails] = useState<any | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);
      const data = await systemWorkspaceService.getWorkspaces();
      setWorkspaces(data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch workspaces:', err);
      setError(err.message || 'Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

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
      // Fetch full workspace details
      const details = await systemWorkspaceService.getWorkspace(workspace.id);
      setWorkspaceDetails(details);
    } catch (err: any) {
      console.error('Failed to fetch workspace details:', err);
      setWorkspaceDetails(workspace); // Fallback to basic data
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsDialogOpen(false);
    setSelectedWorkspace(null);
    setWorkspaceDetails(null);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'inactive':
      case 'suspended':
        return '#ef4444';
      case 'trial':
        return '#f59e0b';
      default:
        return '#64748b';
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
            Workspaces
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Manage all business workspaces
          </Typography>
        </Box>

        {/* Stats */}
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
              <Business sx={{ fontSize: 32, color: '#0f172a', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {workspaces.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Workspaces
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
              <Business sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {workspaces.filter(w => w.isActive).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Workspaces
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
              <AttachMoney sx={{ fontSize: 32, color: '#3b82f6', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {workspaces.filter(w => w.subscriptionStatus?.toLowerCase() === 'active').length}
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
              <TrendingUp sx={{ fontSize: 32, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                {workspaces.filter(w => w.subscriptionPlan?.toLowerCase() === 'premium' || w.subscriptionPlan?.toLowerCase() === 'pro').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Premium Plans
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <Business sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
              No Workspaces Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no workspaces in the system yet.
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {workspaces.map((workspace) => (
              <Grid item xs={12} md={6} lg={4} key={workspace.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: alpha('#0f172a', 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                        }}
                      >
                        <Business sx={{ fontSize: 24, color: '#0f172a' }} />
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                          {workspace.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {workspace.id}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip
                          label={workspace.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(workspace.isActive ? 'active' : 'inactive'), 0.1),
                            color: getStatusColor(workspace.isActive ? 'active' : 'inactive'),
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 22,
                            border: `1px solid ${alpha(getStatusColor(workspace.isActive ? 'active' : 'inactive'), 0.3)}`,
                          }}
                        />
                      </Box>
                      {workspace.subscriptionPlan && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Plan
                          </Typography>
                          <Chip
                            label={workspace.subscriptionPlan}
                            size="small"
                            sx={{
                              bgcolor: alpha(getPlanColor(workspace.subscriptionPlan), 0.1),
                              color: getPlanColor(workspace.subscriptionPlan),
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 22,
                            }}
                          />
                        </Box>
                      )}
                      {workspace.subscriptionStatus && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Subscription
                          </Typography>
                          <Chip
                            label={workspace.subscriptionStatus}
                            size="small"
                            sx={{
                              bgcolor: alpha(getStatusColor(workspace.subscriptionStatus), 0.1),
                              color: getStatusColor(workspace.subscriptionStatus),
                              fontWeight: 600,
                              fontSize: '0.75rem',
                              height: 22,
                            }}
                          />
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {new Date(workspace.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>

                    {workspace.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {workspace.description}
                      </Typography>
                    )}

                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => handleViewDetails(workspace)}
                      sx={{
                        mt: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderColor: '#e2e8f0',
                        color: '#0f172a',
                        '&:hover': {
                          borderColor: '#0f172a',
                          bgcolor: alpha('#0f172a', 0.05),
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Workspace Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
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
              <Business sx={{ fontSize: 24, color: '#0f172a' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Workspace Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedWorkspace?.name}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleCloseDetails} size="small">
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
              {/* Basic Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Workspace ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {workspaceDetails.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Organization ID
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                      {workspaceDetails.organizationId || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {workspaceDetails.description || 'No description provided'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      label={workspaceDetails.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), 0.1),
                        color: getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 22,
                        border: `1px solid ${alpha(getStatusColor(workspaceDetails.isActive ? 'active' : 'inactive'), 0.3)}`,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Order Type
                    </Typography>
                    <Chip
                      label={workspaceDetails.orderType === 0 ? 'Online (Self-Service)' : 'Manual (Counter)'}
                      size="small"
                      sx={{
                        bgcolor: alpha('#3b82f6', 0.1),
                        color: '#3b82f6',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 22,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Owner Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Owner Information
                </Typography>
                <List disablePadding>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Person sx={{ fontSize: 20, color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary">
                          Owner Name
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {workspaceDetails.ownerName || 'N/A'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Email sx={{ fontSize: 20, color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="caption" color="text.secondary">
                          Owner Email
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {workspaceDetails.ownerEmail || 'N/A'}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {workspaceDetails.ownerPhone && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Phone sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="text.secondary">
                            Owner Phone
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {workspaceDetails.ownerPhone}
                          </Typography>
                        }
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Divider />

              {/* Location Information */}
              {(workspaceDetails.address || workspaceDetails.city || workspaceDetails.phone || workspaceDetails.email) && (
                <>
                  <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                      Location & Contact
                    </Typography>
                    <List disablePadding>
                      {workspaceDetails.address && (
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <LocationOn sx={{ fontSize: 20, color: '#64748b' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="caption" color="text.secondary">
                                Address
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {workspaceDetails.address}
                                {workspaceDetails.city && `, ${workspaceDetails.city}`}
                                {workspaceDetails.state && `, ${workspaceDetails.state}`}
                                {workspaceDetails.postalCode && ` ${workspaceDetails.postalCode}`}
                                {workspaceDetails.country && `, ${workspaceDetails.country}`}
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                      {workspaceDetails.phone && (
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Phone sx={{ fontSize: 20, color: '#64748b' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="caption" color="text.secondary">
                                Phone
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {workspaceDetails.phone}
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                      {workspaceDetails.email && (
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Email sx={{ fontSize: 20, color: '#64748b' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography variant="caption" color="text.secondary">
                                Email
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {workspaceDetails.email}
                              </Typography>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Subscription Information */}
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Subscription & Billing
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Subscription Plan
                    </Typography>
                    <Chip
                      label={workspaceDetails.subscriptionPlan || 'Free'}
                      size="small"
                      sx={{
                        bgcolor: alpha(getPlanColor(workspaceDetails.subscriptionPlan), 0.1),
                        color: getPlanColor(workspaceDetails.subscriptionPlan),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 22,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      Subscription Status
                    </Typography>
                    <Chip
                      label={workspaceDetails.subscriptionStatus || 'Active'}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(workspaceDetails.subscriptionStatus), 0.1),
                        color: getStatusColor(workspaceDetails.subscriptionStatus),
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 22,
                      }}
                    />
                  </Grid>
                  {workspaceDetails.billingEmail && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Billing Email
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {workspaceDetails.billingEmail}
                      </Typography>
                    </Grid>
                  )}
                  {workspaceDetails.billingAddress && (
                    <Grid item xs={12}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Billing Address
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {workspaceDetails.billingAddress}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              <Divider />

              {/* Timestamps */}
              <Box sx={{ p: 3, bgcolor: alpha('#f8fafc', 0.5) }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: '#0f172a' }}>
                  Registration Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="text.secondary">
                            Created At
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(workspaceDetails.createdAt).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="caption" color="text.secondary">
                            Last Updated
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {new Date(workspaceDetails.updatedAt).toLocaleString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </Grid>
                </Grid>
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
          <Button onClick={handleCloseDetails} variant="outlined" sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workspaces;
