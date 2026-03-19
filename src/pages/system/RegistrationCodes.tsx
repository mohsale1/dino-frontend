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
  Button,
  Chip,
  IconButton,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Add,
  ContentCopy,
  Delete,
  CardGiftcard,
  CheckCircle,
  Cancel,
  Close,
  Restore,
} from '@mui/icons-material';
import { systemRegistrationService } from '../../services/system/registration';
import { systemWorkspaceService } from '../../services/system/workspace';
import { DeleteConfirmationDialog } from '../../components/dialogs';

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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981';
      case 'expired':
      case 'inactive':
        return '#ef4444';
      case 'disabled':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const getCodeStatus = (code: any) => {
    if (code.is_deleted) return 'Deleted';
    if (!code.is_active) return 'Inactive';
    if (code.current_uses >= code.max_uses) return 'Expired';
    if (code.expires_at && new Date(code.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbar({
      open: true,
      message: 'Code copied to clipboard',
      severity: 'success',
    });
  };

  const handleCreateCode = () => {
    setCreateForm({
      workspaceId: '',
      maxUses: 1,
      expiresInDays: 30,
    });
    setCreateDialogOpen(true);
  };

  const handleSaveCode = async () => {
    try {
      await systemRegistrationService.createCode(createForm);
      setSnackbar({
        open: true,
        message: 'Registration code created successfully',
        severity: 'success',
      });
      setCreateDialogOpen(false);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to create registration code',
        severity: 'error',
      });
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
      setSnackbar({
        open: true,
        message: 'Registration code deactivated successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setSelectedCode(null);
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to deactivate registration code',
        severity: 'error',
      });
    }
  };

  const handleRestoreCode = async (code: any) => {
    try {
      await systemRegistrationService.restoreCode(code.id);
      setSnackbar({
        open: true,
        message: 'Registration code restored successfully',
        severity: 'success',
      });
      await fetchData();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to restore registration code',
        severity: 'error',
      });
    }
  };

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace?.name || workspaceId;
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
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
              Registration Codes
            </Typography>
            <Typography variant="body1" sx={{ color: '#64748b' }}>
              Generate and manage registration codes
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleCreateCode}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Generate Code
          </Button>
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
                <CardGiftcard sx={{ fontSize: 32, color: '#0f172a', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.total_codes || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Codes
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
                <CheckCircle sx={{ fontSize: 32, color: '#10b981', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.active_codes || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Codes
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
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: '#3b82f6' }}>
                  {stats.total_uses || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Uses
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
                <Cancel sx={{ fontSize: 32, color: '#ef4444', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {stats.expired_codes || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Expired
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Codes Table */}
        {codes.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
              borderRadius: 2,
            }}
          >
            <CardGiftcard sx={{ fontSize: 64, color: '#cbd5e1', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#64748b', mb: 1 }}>
              No Registration Codes Found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first registration code to get started.
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
                  <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Workspace</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Usage</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Expires</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {codes.map((code) => {
                  const status = getCodeStatus(code);
                  return (
                    <TableRow
                      key={code.id}
                      sx={{
                        '&:hover': { bgcolor: '#f8fafc' },
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              bgcolor: alpha('#0f172a', 0.05),
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                            }}
                          >
                            {code.code}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleCopyCode(code.code)}
                            sx={{ color: '#64748b' }}
                          >
                            <ContentCopy fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {getWorkspaceName(code.workspace_id)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {code.current_uses} / {code.max_uses}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={status}
                          size="small"
                          sx={{
                            bgcolor: alpha(getStatusColor(status), 0.1),
                            color: getStatusColor(status),
                            fontWeight: 600,
                            border: `1px solid ${alpha(getStatusColor(status), 0.3)}`,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {code.is_deleted ? (
                          <IconButton
                            size="small"
                            sx={{ color: '#10b981' }}
                            onClick={() => handleRestoreCode(code)}
                          >
                            <Restore fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            sx={{ color: '#ef4444' }}
                            onClick={() => handleDeleteClick(code)}
                          >
                            <Delete fontSize="small" />
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
      </Container>

      {/* Create Code Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
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
            Generate Registration Code
          </Typography>
          <IconButton onClick={() => setCreateDialogOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
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
          <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveCode}
            variant="contained"
            disabled={!createForm.workspaceId}
            sx={{
              textTransform: 'none',
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
            }}
          >
            Generate Code
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
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
          'You can restore this code later if needed'
        ]}
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

export default RegistrationCodes;