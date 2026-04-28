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
  Chip,
  alpha,
  CircularProgress,
  Alert,
  Snackbar,
  Dialog,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
  IconButton,
  TablePagination,
} from '@mui/material';
import {
  GroupOutlined,
  HourglassEmpty,
  TaskAlt,
  Delete,
  Close,
  CheckOutlined,
  BlockOutlined,
} from '@mui/icons-material';
import {
  systemReferralService,
  type WorkspaceRequest,
  type WorkspaceRequestStatus,
} from '../../services/system/registration';
import { DeleteConfirmationDialog } from '../../components/dialogs';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ACCENT = '#00A6CA';

type TabId = 'requests' | 'overview';
type FilterStatus = 'all' | WorkspaceRequestStatus;

const STATUS_COLORS: Record<WorkspaceRequestStatus, string> = {
  pending:  '#f59e0b',
  approved: '#10b981',
  rejected: '#f43f5e',
};

const FILTER_CHIPS: { label: string; value: FilterStatus }[] = [
  { label: 'All',      value: 'all' },
  { label: 'Pending',  value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}



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
      bgcolor: '#f8fafc',
      border: '1px solid #e0e0e0',
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
        bgcolor: color ? `${color}18` : alpha(ACCENT, 0.10),
        color: color ?? ACCENT,
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
      <Typography sx={{ fontWeight: 700, fontSize: '1.4rem', color: '#1C1C1E', lineHeight: 1 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '0.75rem', color: '#666666', mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// StatusChip
// ---------------------------------------------------------------------------

const StatusChip: React.FC<{ status: WorkspaceRequestStatus }> = ({ status }) => {
  const color = STATUS_COLORS[status];
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        height: 22,
        fontSize: '0.72rem',
        fontWeight: 600,
        bgcolor: alpha(color, 0.10),
        color,
        border: `1px solid ${alpha(color, 0.25)}`,
        textTransform: 'capitalize',
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Reject Dialog
// ---------------------------------------------------------------------------

interface RejectDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  loading: boolean;
}

const RejectDialog: React.FC<RejectDialogProps> = ({ open, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  const handleClose = () => {
    setReason('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(reason.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
    >
      <Box
        sx={{
          px: 3,
          pt: 2.5,
          pb: 2,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1C1C1E' }}>
            Reject Request
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: '#666666', mt: 0.25 }}>
            Provide an optional reason for rejection
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: 'rgba(0,0,0,0.45)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 3 }}>
        <TextField
          label="Rejection Reason"
          placeholder="Enter a reason for rejection (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          fullWidth
          multiline
          rows={3}
          size="small"
          helperText="This reason will be stored with the request record."
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none', color: '#666666' }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            bgcolor: '#f43f5e',
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#e11d48', boxShadow: 'none' },
          }}
        >
          {loading ? <CircularProgress size={16} sx={{ color: '#fff' }} /> : 'Reject Request'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const Referrals: React.FC = () => {
  const [activeTab, setActiveTab]   = useState<TabId>('requests');
  const [filter, setFilter]         = useState<FilterStatus>('all');
  const [requests, setRequests]     = useState<WorkspaceRequest[]>([]);
  const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
  const [loading, setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  // Dialog state
  const [rejectDialogOpen, setRejectDialogOpen]   = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen]   = useState(false);
  const [selectedRequest, setSelectedRequest]     = useState<WorkspaceRequest | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? undefined : filter;
      const result = await systemReferralService.getRequests({
        page: page + 1,
        pageSize: rowsPerPage,
        status: statusParam,
      });
      setRequests(result.items);
      setTotalCount(result.pagination.total);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace requests');
    } finally {
      setLoading(false);
    }
  }, [filter, page, rowsPerPage]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Reset to page 0 when filter changes
  useEffect(() => {
    setPage(0);
  }, [filter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleApprove = async (request: WorkspaceRequest) => {
    try {
      setActionLoading(true);
      await systemReferralService.approveRequest(request.id);
      showSnackbar('Request approved successfully', 'success');
      await fetchRequests();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to approve request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (request: WorkspaceRequest) => {
    setSelectedRequest(request);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!selectedRequest) return;
    try {
      setActionLoading(true);
      await systemReferralService.rejectRequest(selectedRequest.id, reason);
      showSnackbar('Request rejected', 'success');
      setRejectDialogOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to reject request', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDelete = (request: WorkspaceRequest) => {
    setSelectedRequest(request);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedRequest) return;
    try {
      await systemReferralService.deleteRequest(selectedRequest.id);
      showSnackbar('Request deleted', 'success');
      setDeleteDialogOpen(false);
      setSelectedRequest(null);
      await fetchRequests();
    } catch (err: any) {
      showSnackbar(err.message || 'Failed to delete request', 'error');
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const filteredRequests = requests; // server-side filtering via API

  // ── Render ─────────────────────────────────────────────────────────────────

  if (error && !loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error" sx={{ maxWidth: 480 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 0,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ pb: 2 }}>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>
            Referrals
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#666666', mt: 0.5 }}>
            Review and manage workspace referral requests
          </Typography>
        </Box>

        {/* ── Tabs ── */}
        <Box sx={{ display: 'flex', gap: 0 }}>
          {([
            { id: 'requests', label: 'Requests' },
            { id: 'overview', label: 'Overview' },
          ] as { id: TabId; label: string }[]).map((tab) => (
            <Box
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              sx={{
                px: 2.5,
                py: 1.25,
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? ACCENT : '#666666',
                borderBottom: activeTab === tab.id ? `2px solid ${ACCENT}` : '2px solid transparent',
                transition: 'all 0.15s',
                '&:hover': { color: ACCENT },
                userSelect: 'none',
              }}
            >
              {tab.label}
            </Box>
          ))}
        </Box>
      </Box>


      {/* ── Stat Cards ── */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          px: { xs: 3, sm: 4, md: 5 },
          py: 2.5,
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <StatCard icon={<GroupOutlined />}  value={stats.total}    label="Total Requests" />
        <StatCard icon={<HourglassEmpty />} value={stats.pending}  label="Pending"  color="#f59e0b" />
        <StatCard icon={<TaskAlt />}        value={stats.approved} label="Approved" color="#10b981" />
        <StatCard icon={<BlockOutlined />}  value={stats.rejected} label="Rejected" color="#f43f5e" />
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: 3, pb: 6 }}>

        {/* ════════════════════════════════════════════════════════════════════
            TAB: REQUESTS
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'requests' && (
          <>
            {/* Filter chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
              {FILTER_CHIPS.map((chip) => {
                const isActive = filter === chip.value;
                return (
                  <Chip
                    key={chip.value}
                    label={chip.label}
                    onClick={() => setFilter(chip.value)}
                    size="small"
                    sx={{
                      height: 28,
                      fontSize: '0.8125rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      bgcolor: isActive ? alpha(ACCENT, 0.10) : '#ffffff',
                      color: isActive ? ACCENT : '#666666',
                      border: `1px solid ${isActive ? alpha(ACCENT, 0.35) : '#e0e0e0'}`,
                      '&:hover': {
                        bgcolor: alpha(ACCENT, 0.07),
                        color: ACCENT,
                      },
                    }}
                  />
                );
              })}
            </Box>

            {/* Table */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress sx={{ color: ACCENT }} />
              </Box>
            ) : filteredRequests.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  textAlign: 'center',
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                  }}
                >
                  <GroupOutlined sx={{ fontSize: 32, color: '#999999' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1C1C1E', mb: 1 }}>
                  No Requests Found
                </Typography>
                <Typography variant="body2" sx={{ color: '#666666' }}>
                  {filter === 'all'
                    ? 'No workspace referral requests have been submitted yet.'
                    : `No ${filter} requests at this time.`}
                </Typography>
              </Paper>
            ) : (
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: '1px solid #e0e0e0',
                  bgcolor: '#ffffff',
                  overflowX: 'auto',
                }}
              >
                <Table sx={{ minWidth: 560 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8fafc', borderBottom: '2px solid #e0e0e0' }}>
                      {[
                        { label: 'Referrer Email' },
                        { label: 'Workspace ID', sx: { display: { xs: 'none', sm: 'table-cell' } } },
                        { label: 'Status' },
                        { label: 'Submitted', sx: { display: { xs: 'none', md: 'table-cell' } } },
                        { label: 'Actions', align: 'right' as const },
                      ].map((col) => (
                        <TableCell
                          key={col.label}
                          align={col.align}
                          sx={{
                            fontWeight: 600,
                            color: '#666666',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.06em',
                            ...(col.sx ?? {}),
                          }}
                        >
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRequests.map((req) => (
                      <TableRow
                        key={req.id}
                        sx={{
                          bgcolor: '#ffffff',
                          borderBottom: '1px solid #f2f2f2',
                          '&:last-child': { borderBottom: 'none' },
                          '&:hover': { bgcolor: '#fafafa' },
                        }}
                      >
                        {/* Referrer Email */}
                        <TableCell>
                          <Typography
                            sx={{
                              fontSize: '0.875rem',
                              fontWeight: 500,
                              color: '#1C1C1E',
                              maxWidth: { xs: 160, sm: 'none' },
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {req.email}
                          </Typography>
                          {req.user && (
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', mt: 0.25 }}>
                              {req.user.first_name} {req.user.last_name}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Workspace ID */}
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            <Typography
                              sx={{
                                fontFamily: 'monospace',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                bgcolor: 'rgba(28,28,30,0.04)',
                                px: 1,
                                py: 0.25,
                                borderRadius: 0.75,
                                color: '#1C1C1E',
                              }}
                            >
                              #{req.workspaceId}
                            </Typography>
                            {req.workspace && (
                              <Typography sx={{ fontSize: '0.8125rem', color: '#666666' }}>
                                {req.workspace.name}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <StatusChip status={req.status} />
                        </TableCell>

                        {/* Submitted date */}
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          <Typography sx={{ fontSize: '0.8125rem', color: '#666666' }}>
                            {formatDate(req.createdAt)}
                          </Typography>
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {req.status === 'pending' && (
                              <>
                                <Tooltip title="Approve" arrow>
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() => handleApprove(req)}
                                      sx={{
                                        color: '#10b981',
                                        border: `1px solid ${alpha('#10b981', 0.25)}`,
                                        borderRadius: 1.5,
                                        '&:hover': {
                                          bgcolor: alpha('#10b981', 0.08),
                                          borderColor: '#10b981',
                                        },
                                        '&.Mui-disabled': { opacity: 0.4 },
                                      }}
                                    >
                                      <CheckOutlined sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                                <Tooltip title="Reject" arrow>
                                  <span>
                                    <IconButton
                                      size="small"
                                      disabled={actionLoading}
                                      onClick={() => handleOpenReject(req)}
                                      sx={{
                                        color: '#f43f5e',
                                        border: `1px solid ${alpha('#f43f5e', 0.25)}`,
                                        borderRadius: 1.5,
                                        '&:hover': {
                                          bgcolor: alpha('#f43f5e', 0.08),
                                          borderColor: '#f43f5e',
                                        },
                                        '&.Mui-disabled': { opacity: 0.4 },
                                      }}
                                    >
                                      <BlockOutlined sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </>
                            )}
                            <Tooltip title="Delete" arrow>
                              <span>
                                <IconButton
                                  size="small"
                                  disabled={actionLoading}
                                  onClick={() => handleOpenDelete(req)}
                                  sx={{
                                    color: '#94a3b8',
                                    borderRadius: 1.5,
                                    '&:hover': {
                                      color: '#f43f5e',
                                      bgcolor: alpha('#f43f5e', 0.06),
                                    },
                                    '&.Mui-disabled': { opacity: 0.4 },
                                  }}
                                >
                                  <Delete sx={{ fontSize: 16 }} />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={totalCount}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[10, 20, 50]}
                  sx={{
                    borderTop: '1px solid #f2f2f2',
                    '.MuiTablePagination-toolbar': { minHeight: 48 },
                    '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
                      fontSize: '0.8125rem',
                      color: '#666666',
                    },
                  }}
                />
              </TableContainer>
            )}
          </>
        )}

        {/* ════════════════════════════════════════════════════════════════════
            TAB: OVERVIEW
        ════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>

              {/* Breakdown panel */}
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 3,
                  bgcolor: '#ffffff',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f2f2f2' }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1E' }}>
                    Request Breakdown
                  </Typography>
                  <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.25 }}>
                    Distribution of workspace referral requests by status
                  </Typography>
                </Box>

                <Box sx={{ px: 3, py: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(
                    [
                      { label: 'Pending',  value: stats.pending,  color: '#f59e0b' },
                      { label: 'Approved', value: stats.approved, color: '#10b981' },
                      { label: 'Rejected', value: stats.rejected, color: '#f43f5e' },
                    ] as { label: string; value: number; color: string }[]
                  ).map(({ label, value, color }) => {
                    const pct = stats.total > 0 ? Math.round((value / stats.total) * 100) : 0;
                    return (
                      <Box key={label}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                bgcolor: color,
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 500, color: '#1C1C1E' }}>
                              {label}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: '#1C1C1E' }}>
                              {value}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: 32, textAlign: 'right' }}>
                              {pct}%
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: '#f1f5f9',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              height: '100%',
                              width: `${pct}%`,
                              bgcolor: color,
                              borderRadius: 3,
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>

              {/* Approval rate panel */}
              {stats.total > 0 && (
                <Paper
                  elevation={0}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 3,
                    bgcolor: '#ffffff',
                    overflow: 'hidden',
                  }}
                >
                  <Box sx={{ px: 3, py: 2, borderBottom: '1px solid #f2f2f2' }}>
                    <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1C1C1E' }}>
                      Approval Rate
                    </Typography>
                  </Box>
                  <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Box
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: '50%',
                        border: `4px solid ${alpha('#10b981', 0.20)}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        position: 'relative',
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#10b981' }}>
                        {stats.total > 0
                          ? `${Math.round((stats.approved / stats.total) * 100)}%`
                          : '—'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '0.875rem', color: '#1C1C1E', fontWeight: 500 }}>
                        {stats.approved} of {stats.total} requests approved
                      </Typography>
                      <Typography sx={{ fontSize: '0.8125rem', color: '#94a3b8', mt: 0.5 }}>
                        {stats.pending} still awaiting review
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              )}
            </Box>
        )}
      </Box>

      {/* ── Reject Dialog ── */}
      <RejectDialog
        open={rejectDialogOpen}
        onClose={() => { setRejectDialogOpen(false); setSelectedRequest(null); }}
        onConfirm={handleConfirmReject}
        loading={actionLoading}
      />

      {/* ── Delete Confirmation ── */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedRequest(null); }}
        onConfirm={handleConfirmDelete}
        title="Delete Request"
        itemName={selectedRequest?.email || ''}
        itemType="workspace request"
        description="This will permanently remove the referral request record."
        requireTyping={false}
        isSoftDelete={false}
        additionalWarnings={[
          'This action cannot be undone',
          'The request record will be permanently removed',
        ]}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
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

export default Referrals;
