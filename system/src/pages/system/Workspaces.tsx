import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  alpha,
  CircularProgress,
  Alert,
  Dialog,
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
  Close,
  Person,
  Email,
  Phone,
  LocationOn,
  CalendarToday,
  CheckCircleOutline,
  AttachMoneyOutlined,
  TrendingUpOutlined,
  BusinessOutlined,
} from '@mui/icons-material';
import { systemWorkspaceService } from '../../services/system/workspace';

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
const useCountUp = (target: number, duration = 900) => {
  const [count, setCount] = React.useState(0);
  const raf = useRef<number>(0);
  React.useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
};

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------
interface HeroStatProps { label: string; value: number; icon: React.ReactElement; }
const HeroStat: React.FC<HeroStatProps> = ({ label, value, icon }) => {
  const animated = useCountUp(value);
  return (
    <Box sx={{
      flex: '1 1 140px',
      px: 2.5,
      py: 2,
      borderRadius: 2.5,
      bgcolor: alpha('#ffffff', 0.07),
      border: `1px solid ${alpha('#ffffff', 0.12)}`,
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      gap: 2,
      transition: 'background-color 0.2s',
      '&:hover': { bgcolor: alpha('#ffffff', 0.11) },
    }}>
      <Box sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        flexShrink: 0,
        bgcolor: alpha('#ffffff', 0.1),
        border: `1px solid ${alpha('#ffffff', 0.15)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: alpha('#c7d2fe', 0.9),
        '& svg': { fontSize: 18 },
      }}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{
          fontWeight: 700,
          color: '#ffffff',
          fontSize: { xs: '1.35rem', md: '1.6rem' },
          lineHeight: 1,
          letterSpacing: '-0.03em',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {animated}
        </Typography>
        <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.65), fontSize: '0.75rem', fontWeight: 500 }}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
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
      const details = await systemWorkspaceService.getWorkspace(workspace.id);
      setWorkspaceDetails(details);
    } catch (err: any) {
      console.error('Failed to fetch workspace details:', err);
      setWorkspaceDetails(workspace);
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

  // Derived stat values
  const totalWorkspaces = workspaces.length;
  const activeWorkspaces = workspaces.filter(w => w.isActive).length;
  const activeSubscriptions = workspaces.filter(w => w.subscriptionStatus?.toLowerCase() === 'active').length;
  const premiumPlans = workspaces.filter(w =>
    w.subscriptionPlan?.toLowerCase() === 'premium' || w.subscriptionPlan?.toLowerCase() === 'pro'
  ).length;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        <CircularProgress sx={{ color: '#6366f1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)',
          px: { xs: 2.5, sm: 4, md: 6 },
          pt: { xs: 3, md: 4 },
          pb: { xs: 4, md: 5 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -100,
            right: -60,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#6366f1', 0.22)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -80,
            left: '25%',
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${alpha('#8b5cf6', 0.15)} 0%, transparent 70%)`,
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${alpha('#ffffff', 0.03)} 1px, transparent 1px), linear-gradient(90deg, ${alpha('#ffffff', 0.03)} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative' }}>
          {/* Title row */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <Box>
              <Typography variant="overline" sx={{ color: alpha('#c7d2fe', 0.75), fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}>
                SYSTEM CONTROL CENTER
              </Typography>
              <Typography variant="h4" sx={{ color: '#ffffff', fontWeight: 800, mt: 0.5, fontSize: { xs: '1.5rem', md: '2rem' }, letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                Workspaces
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
                <CalendarToday sx={{ fontSize: 13, color: alpha('#c7d2fe', 0.6) }} />
                <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.6), fontWeight: 500, fontSize: '0.75rem' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Hero Stats */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <HeroStat label="Total Workspaces" value={totalWorkspaces} icon={<BusinessOutlined />} />
            <HeroStat label="Active" value={activeWorkspaces} icon={<CheckCircleOutline />} />
            <HeroStat label="Active Subscriptions" value={activeSubscriptions} icon={<AttachMoneyOutlined />} />
            <HeroStat label="Premium Plans" value={premiumPlans} icon={<TrendingUpOutlined />} />
          </Box>
        </Box>
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Content Area                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ pt: 4, pb: 6, px: { xs: 2, sm: 3, md: 5 } }}>

        {/* Workspaces Grid */}
        {workspaces.length === 0 ? (
          <Box
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 3,
              bgcolor: '#ffffff',
            }}
          >
            <Business sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
              No Workspaces Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              There are no workspaces in the system yet.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {workspaces.map((workspace) => (
              <Grid item xs={12} md={6} lg={4} key={workspace.id}>
                <Card
                  elevation={0}
                  sx={{
                    border: '1px solid #e2e8f0',
                    borderRadius: 3,
                    transition: 'all 0.2s',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Card header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          bgcolor: '#f1f5f9',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        <Business sx={{ fontSize: 24, color: '#64748b' }} />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                          {workspace.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          ID: {workspace.id}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Card fields */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Status</Typography>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Plan</Typography>
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
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Subscription</Typography>
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
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Created</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
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
                        borderRadius: 2,
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
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Workspace Details Dialog                                             */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={detailsDialogOpen}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Gradient dialog header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
            px: 3,
            pt: 3,
            pb: 3,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -60,
              right: -40,
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${alpha('#6366f1', 0.25)} 0%, transparent 70%)`,
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  bgcolor: alpha('#ffffff', 0.1),
                  border: `1px solid ${alpha('#ffffff', 0.15)}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Business sx={{ fontSize: 22, color: alpha('#c7d2fe', 0.9) }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>
                  Workspace Details
                </Typography>
                <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.7) }}>
                  {selectedWorkspace?.name}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseDetails} size="small" sx={{ color: alpha('#ffffff', 0.7), '&:hover': { bgcolor: alpha('#ffffff', 0.1) } }}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        <Divider />

        <DialogContent sx={{ p: 0 }}>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#6366f1' }} />
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
                      primary={<Typography variant="caption" color="text.secondary">Owner Name</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.ownerName || 'N/A'}</Typography>}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Email sx={{ fontSize: 20, color: '#64748b' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={<Typography variant="caption" color="text.secondary">Owner Email</Typography>}
                      secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.ownerEmail || 'N/A'}</Typography>}
                    />
                  </ListItem>
                  {workspaceDetails.ownerPhone && (
                    <ListItem sx={{ px: 0, py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Phone sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption" color="text.secondary">Owner Phone</Typography>}
                        secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.ownerPhone}</Typography>}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Divider />

              {/* Location & Contact */}
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
                            primary={<Typography variant="caption" color="text.secondary">Address</Typography>}
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
                            primary={<Typography variant="caption" color="text.secondary">Phone</Typography>}
                            secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.phone}</Typography>}
                          />
                        </ListItem>
                      )}
                      {workspaceDetails.email && (
                        <ListItem sx={{ px: 0, py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            <Email sx={{ fontSize: 20, color: '#64748b' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="caption" color="text.secondary">Email</Typography>}
                            secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{workspaceDetails.email}</Typography>}
                          />
                        </ListItem>
                      )}
                    </List>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Subscription & Billing */}
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

              {/* Registration Details */}
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
                        primary={<Typography variant="caption" color="text.secondary">Created At</Typography>}
                        secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(workspaceDetails.createdAt).toLocaleString()}</Typography>}
                      />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <ListItem sx={{ px: 0, py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <CalendarToday sx={{ fontSize: 20, color: '#64748b' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="caption" color="text.secondary">Last Updated</Typography>}
                        secondary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{new Date(workspaceDetails.updatedAt).toLocaleString()}</Typography>}
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
          <Button
            onClick={handleCloseDetails}
            variant="outlined"
            sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#0f172a', borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workspaces;