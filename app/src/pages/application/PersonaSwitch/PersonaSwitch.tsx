import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Skeleton,
  Tooltip,
  alpha,
  Divider,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Store,
  LocationOn,
  Phone,
  Email,
  SwapHoriz,
  Refresh,
} from '@mui/icons-material';
import { personaService, Persona, PersonaCreate, PersonaUpdate } from '../../../services/application/persona.service';
import { useUserData } from '../../../contexts/application/UserData';
import { useAuth } from '../../../contexts/common/Auth';

// ─── Constants ────────────────────────────────────────────────────────────────

const ACTIVE_PERSONA_KEY = 'active_persona_id';

const PERSONA_TYPE_LABELS: Record<number, string> = { 0: 'Food', 1: 'Non-Food' };
const ORDER_TYPE_LABELS: Record<number, string> = { 0: 'Online / QR', 1: 'Manual / POS' };

// ─── Types ────────────────────────────────────────────────────────────────────

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

interface FormState {
  name: string;
  description: string;
  persona_type: 0 | 1;
  order_type: 0 | 1;
  is_open: boolean;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  phone: string;
  email: string;
}

const defaultForm: FormState = {
  name: '',
  description: '',
  persona_type: 0,
  order_type: 0,
  is_open: false,
  address: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
  phone: '',
  email: '',
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: React.ReactNode;
  text: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.75 }}>
    <Box sx={{ color: '#666666', display: 'flex', flexShrink: 0 }}>{icon}</Box>
    <Typography variant="body2" sx={{ color: '#666666', lineHeight: 1.4 }} noWrap>
      {text}
    </Typography>
  </Box>
);

interface PersonaCardSkeletonProps {}

const PersonaCardSkeleton: React.FC<PersonaCardSkeletonProps> = () => (
  <Card
    sx={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      p: 0,
      boxShadow: 'none',
    }}
  >
    <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
      <Skeleton variant="text" width="60%" height={28} />
      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <Skeleton variant="rounded" width={60} height={22} />
        <Skeleton variant="rounded" width={80} height={22} />
      </Box>
      <Skeleton variant="text" width="80%" sx={{ mt: 1.5 }} />
      <Skeleton variant="text" width="50%" />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
        <Skeleton variant="rounded" width={100} height={36} />
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Skeleton variant="circular" width={36} height={36} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PersonaSwitch: React.FC = () => {
  const { refreshUserData } = useUserData();
  const { hasBackendPermission } = useAuth();

  // ── State ──────────────────────────────────────────────────────────────────

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePersonaId, setActivePersonaId] = useState<number | null>(null);
  const [switching, setSwitching] = useState<number | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);
  const [formState, setFormState] = useState<FormState>(defaultForm);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPersona, setDeletingPersona] = useState<Persona | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // ── Permissions ────────────────────────────────────────────────────────────

  const canCreate = hasBackendPermission('application.personas.create');
  const canEdit = hasBackendPermission('application.personas.update');
  const canDelete = hasBackendPermission('application.personas.delete');

  // ── Helpers ────────────────────────────────────────────────────────────────

  const showSnackbar = (message: string, severity: SnackbarState['severity'] = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // ── Data loading ───────────────────────────────────────────────────────────

  const loadPersonas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await personaService.getPersonas();
      const data = res.data;
      setPersonas(data);

      // Resolve active persona from localStorage; fall back to first persona
      const stored = localStorage.getItem(ACTIVE_PERSONA_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!isNaN(parsed)) {
          setActivePersonaId(parsed);
        } else if (data.length > 0) {
          setActivePersonaId(data[0].id);
          localStorage.setItem(ACTIVE_PERSONA_KEY, String(data[0].id));
        }
      } else if (data.length > 0) {
        setActivePersonaId(data[0].id);
        localStorage.setItem(ACTIVE_PERSONA_KEY, String(data[0].id));
      }
    } catch {
      showSnackbar('Failed to load personas', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPersonas();
  }, [loadPersonas]);

  // ── Switch persona ─────────────────────────────────────────────────────────

  const handleSwitch = async (persona: Persona) => {
    if (persona.id === activePersonaId) return;
    setSwitching(persona.id);
    try {
      localStorage.setItem(ACTIVE_PERSONA_KEY, String(persona.id));
      setActivePersonaId(persona.id);
      await refreshUserData();
      showSnackbar(`Switched to ${persona.name}`, 'success');
    } catch {
      showSnackbar('Failed to switch persona', 'error');
    } finally {
      setSwitching(null);
    }
  };

  // ── Create / Edit dialog ───────────────────────────────────────────────────

  const openCreateDialog = () => {
    setEditingPersona(null);
    setFormState(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (persona: Persona) => {
    setEditingPersona(persona);
    setFormState({
      name: persona.name,
      description: persona.description ?? '',
      persona_type: persona.persona_type,
      order_type: persona.order_type,
      is_open: persona.is_open,
      address: persona.address ?? '',
      city: persona.city ?? '',
      state: persona.state ?? '',
      country: persona.country ?? '',
      postal_code: persona.postal_code ?? '',
      phone: persona.phone ?? '',
      email: persona.email ?? '',
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (formSubmitting) return;
    setDialogOpen(false);
    setEditingPersona(null);
    setFormState(defaultForm);
  };

  const handleFormChange = (field: keyof FormState, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async () => {
    if (!formState.name.trim()) {
      showSnackbar('Name is required', 'warning');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingPersona) {
        const payload: PersonaUpdate = {
          name: formState.name.trim(),
          description: formState.description || undefined,
          persona_type: formState.persona_type,
          order_type: formState.order_type,
          address: formState.address || undefined,
          city: formState.city || undefined,
          state: formState.state || undefined,
          country: formState.country || undefined,
          postal_code: formState.postal_code || undefined,
          phone: formState.phone || undefined,
          email: formState.email || undefined,
        };
        await personaService.updatePersona(editingPersona.id, payload);
        // Handle is_open separately via dedicated status endpoint
        if (formState.is_open !== editingPersona.is_open) {
          await personaService.setPersonaOpenStatus(editingPersona.id, formState.is_open);
        }
        await loadPersonas();
        showSnackbar(`${formState.name} updated successfully`, 'success');
      } else {
        const payload: PersonaCreate = {
          name: formState.name.trim(),
          description: formState.description || undefined,
          persona_type: formState.persona_type,
          order_type: formState.order_type,
          is_open: formState.is_open,
          address: formState.address || undefined,
          city: formState.city || undefined,
          state: formState.state || undefined,
          country: formState.country || undefined,
          postal_code: formState.postal_code || undefined,
          phone: formState.phone || undefined,
          email: formState.email || undefined,
        };
        const created = await personaService.createPersona(payload);
        setPersonas(prev => [...prev, created]);
        showSnackbar(`${created.name} created successfully`, 'success');
      }
      closeDialog();
    } catch {
      showSnackbar(editingPersona ? 'Failed to update persona' : 'Failed to create persona', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // ── Delete dialog ──────────────────────────────────────────────────────────

  const openDeleteDialog = (persona: Persona) => {
    setDeletingPersona(persona);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (deleteSubmitting) return;
    setDeleteDialogOpen(false);
    setDeletingPersona(null);
  };

  const handleDelete = async () => {
    if (!deletingPersona) return;
    setDeleteSubmitting(true);
    try {
      await personaService.deletePersona(deletingPersona.id);
      setPersonas(prev => prev.filter(p => p.id !== deletingPersona.id));

      // If the deleted persona was active, switch to the first remaining one
      if (deletingPersona.id === activePersonaId) {
        const remaining = personas.filter(p => p.id !== deletingPersona.id);
        if (remaining.length > 0) {
          localStorage.setItem(ACTIVE_PERSONA_KEY, String(remaining[0].id));
          setActivePersonaId(remaining[0].id);
        } else {
          localStorage.removeItem(ACTIVE_PERSONA_KEY);
          setActivePersonaId(null);
        }
      }

      showSnackbar(`${deletingPersona.name} deleted`, 'success');
      closeDeleteDialog();
    } catch {
      showSnackbar('Failed to delete persona', 'error');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Page Header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: { xs: 2, sm: 3, md: 4 },
          py: 2.5,
        }}
      >
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2 }}>
              Personas
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              Switch between your business locations
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={loadPersonas}
                disabled={loading}
                sx={{ border: '1px solid #e0e0e0', borderRadius: '8px', color: '#666666' }}
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>

            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
                sx={{
                  bgcolor: '#1976D2',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 2,
                  '&:hover': { bgcolor: '#1565C0' },
                }}
              >
                Add Persona
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 }, py: 3 }}>
        {loading ? (
          <Grid container spacing={2.5}>
            {[1, 2, 3].map(n => (
              <Grid item xs={12} sm={6} lg={4} key={n}>
                <PersonaCardSkeleton />
              </Grid>
            ))}
          </Grid>
        ) : personas.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 10,
              gap: 2,
            }}
          >
            <Store sx={{ fontSize: 56, color: '#e0e0e0' }} />
            <Typography variant="h6" sx={{ color: '#1C1C1E', fontWeight: 600 }}>
              No personas yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>
              Create your first persona to get started
            </Typography>
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={openCreateDialog}
                sx={{
                  mt: 1,
                  bgcolor: '#1976D2',
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 600,
                  '&:hover': { bgcolor: '#1565C0' },
                }}
              >
                Add Persona
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {personas.map(persona => {
              const isActive = persona.id === activePersonaId;
              const isSwitching = switching === persona.id;

              return (
                <Grid item xs={12} sm={6} lg={4} key={persona.id}>
                  <Card
                    sx={{
                      border: isActive ? '2px solid #1976D2' : '1px solid #e0e0e0',
                      borderRadius: '12px',
                      boxShadow: isActive
                        ? `0 0 0 3px ${alpha('#1976D2', 0.08)}`
                        : 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2.5,
                        '&:last-child': { pb: 2.5 },
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                      }}
                    >
                      {/* Top row: name + active chip + status dot */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.3 }}
                          >
                            {persona.name}
                          </Typography>
                          {isActive && (
                            <Chip
                              icon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                              label="Active"
                              size="small"
                              sx={{
                                bgcolor: alpha('#1976D2', 0.1),
                                color: '#1976D2',
                                fontWeight: 600,
                                fontSize: '0.7rem',
                                height: 22,
                                '& .MuiChip-icon': { color: '#1976D2' },
                              }}
                            />
                          )}
                        </Box>

                        {/* Open/Closed status dot */}
                        <Tooltip title={persona.is_open ? 'Open' : 'Closed'}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              bgcolor: persona.is_open ? '#4CAF50' : '#9E9E9E',
                              flexShrink: 0,
                              mt: 0.5,
                            }}
                          />
                        </Tooltip>
                      </Box>

                      {/* Type badges */}
                      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                        <Chip
                          label={PERSONA_TYPE_LABELS[persona.persona_type] ?? 'Unknown'}
                          size="small"
                          sx={{
                            bgcolor: '#f0f4ff',
                            color: '#3f51b5',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 22,
                          }}
                        />
                        <Chip
                          label={ORDER_TYPE_LABELS[persona.order_type] ?? 'Unknown'}
                          size="small"
                          sx={{
                            bgcolor: '#f3f9f3',
                            color: '#388e3c',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            height: 22,
                          }}
                        />
                      </Box>

                      {/* Info rows */}
                      <Box sx={{ flex: 1 }}>
                        {(persona.address || persona.city) && (
                          <InfoRow
                            icon={<LocationOn sx={{ fontSize: 15 }} />}
                            text={[persona.address, persona.city, persona.state, persona.country]
                              .filter(Boolean)
                              .join(', ')}
                          />
                        )}
                        {persona.phone && (
                          <InfoRow
                            icon={<Phone sx={{ fontSize: 15 }} />}
                            text={persona.phone}
                          />
                        )}
                        {persona.email && (
                          <InfoRow
                            icon={<Email sx={{ fontSize: 15 }} />}
                            text={persona.email}
                          />
                        )}
                      </Box>

                      {/* Bottom action row */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 2,
                          pt: 2,
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
                        <Button
                          variant={isActive ? 'outlined' : 'contained'}
                          size="small"
                          startIcon={
                            isSwitching ? (
                              <CircularProgress size={14} color="inherit" />
                            ) : (
                              <SwapHoriz fontSize="small" />
                            )
                          }
                          onClick={() => handleSwitch(persona)}
                          disabled={isActive || isSwitching || switching !== null}
                          sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            px: 1.5,
                            ...(isActive
                              ? {
                                  borderColor: '#1976D2',
                                  color: '#1976D2',
                                  '&.Mui-disabled': {
                                    borderColor: alpha('#1976D2', 0.4),
                                    color: alpha('#1976D2', 0.6),
                                  },
                                }
                              : {
                                  bgcolor: '#1976D2',
                                  '&:hover': { bgcolor: '#1565C0' },
                                  '&.Mui-disabled': { bgcolor: alpha('#1976D2', 0.3) },
                                }),
                          }}
                        >
                          {isActive ? 'Active' : 'Switch'}
                        </Button>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {canEdit && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEditDialog(persona)}
                                sx={{
                                  color: '#666666',
                                  '&:hover': { color: '#1976D2', bgcolor: alpha('#1976D2', 0.08) },
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {canDelete && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => openDeleteDialog(persona)}
                                sx={{
                                  color: '#666666',
                                  '&:hover': { color: '#d32f2f', bgcolor: alpha('#d32f2f', 0.08) },
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            color: '#1C1C1E',
            pb: 1,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
          {editingPersona ? 'Edit Persona' : 'Add Persona'}
        </DialogTitle>

        <DialogContent sx={{ pt: 2.5, pb: 1 }}>
          <Grid container spacing={2}>
            {/* Name */}
            <Grid item xs={12}>
              <TextField
                label="Name"
                value={formState.name}
                onChange={e => handleFormChange('name', e.target.value)}
                fullWidth
                required
                size="small"
                inputProps={{ maxLength: 120 }}
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formState.description}
                onChange={e => handleFormChange('description', e.target.value)}
                fullWidth
                multiline
                rows={2}
                size="small"
              />
            </Grid>

            {/* Persona Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Persona Type</InputLabel>
                <Select
                  label="Persona Type"
                  value={formState.persona_type}
                  onChange={e => handleFormChange('persona_type', e.target.value as 0 | 1)}
                >
                  <MenuItem value={0}>Food</MenuItem>
                  <MenuItem value={1}>Non-Food</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Order Type */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Order Type</InputLabel>
                <Select
                  label="Order Type"
                  value={formState.order_type}
                  onChange={e => handleFormChange('order_type', e.target.value as 0 | 1)}
                >
                  <MenuItem value={0}>Online / QR</MenuItem>
                  <MenuItem value={1}>Manual / POS</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Is Open */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formState.is_open}
                    onChange={e => handleFormChange('is_open', e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#1C1C1E' }}>
                    {formState.is_open ? 'Open for business' : 'Closed'}
                  </Typography>
                }
              />
            </Grid>

            <Grid item xs={12}>
              <Divider>
                <Typography variant="caption" sx={{ color: '#666666' }}>
                  Contact & Location
                </Typography>
              </Divider>
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <TextField
                label="Address"
                value={formState.address}
                onChange={e => handleFormChange('address', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* City */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="City"
                value={formState.city}
                onChange={e => handleFormChange('city', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* State */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={formState.state}
                onChange={e => handleFormChange('state', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Country */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Country"
                value={formState.country}
                onChange={e => handleFormChange('country', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Postal Code */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Postal Code"
                value={formState.postal_code}
                onChange={e => handleFormChange('postal_code', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Phone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Phone"
                value={formState.phone}
                onChange={e => handleFormChange('phone', e.target.value)}
                fullWidth
                size="small"
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email"
                value={formState.email}
                onChange={e => handleFormChange('email', e.target.value)}
                fullWidth
                size="small"
                type="email"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
          <Button
            onClick={closeDialog}
            disabled={formSubmitting}
            sx={{ textTransform: 'none', color: '#666666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={formSubmitting || !formState.name.trim()}
            startIcon={formSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              bgcolor: '#1976D2',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            {editingPersona ? 'Save Changes' : 'Create Persona'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px' } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#1C1C1E', pb: 1 }}>
          Delete Persona
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            Are you sure you want to delete{' '}
            <strong style={{ color: '#1C1C1E' }}>{deletingPersona?.name}</strong>? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button
            onClick={closeDeleteDialog}
            disabled={deleteSubmitting}
            sx={{ textTransform: 'none', color: '#666666' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleDelete}
            disabled={deleteSubmitting}
            startIcon={deleteSubmitting ? <CircularProgress size={16} color="inherit" /> : undefined}
            sx={{
              bgcolor: '#d32f2f',
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
              '&:hover': { bgcolor: '#b71c1c' },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={closeSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: '8px', fontWeight: 500 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PersonaSwitch;
