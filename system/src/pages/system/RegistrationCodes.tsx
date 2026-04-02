import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add,
  CalendarToday,
  ContentCopy,
  Delete,
  Close,
  Restore,
  QrCodeOutlined,
  TouchAppOutlined,
  CancelOutlined,
  CheckCircleOutline,
} from '@mui/icons-material';
import { systemRegistrationService } from '../../services/system/registration';
import { systemWorkspaceService } from '../../services/system/workspace';
import { DeleteConfirmationDialog } from '../../components/dialogs';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const COLORS = {
  primary:      '#1976D2',
  primaryLight: '#42A5F5',
  dark0:        '#0f172a',
  dark1:        '#1e293b',
  border:       '#e2e8f0',
  surface:      '#ffffff',
  bg:           '#f1f5f9',
  slate:        '#64748b',
  muted:        '#94a3b8',
  emerald:      '#10b981',
  rose:         '#f43f5e',
};

// ---------------------------------------------------------------------------
// useCountUp hook
// ---------------------------------------------------------------------------
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const from = useRef(0);

  useEffect(() => {
    from.current = 0;
    start.current = null;
    const step = (ts: number) => {
      if (start.current === null) start.current = ts;
      const progress = Math.min((ts - start.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from.current + (target - from.current) * eased));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current !== null) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

// ---------------------------------------------------------------------------
// HeroStat component
// ---------------------------------------------------------------------------
interface HeroStatProps {
  icon: React.ReactNode;
  value: number;
  label: string;
}

const HeroStat: React.FC<HeroStatProps> = ({ icon, value, label }) => {
  const animated = useCountUp(value);
  return (
    <Box
      sx={{
        flex: '1 1 140px',
        px: 2.5,
        py: 2,
        borderRadius: 2.5,
        bgcolor: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(144,202,249,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          color: '#ffffff',
          fontWeight: 700,
          fontSize: { xs: '1.35rem', md: '1.6rem' },
          letterSpacing: '-0.03em',
          lineHeight: 1,
        }}
      >
        {animated}
      </Typography>
      <Typography sx={{ color: 'rgba(144,202,249,0.65)', fontSize: '0.75rem', mt: 0.5 }}>
        {label}
      </Typography>
    </Box>
  );
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const RegistrationCodes: React.FC = () => {
  const [codes, setCodes] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<any | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState({
    workspaceId: '',
    maxUses: 1,
    expiresInDays: 30,
  });

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [codesData, statsData, workspacesData] = await Promise.all([
        systemRegistrationService.getCodes(1, 100, false),
        systemRegistrationService.getStats(),
        systemWorkspaceService.getWorkspaces(1, 100),
      ]);
      setCodes(codesData);
      setStats(statsData);
      setWorkspaces(workspacesData);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch registration codes:', err);
      setError(err.message || 'Failed to load registration codes');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCodeStatus = (code: any) => {
    if (code.is_deleted) return 'Deleted';
    if (!code.is_active) return 'Inactive';
    if (code.current_uses >= code.max_uses) return 'Expired';
    if (code.expires_at && new Date(code.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbar({ open: true, message: 'Code copied to clipboard', severity: 'success' });
  };

  const handleCreateCode = () => {
    setCreateForm({ workspaceId: '', maxUses: 1, expiresInDays: 30 });
    setCreateDialogOpen(true);
  };

  const handleSaveCode = async () => {
    try {
      await systemRegistrationService.createCode(createForm);
      setSnackbar({ open: true, message: 'Registration code created successfully', severity: 'success' });
      setCreateDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to create registration code', severity: 'error' });
    }
  };

  const handleDeleteClick = (code: any) => {
    setSelectedCode(code);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCode) return;
    try {
      await systemRegistrationService.deleteCode(selectedCode.id);
      setSnackbar({ open: true, message: 'Registration code deactivated successfully', severity: 'success' });
      setDeleteDialogOpen(false);
      setSelectedCode(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to deactivate registration code', severity: 'error' });
    }
  };

  const handleRestoreCode = async (code: any) => {
    try {
      await systemRegistrationService.restoreCode(code.id);
      setSnackbar({ open: true, message: 'Registration code restored successfully', severity: 'success' });
      await fetchData();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to restore registration code', severity: 'error' });
    }
  };

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.name || workspaceId;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#1976D2' }} />
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
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: COLORS.bg }}>

      {/* ------------------------------------------------------------------ */}
      {/* Hero Header                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 45%, #1565C0 100%)',
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
            background: 'radial-gradient(circle, rgba(25,118,210,0.22) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(66,165,245,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        {/* Grid overlay */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />

        {/* Title row */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
            mb: stats ? 3 : 0,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'rgba(144,202,249,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}
            >
              SYSTEM CONTROL CENTER
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#ffffff',
                fontWeight: 800,
                mt: 0.5,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              Registration Codes
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1.5 }}>
              <CalendarToday sx={{ fontSize: 13, color: 'rgba(144,202,249,0.6)' }} />
              <Typography variant="caption" sx={{ color: 'rgba(144,202,249,0.6)', fontWeight: 500, fontSize: '0.75rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCode}
            sx={{
              mt: 1,
              bgcolor: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.25)',
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.25)',
                boxShadow: 'none',
              },
            }}
          >
            Generate Code
          </Button>
        </Box>

        {/* Hero stats row */}
        {stats && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', position: 'relative' }}>
            <HeroStat icon={<QrCodeOutlined sx={{ fontSize: 18 }} />} value={stats.total_codes || 0} label="Total Codes" />
            <HeroStat icon={<CheckCircleOutline sx={{ fontSize: 18 }} />} value={stats.active_codes || 0} label="Active Codes" />
            <HeroStat icon={<TouchAppOutlined sx={{ fontSize: 18 }} />} value={stats.total_uses || 0} label="Total Uses" />
            <HeroStat icon={<CancelOutlined sx={{ fontSize: 18 }} />} value={stats.expired_codes || 0} label="Expired" />
          </Box>
        )}
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Content Area                                                         */}
      {/* ------------------------------------------------------------------ */}
      <Box sx={{ pt: 4, pb: 6, px: { xs: 2, sm: 3, md: 5 } }}>

        {codes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 3,
              bgcolor: COLORS.surface,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3,
                bgcolor: '#f1f5f9',
                border: `1px solid ${COLORS.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <QrCodeOutlined sx={{ fontSize: 32, color: COLORS.muted }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: COLORS.dark0, mb: 1 }}>
              No Registration Codes Found
            </Typography>
            <Typography variant="body2" sx={{ color: COLORS.slate }}>
              Create your first registration code to get started.
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${COLORS.border}`,
              bgcolor: '#ffffff',
              overflowX: 'auto',
            }}
          >
            <Table sx={{ minWidth: 500 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Code
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: { xs: 'none', sm: 'table-cell' } }}>
                    Workspace
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Usage
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', display: { xs: 'none', md: 'table-cell' } }}>
                    Expires
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: COLORS.slate, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {codes.map((code) => {
                  const status = getCodeStatus(code);
                  const isActive = status === 'Active';
                  return (
                    <TableRow
                      key={code.id}
                      sx={{
                        bgcolor: '#ffffff',
                        borderBottom: '1px solid #e2e8f0',
                        '&:last-child': { borderBottom: 'none' },
                        '&:hover': { bgcolor: '#fafafa' },
                      }}
                    >
                      {/* Code cell */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 600,
                              bgcolor: alpha(COLORS.dark0, 0.04),
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.8125rem',
                            }}
                          >
                            {code.code}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(code.code)}
                            sx={{
                              color: COLORS.muted,
                              '&:hover': { color: '#1976D2', bgcolor: alpha('#1976D2', 0.06) },
                            }}
                          >
                            <ContentCopy sx={{ fontSize: 15 }} />
                          </IconButton>
                        </Box>
                      </TableCell>

                      {/* Workspace */}
                      <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ color: COLORS.dark1, fontSize: '0.8125rem' }}>
                          {getWorkspaceName(code.workspace_id)}
                        </Typography>
                      </TableCell>

                      {/* Usage */}
                      <TableCell>
                        <Typography variant="body2" sx={{ color: COLORS.slate, fontSize: '0.8125rem' }}>
                          {code.current_uses} / {code.max_uses}
                        </Typography>
                      </TableCell>

                      {/* Status — dot + text */}
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: isActive ? COLORS.emerald : COLORS.muted,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              color: isActive ? COLORS.dark0 : COLORS.muted,
                              fontSize: '0.8125rem',
                            }}
                          >
                            {status}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Expires */}
                      <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                        <Typography variant="body2" sx={{ color: COLORS.slate, fontSize: '0.8125rem' }}>
                          {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        {code.is_deleted ? (
                          <IconButton
                            size="small"
                            onClick={() => handleRestoreCode(code)}
                            sx={{
                              color: COLORS.muted,
                              '&:hover': { color: COLORS.emerald, bgcolor: alpha(COLORS.emerald, 0.08) },
                            }}
                          >
                            <Restore sx={{ fontSize: 18 }} />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(code)}
                            sx={{
                              color: COLORS.muted,
                              '&:hover': { color: COLORS.rose, bgcolor: alpha(COLORS.rose, 0.08) },
                            }}
                          >
                            <Delete sx={{ fontSize: 18 }} />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Generate Code Dialog                                                 */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        {/* Gradient header */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #0d1b2e 0%, #0f2744 60%, #1565C0 100%)',
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
              background: 'radial-gradient(circle, rgba(25,118,210,0.25) 0%, transparent 70%)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                Generate Registration Code
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(144,202,249,0.7)', mt: 0.5 }}>
                Configure and create a new registration code
              </Typography>
            </Box>
            <IconButton
              onClick={() => setCreateDialogOpen(false)}
              size="small"
              sx={{ color: 'rgba(255,255,255,0.7)', '&:hover': { color: '#ffffff', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <Close />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Workspace</InputLabel>
              <Select
                value={createForm.workspaceId}
                onChange={(e) => setCreateForm({ ...createForm, workspaceId: e.target.value })}
                label="Workspace"
              >
                {workspaces.map((workspace) => (
                  <MenuItem key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Maximum Uses"
              type="number"
              value={createForm.maxUses}
              onChange={(e) => setCreateForm({ ...createForm, maxUses: parseInt(e.target.value) || 1 })}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText="Number of times this code can be used"
            />
            <TextField
              label="Expires In (Days)"
              type="number"
              value={createForm.expiresInDays}
              onChange={(e) => setCreateForm({ ...createForm, expiresInDays: parseInt(e.target.value) || 30 })}
              fullWidth
              required
              inputProps={{ min: 1 }}
              helperText="Number of days until the code expires"
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none', color: COLORS.slate }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCode}
            variant="contained"
            disabled={!createForm.workspaceId}
            sx={{
              textTransform: 'none',
              bgcolor: '#1976D2',
              borderRadius: 1.5,
              '&:hover': { bgcolor: '#1565C0' },
            }}
          >
            Generate Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation                                                  */}
      {/* ------------------------------------------------------------------ */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCode(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Deactivate Registration Code"
        itemName={selectedCode?.code || ''}
        itemType="registration code"
        description="This code will be deactivated and cannot be used for new registrations."
        requireTyping={false}
        isSoftDelete={true}
        additionalWarnings={[
          'The code will be hidden from active codes list',
          'Existing registrations using this code will remain valid',
          'You can restore this code later if needed',
        ]}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Snackbar                                                             */}
      {/* ------------------------------------------------------------------ */}
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

export default RegistrationCodes;