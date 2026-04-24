import React, { useState, useEffect, useCallback } from 'react';
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
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  InputBase,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Search,
  Close,
  CheckCircle,
  Cancel,
  Delete,
  HourglassEmpty,
  TaskAlt,
  BlockOutlined,
  AssignmentOutlined,
  Add,
  InfoOutlined,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import {
  workspaceRequestService,
  WorkspaceRequest,
  WorkspaceRequestStatus,
  WorkspaceRequestPagination,
} from '../../services/system/workspaceRequest';

// ---------------------------------------------------------------------------
// Design tokens
// ---------------------------------------------------------------------------
const C = {
  primary:  '#00A6CA',
  hover:    '#005F8D',
  border:   '#e0e0e0',
  bg:       '#f8fafc',
  surface:  '#ffffff',
  text:     '#1C1C1E',
  sub:      '#666666',
  muted:    '#999999',
  pending:  '#f59e0b',
  approved: '#10b981',
  rejected: '#ef4444',
};

const PAGE_SIZE = 20;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getStatusColor = (status: string): string => {
  switch (status) {
    case 'pending':  return C.pending;
    case 'approved': return C.approved;
    case 'rejected': return C.rejected;
    default:         return C.muted;
  }
};

const formatDate = (value: string | null): string => {
  if (!value) return '\u2014';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const capitalize = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

// ---------------------------------------------------------------------------
// StatCard
// ---------------------------------------------------------------------------
interface StatCardProps {
  icon: React.ReactNode;
  value: number;
  label: string;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => (
  <Box
    sx={{
      flex: '1 1 140px',
      bgcolor: C.bg,
      border: '1px solid ' + C.border,
      borderRadius: 2,
      px: 2.5,
      py: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 2,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: color ? color + '18' : 'rgba(0,166,202,0.10)',
        color: color ?? C.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        '& svg': { fontSize: 18 },
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: C.text, lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: C.sub, mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// DetailRow helper for the detail dialog
// ---------------------------------------------------------------------------
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Box sx={{ display: 'flex', gap: 2, py: 1.25, borderBottom: '1px solid ' + C.border }}>
    <Typography sx={{ width: 130, flexShrink: 0, fontSize: '0.8125rem', color: C.sub, fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: '0.8125rem', color: C.text, wordBreak: 'break-all' }}>
      {value}
    </Typography>
  </Box>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
const Approvals: React.FC = () => {
  const [requests, setRequests]         = useState<WorkspaceRequest[]>([]);
  const [pagination, setPagination]     = useState<WorkspaceRequestPagination>({
    page: 1, pageSize: PAGE_SIZE, total: 0, totalPages: 1, hasNext: false, hasPrev: false,
  });
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [snackbar, setSnackbar]         = useState({
    open: false, message: '', severity: 'success' as 'success' | 'error',
  });

  // Filters
  const [searchQuery, setSearchQuery]   = useState('');
  const [statusFilter, setStatusFilter] = useState<WorkspaceRequestStatus | ''>('');
  const [currentPage, setCurrentPage]   = useState(1);

  // Per-row action loading
  const [rowLoading, setRowLoading]     = useState<Record<number, boolean>>({});

  // Reject dialog
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectTarget, setRejectTarget]         = useState<WorkspaceRequest | null>(null);
  const [rejectionReason, setRejectionReason]   = useState('');
  const [rejectLoading, setRejectLoading]       = useState(false);

  // Submit dialog
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [submitEmail, setSubmitEmail]           = useState('');
  const [submitWorkspaceId, setSubmitWorkspaceId] = useState('');
  const [submitLoading, setSubmitLoading]       = useState(false);
  const [submitErrors, setSubmitErrors]         = useState<{ email?: string; workspaceId?: string }>({});

  // Detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailRequest, setDetailRequest]       = useState<WorkspaceRequest | null>(null);
  const [detailLoading, setDetailLoading]       = useState(false);

  // -------------------------------------------------------------------------
  // Fetch
  // -------------------------------------------------------------------------
  const fetchRequests = useCallback(async (page: number, status: WorkspaceRequestStatus | '') => {
    try {
      setLoading(true);
      const result = await workspaceRequestService.getRequests(page, PAGE_SIZE, status);
      setRequests(result.items);
      setPagination(result.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests(currentPage, statusFilter);
  }, [fetchRequests, currentPage, statusFilter]);

  // -------------------------------------------------------------------------
  // Derived stats (totals come from pagination.total)
  // -------------------------------------------------------------------------
  const stats = {
    total:    pagination.total,
    pending:  requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  // -------------------------------------------------------------------------
  // Client-side search (within the current page)
  // -------------------------------------------------------------------------
  const filteredRequests = requests.filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.email?.toLowerCase().includes(q) ||
      String(r.workspaceId)?.includes(q)
    );
  });

  const hasActiveFilters = !!(searchQuery || statusFilter);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: WorkspaceRequestStatus | '') => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // -------------------------------------------------------------------------
  // Snackbar
  // -------------------------------------------------------------------------
  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // -------------------------------------------------------------------------
  // Approve
  // -------------------------------------------------------------------------
  const handleApprove = async (request: WorkspaceRequest) => {
    if (!window.confirm('Approve workspace request from ' + request.email + '?')) return;
    setRowLoading(prev => ({ ...prev, [request.id]: true }));
    try {
      await workspaceRequestService.approveRequest(request.id);
      showSnackbar('Request approved successfully', 'success');
      await fetchRequests(currentPage, statusFilter);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to approve request', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [request.id]: false }));
    }
  };

  // -------------------------------------------------------------------------
  // Reject dialog
  // -------------------------------------------------------------------------
  const openRejectDialog = (request: WorkspaceRequest) => {
    setRejectTarget(request);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const closeRejectDialog = () => {
    setRejectDialogOpen(false);
    setRejectTarget(null);
    setRejectionReason('');
  };

  const handleRejectConfirm = async () => {
    if (!rejectTarget) return;
    setRejectLoading(true);
    try {
      await workspaceRequestService.rejectRequest(rejectTarget.id, rejectionReason || undefined);
      showSnackbar('Request rejected', 'success');
      closeRejectDialog();
      await fetchRequests(currentPage, statusFilter);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to reject request', 'error');
    } finally {
      setRejectLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------
  const handleDelete = async (request: WorkspaceRequest) => {
    if (!window.confirm('Delete this workspace request from ' + request.email + '?')) return;
    setRowLoading(prev => ({ ...prev, [request.id]: true }));
    try {
      await workspaceRequestService.deleteRequest(request.id);
      showSnackbar('Request deleted', 'success');
      await fetchRequests(currentPage, statusFilter);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to delete request', 'error');
    } finally {
      setRowLoading(prev => ({ ...prev, [request.id]: false }));
    }
  };

  // -------------------------------------------------------------------------
  // Submit dialog
  // -------------------------------------------------------------------------
  const openSubmitDialog = () => {
    setSubmitEmail('');
    setSubmitWorkspaceId('');
    setSubmitErrors({});
    setSubmitDialogOpen(true);
  };

  const closeSubmitDialog = () => {
    setSubmitDialogOpen(false);
  };

  const validateSubmit = (): boolean => {
    const errs: { email?: string; workspaceId?: string } = {};
    if (!submitEmail.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(submitEmail.trim())) {
      errs.email = 'Enter a valid email address';
    }
    if (!submitWorkspaceId.trim()) {
      errs.workspaceId = 'Workspace ID is required';
    } else if (isNaN(Number(submitWorkspaceId)) || Number(submitWorkspaceId) <= 0) {
      errs.workspaceId = 'Workspace ID must be a positive number';
    }
    setSubmitErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitRequest = async () => {
    if (!validateSubmit()) return;
    setSubmitLoading(true);
    try {
      await workspaceRequestService.submitRequest({
        email: submitEmail.trim(),
        workspaceId: Number(submitWorkspaceId),
      });
      showSnackbar('Workspace request submitted successfully', 'success');
      closeSubmitDialog();
      await fetchRequests(currentPage, statusFilter);
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // -------------------------------------------------------------------------
  // Detail dialog
  // -------------------------------------------------------------------------
  const openDetailDialog = async (request: WorkspaceRequest) => {
    setDetailRequest(request);
    setDetailDialogOpen(true);
    setDetailLoading(true);
    try {
      const fresh = await workspaceRequestService.getRequest(request.id);
      setDetailRequest(fresh);
    } catch {
      // keep the row data if the fetch fails
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailDialog = () => {
    setDetailDialogOpen(false);
    setDetailRequest(null);
  };

  // -------------------------------------------------------------------------
  // Pagination
  // -------------------------------------------------------------------------
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };


  if (error && requests.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: C.bg }}>

      {/* Page Header */}
      <Box
        sx={{
          bgcolor: C.surface,
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 3,
          borderBottom: '1px solid ' + C.border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>
            Approvals
          </Typography>
          <Typography sx={{ fontSize: '13px', color: C.sub, mt: 0.5 }}>
            Review and manage workspace access requests
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add sx={{ fontSize: '16px !important' }} />}
          onClick={openSubmitDialog}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: 2,
            boxShadow: 'none',
            bgcolor: C.primary,
            px: 2,
            py: 1,
            '&:hover': { bgcolor: C.hover, boxShadow: 'none' },
          }}
        >
          Submit Request
        </Button>
      </Box>

      {/* Stat Cards */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          px: { xs: 3, sm: 4, md: 5 },
          py: 2.5,
          bgcolor: C.surface,
          borderBottom: '1px solid ' + C.border,
        }}
      >
        <StatCard icon={<AssignmentOutlined />} value={stats.total}    label="Total Requests" />
        <StatCard icon={<HourglassEmpty />}     value={stats.pending}  label="Pending"  color={C.pending} />
        <StatCard icon={<TaskAlt />}            value={stats.approved} label="Approved" color={C.approved} />
        <StatCard icon={<BlockOutlined />}      value={stats.rejected} label="Rejected" color={C.rejected} />
      </Box>

      {/* Content */}
      <Box sx={{ pb: 6 }}>

        {/* Filter toolbar */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 0,
            border: 'none',
            borderBottom: '1px solid ' + C.border,
            bgcolor: C.surface,
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            {/* Search */}
            <Box
              sx={{
                flex: '1 1 220px',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                bgcolor: C.bg,
                border: '1px solid ' + C.border,
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
              }}
            >
              <Search sx={{ fontSize: 17, color: C.muted, flexShrink: 0 }} />
              <InputBase
                placeholder="Search by email or workspace ID..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                sx={{ flex: 1, fontSize: '0.875rem' }}
              />
              {searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => setSearchQuery('')}
                  sx={{ p: 0.25, color: C.muted }}
                >
                  <Close sx={{ fontSize: 14 }} />
                </IconButton>
              )}
            </Box>

            {/* Status filter â€” server-side */}
            <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 140 } }}>
              <Select
                value={statusFilter}
                onChange={e => handleStatusFilterChange(e.target.value as WorkspaceRequestStatus | '')}
                displayEmpty
                sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: C.bg }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="approved">Approved</MenuItem>
                <MenuItem value="rejected">Rejected</MenuItem>
              </Select>
            </FormControl>

            {/* Clear */}
            {hasActiveFilters && (
              <Button
                size="small"
                onClick={clearFilters}
                sx={{
                  textTransform: 'none',
                  color: C.sub,
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  borderRadius: 2,
                  px: 1.5,
                }}
              >
                Clear
              </Button>
            )}

            {/* Result count */}
            <Box sx={{ ml: 'auto' }}>
              <Typography sx={{ fontSize: '0.8125rem', color: C.muted, whiteSpace: 'nowrap' }}>
                {loading
                  ? 'Loading...'
                  : `${pagination.total} result${pagination.total !== 1 ? 's' : ''}`}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Table / Empty state */}
        {filteredRequests.length === 0 && !loading ? (
          <Box sx={{ px: { xs: 2, sm: 3, md: 5 } }}>
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: 'center',
                border: '1px solid ' + C.border,
                borderRadius: 3,
                bgcolor: C.surface,
                mt: 3,
              }}
            >
              <AssignmentOutlined sx={{ fontSize: 48, color: C.muted, mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: C.sub, mb: 1 }}>
                No Requests Found
              </Typography>
              <Typography variant="body2" sx={{ color: C.muted }}>
                {hasActiveFilters
                  ? 'Try adjusting your filters to see more results.'
                  : 'There are no workspace access requests in the system yet.'}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ borderBottom: '1px solid ' + C.border, position: 'relative' }}>
            {loading && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                }}
              >
                <CircularProgress size={28} sx={{ color: C.primary }} />
              </Box>
            )}
            <TableContainer
              component={Paper}
              elevation={0}
              sx={{ borderRadius: 0, border: 'none', bgcolor: C.surface, overflowX: 'auto' }}
            >
              <Table sx={{ minWidth: 700 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: C.bg, borderBottom: '2px solid ' + C.border }}>
                    {['Requester', 'Workspace ID', 'Status', 'Submitted', 'Reviewed At', 'Actions'].map((h, i) => (
                      <TableCell
                        key={h}
                        align={h === 'Actions' ? 'right' : 'left'}
                        sx={{
                          fontWeight: 600,
                          color: C.sub,
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                          display: i === 3 ? { xs: 'none', sm: 'table-cell' }
                                 : i === 4 ? { xs: 'none', md: 'table-cell' }
                                 : undefined,
                        }}
                      >
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRequests.map(request => {
                    const isRowLoading = !!rowLoading[request.id];
                    const statusColor  = getStatusColor(request.status);

                    return (
                      <TableRow
                        key={request.id}
                        sx={{
                          bgcolor: C.surface,
                          borderBottom: '1px solid ' + C.border,
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: '#fafafa' },
                        }}
                      >
                        {/* Requester */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: C.text, lineHeight: 1.3 }}>
                            {request.email || '\u2014'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: C.muted, fontFamily: 'monospace', fontSize: '0.72rem' }}>
                            UID: {request.userId ?? '\u2014'}
                          </Typography>
                        </TableCell>

                        {/* Workspace ID */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8125rem', color: C.text, fontWeight: 500 }}>
                            {request.workspaceId || '\u2014'}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColor, flexShrink: 0 }} />
                            <Typography variant="body2" sx={{ fontWeight: 500, color: C.text, fontSize: '0.8125rem' }}>
                              {capitalize(request.status)}
                            </Typography>
                          </Box>
                          {request.status === 'rejected' && request.rejectionReason && (
                            <Tooltip title={request.rejectionReason} placement="top">
                              <Typography
                                variant="caption"
                                sx={{
                                  color: C.muted,
                                  display: 'block',
                                  mt: 0.25,
                                  maxWidth: 180,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  cursor: 'default',
                                }}
                              >
                                {request.rejectionReason}
                              </Typography>
                            </Tooltip>
                          )}
                        </TableCell>

                        {/* Submitted */}
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ color: C.sub }}>
                            {formatDate(request.createdAt)}
                          </Typography>
                        </TableCell>

                        {/* Reviewed At */}
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography variant="body2" sx={{ color: C.sub }}>
                            {formatDate(request.reviewedAt)}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          {isRowLoading ? (
                            <CircularProgress size={18} sx={{ color: C.primary, mx: 1 }} />
                          ) : (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                              {/* Detail */}
                              <Tooltip title="View details">
                                <IconButton
                                  size="small"
                                  onClick={() => openDetailDialog(request)}
                                  sx={{ color: C.muted, '&:hover': { color: C.primary, bgcolor: 'rgba(0,166,202,0.06)' } }}
                                >
                                  <InfoOutlined fontSize="small" />
                                </IconButton>
                              </Tooltip>

                              {request.status === 'pending' ? (
                                <>
                                  <Tooltip title="Approve request">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<CheckCircle sx={{ fontSize: '14px !important' }} />}
                                      onClick={() => handleApprove(request)}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        borderRadius: 1.5,
                                        boxShadow: 'none',
                                        bgcolor: '#10b981',
                                        px: 1.25,
                                        py: 0.5,
                                        minWidth: 0,
                                        '&:hover': { bgcolor: '#059669', boxShadow: 'none' },
                                      }}
                                    >
                                      Approve
                                    </Button>
                                  </Tooltip>
                                  <Tooltip title="Reject request">
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<Cancel sx={{ fontSize: '14px !important' }} />}
                                      onClick={() => openRejectDialog(request)}
                                      sx={{
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        borderRadius: 1.5,
                                        boxShadow: 'none',
                                        bgcolor: '#ef4444',
                                        px: 1.25,
                                        py: 0.5,
                                        minWidth: 0,
                                        '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' },
                                      }}
                                    >
                                      Reject
                                    </Button>
                                  </Tooltip>
                                </>
                              ) : (
                                <Tooltip title="Delete request">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(request)}
                                    sx={{
                                      color: C.muted,
                                      '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' },
                                    }}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  gap: 1,
                  px: 2.5,
                  py: 1.5,
                  bgcolor: C.surface,
                  borderTop: '1px solid ' + C.border,
                }}
              >
                <Typography sx={{ fontSize: '0.8125rem', color: C.sub, mr: 1 }}>
                  Page {pagination.page} of {pagination.totalPages}
                </Typography>
                <IconButton
                  size="small"
                  disabled={!pagination.hasPrev || loading}
                  onClick={() => handlePageChange(currentPage - 1)}
                  sx={{ color: C.sub, '&:hover': { color: C.primary } }}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  disabled={!pagination.hasNext || loading}
                  onClick={() => handlePageChange(currentPage + 1)}
                  sx={{ color: C.sub, '&:hover': { color: C.primary } }}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* ------------------------------------------------------------------ */}
      {/* Reject Dialog                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={rejectDialogOpen}
        onClose={closeRejectDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 3, pt: 2.5, pb: 2,
            borderBottom: '1px solid ' + C.border,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.text }}>
              Reject Request
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: C.sub, mt: 0.25 }}>
              {rejectTarget?.email ?? ''}
            </Typography>
          </Box>
          <IconButton onClick={closeRejectDialog} size="small" sx={{ color: 'rgba(0,0,0,0.45)' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <TextField
            label="Rejection Reason (optional)"
            placeholder="Provide a reason for rejecting this request..."
            value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid ' + C.border, gap: 1 }}>
          <Button
            onClick={closeRejectDialog}
            disabled={rejectLoading}
            sx={{ textTransform: 'none', color: C.sub, fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleRejectConfirm}
            disabled={rejectLoading}
            variant="contained"
            startIcon={rejectLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <Cancel />}
            sx={{
              textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none',
              bgcolor: '#ef4444',
              '&:hover': { bgcolor: '#dc2626', boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: 'rgba(239,68,68,0.5)', color: '#fff' },
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Submit Request Dialog                                                */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={submitDialogOpen}
        onClose={closeSubmitDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 3, pt: 2.5, pb: 2,
            borderBottom: '1px solid ' + C.border,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.text }}>
              Submit Workspace Request
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: C.sub, mt: 0.25 }}>
              Request access for a system user to a workspace
            </Typography>
          </Box>
          <IconButton onClick={closeSubmitDialog} size="small" sx={{ color: 'rgba(0,0,0,0.45)' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 3, pb: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="System User Email"
            placeholder="user@example.com"
            value={submitEmail}
            onChange={e => { setSubmitEmail(e.target.value); setSubmitErrors(p => ({ ...p, email: undefined })); }}
            fullWidth
            variant="outlined"
            size="small"
            error={!!submitErrors.email}
            helperText={submitErrors.email}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
          />
          <TextField
            label="Workspace ID"
            placeholder="e.g. 42"
            value={submitWorkspaceId}
            onChange={e => { setSubmitWorkspaceId(e.target.value); setSubmitErrors(p => ({ ...p, workspaceId: undefined })); }}
            fullWidth
            variant="outlined"
            size="small"
            error={!!submitErrors.workspaceId}
            helperText={submitErrors.workspaceId}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.875rem' } }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, borderTop: '1px solid ' + C.border, gap: 1 }}>
          <Button
            onClick={closeSubmitDialog}
            disabled={submitLoading}
            sx={{ textTransform: 'none', color: C.sub, fontWeight: 600, borderRadius: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            disabled={submitLoading}
            variant="contained"
            startIcon={submitLoading ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : <Add />}
            sx={{
              textTransform: 'none', fontWeight: 600, borderRadius: 2, boxShadow: 'none',
              bgcolor: C.primary,
              '&:hover': { bgcolor: C.hover, boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: 'rgba(0,166,202,0.5)', color: '#fff' },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Detail Dialog                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Dialog
        open={detailDialogOpen}
        onClose={closeDetailDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
      >
        <Box
          sx={{
            px: 3, pt: 2.5, pb: 2,
            borderBottom: '1px solid ' + C.border,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: C.text }}>
              Request Details
            </Typography>
            <Typography sx={{ fontSize: '0.8rem', color: C.sub, mt: 0.25 }}>
              {detailRequest?.email ?? ''}
            </Typography>
          </Box>
          <IconButton onClick={closeDetailDialog} size="small" sx={{ color: 'rgba(0,0,0,0.45)' }}>
            <Close fontSize="small" />
          </IconButton>
        </Box>

        <DialogContent sx={{ pt: 2.5, pb: 2 }}>
          {detailLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={28} sx={{ color: C.primary }} />
            </Box>
          ) : detailRequest ? (
            <Box>
              <DetailRow label="Request ID"   value={detailRequest.id} />
              <DetailRow label="Email"        value={detailRequest.email} />
              <DetailRow label="User ID"      value={detailRequest.userId ?? '\u2014'} />
              <DetailRow label="Workspace ID" value={detailRequest.workspaceId} />
              <DetailRow
                label="Status"
                value={
                  <Chip
                    label={capitalize(detailRequest.status)}
                    size="small"
                    sx={{
                      bgcolor: getStatusColor(detailRequest.status) + '18',
                      color: getStatusColor(detailRequest.status),
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 22,
                    }}
                  />
                }
              />
              <DetailRow label="Submitted"    value={formatDate(detailRequest.createdAt)} />
              <DetailRow label="Reviewed At"  value={formatDate(detailRequest.reviewedAt)} />
              <DetailRow label="Reviewed By"  value={detailRequest.reviewedBy ?? '\u2014'} />
              {detailRequest.rejectionReason && (
                <DetailRow label="Reason" value={detailRequest.rejectionReason} />
              )}
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid ' + C.border }}>
          <Button
            onClick={closeDetailDialog}
            sx={{ textTransform: 'none', color: C.sub, fontWeight: 600, borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Approvals;