import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  Avatar,
  Rating,
  Divider,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  InputBase,
  Tooltip,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Add,
  Delete,
  Edit,
  Save,
  Close,
  Search,
  CheckCircle,
  Cancel,
  FormatQuote,
  Star,
  FilterList,
  Refresh,
  VisibilityOutlined,
  VisibilityOffOutlined,
} from '@mui/icons-material';
import { homePageService, Testimonial } from '../../services/api/homePage';

// ── Design tokens ─────────────────────────────────────────────────────────────
const P   = '#00A6CA';
const PH  = '#005F8D';
const PB  = 'rgba(0,166,202,0.08)';
const PBR = 'rgba(0,166,202,0.2)';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 1.5,
    '&.Mui-focused fieldset': { borderColor: P },
  },
  '& label.Mui-focused': { color: P },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name: string) =>
  name ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?';

const avatarColor = (name: string) => {
  const colors = ['#00A6CA', '#005F8D', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#3b82f6'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const EMPTY_TESTIMONIAL: Testimonial = {
  name: '', role: '', restaurant: '', location: '',
  rating: 5, comment: '', avatar: '', is_approved: false,
  created_at: new Date().toISOString(),
};

// ── Testimonial card ──────────────────────────────────────────────────────────
interface CardProps {
  t: Testimonial;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleApprove: () => void;
}

const TestimonialCard: React.FC<CardProps> = ({ t, onEdit, onDelete, onToggleApprove }) => {
  const approved = !!t.is_approved;
  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        border: `1px solid ${approved ? 'rgba(16,185,129,0.3)' : '#e0e0e0'}`,
        borderRadius: 2,
        p: 2.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        position: 'relative',
        transition: 'box-shadow 0.15s',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.07)' },
      }}
    >
      {/* Approval badge */}
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <Chip
          icon={approved
            ? <CheckCircle sx={{ fontSize: '13px !important', color: '#10b981 !important' }} />
            : <Cancel sx={{ fontSize: '13px !important', color: '#999999 !important' }} />
          }
          label={approved ? 'Approved' : 'Hidden'}
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 600,
            bgcolor: approved ? 'rgba(16,185,129,0.1)' : '#f5f5f5',
            color: approved ? '#10b981' : '#999999',
            border: `1px solid ${approved ? 'rgba(16,185,129,0.3)' : '#e0e0e0'}`,
          }}
        />
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pr: 8 }}>
        <Avatar sx={{ width: 40, height: 40, bgcolor: avatarColor(t.name), fontSize: '0.875rem', fontWeight: 700, flexShrink: 0 }}>
          {t.avatar && !t.avatar.startsWith('http') ? t.avatar.toUpperCase().slice(0, 2) : initials(t.name)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#1C1C1E', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {t.name || 'Unnamed'}
          </Typography>
          <Typography sx={{ fontSize: '0.78rem', color: '#666666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {[t.role, t.restaurant].filter(Boolean).join(' · ') || 'No role'}
          </Typography>
        </Box>
      </Box>

      {/* Rating */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Rating value={t.rating} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }} />
        <Typography sx={{ fontSize: '0.78rem', color: '#999999' }}>{t.rating}/5</Typography>
      </Box>

      {/* Comment */}
      <Box sx={{ bgcolor: '#f8fafc', borderRadius: 1.5, px: 1.5, py: 1, position: 'relative' }}>
        <FormatQuote sx={{ fontSize: 16, color: '#d1d5db', position: 'absolute', top: 6, left: 8 }} />
        <Typography sx={{ fontSize: '0.8125rem', color: '#444444', lineHeight: 1.6, pl: 2.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {t.comment || 'No comment provided.'}
        </Typography>
      </Box>

      {/* Location + date */}
      {(t.location || t.created_at) && (
        <Typography sx={{ fontSize: '0.72rem', color: '#999999' }}>
          {[t.location, t.created_at ? new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''].filter(Boolean).join(' · ')}
        </Typography>
      )}

      {/* Actions */}
      <Divider sx={{ borderColor: '#f2f2f2' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title={approved ? 'Hide from homepage' : 'Approve for homepage'} arrow>
          <Button
            size="small"
            variant={approved ? 'outlined' : 'contained'}
            startIcon={approved ? <VisibilityOffOutlined sx={{ fontSize: 15 }} /> : <VisibilityOutlined sx={{ fontSize: 15 }} />}
            onClick={onToggleApprove}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 1.5,
              px: 1.5,
              py: 0.5,
              ...(approved
                ? { borderColor: 'rgba(0,0,0,0.15)', color: '#666666', '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: 'rgba(239,68,68,0.04)' } }
                : { bgcolor: '#10b981', boxShadow: 'none', '&:hover': { bgcolor: '#059669', boxShadow: 'none' } }
              ),
            }}
          >
            {approved ? 'Hide' : 'Approve'}
          </Button>
        </Tooltip>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Edit" arrow>
          <IconButton size="small" onClick={onEdit} sx={{ color: '#999999', '&:hover': { color: P, bgcolor: PB } }}>
            <Edit sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete" arrow>
          <IconButton size="small" onClick={onDelete} sx={{ color: '#999999', '&:hover': { color: '#ef4444', bgcolor: 'rgba(239,68,68,0.06)' } }}>
            <Delete sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

// ── Edit / Add dialog ─────────────────────────────────────────────────────────
interface EditDialogProps {
  open: boolean;
  testimonial: Testimonial;
  isNew: boolean;
  onChange: (field: keyof Testimonial, value: any) => void;
  onSave: () => void;
  onClose: () => void;
}

const EditDialog: React.FC<EditDialogProps> = ({ open, testimonial: t, isNew, onChange, onSave, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}>
    {/* Header */}
    <Box sx={{ px: 3, pt: 2.5, pb: 2, borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#1C1C1E' }}>
          {isNew ? 'Add Testimonial' : 'Edit Testimonial'}
        </Typography>
        <Typography sx={{ fontSize: '0.8rem', color: '#666666', mt: 0.25 }}>
          {isNew ? 'Create a new customer review' : 'Update the testimonial details'}
        </Typography>
      </Box>
      <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(0,0,0,0.45)', '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}>
        <Close fontSize="small" />
      </IconButton>
    </Box>

    <DialogContent sx={{ pt: 2.5, pb: 1 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Customer Name *" value={t.name} onChange={e => onChange('name', e.target.value)} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Role / Title" value={t.role || ''} onChange={e => onChange('role', e.target.value)} placeholder="e.g. Owner, Manager" sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Restaurant / Business" value={t.restaurant || ''} onChange={e => onChange('restaurant', e.target.value)} sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Location" value={t.location || ''} onChange={e => onChange('location', e.target.value)} placeholder="e.g. Mumbai, India" sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" label="Avatar (initials or URL)" value={t.avatar || ''} onChange={e => onChange('avatar', e.target.value)} placeholder="JD or https://..." sx={fieldSx} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box>
            <Typography variant="caption" sx={{ color: '#666666', display: 'block', mb: 0.75, fontWeight: 500 }}>Rating *</Typography>
            <Rating
              value={t.rating}
              onChange={(_, v) => onChange('rating', v || 5)}
              sx={{ '& .MuiRating-iconFilled': { color: '#f59e0b' } }}
            />
          </Box>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth multiline rows={3} size="small"
            label="Testimonial Comment *"
            value={t.comment}
            onChange={e => onChange('comment', e.target.value)}
            sx={fieldSx}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={!!t.is_approved}
                onChange={e => onChange('is_approved', e.target.checked)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': { color: '#10b981' },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#10b981' },
                }}
              />
            }
            label={
              <Box>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1C1C1E' }}>
                  Approve for homepage
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: '#666666' }}>
                  Approved testimonials are visible on the public homepage
                </Typography>
              </Box>
            }
          />
        </Grid>
      </Grid>
    </DialogContent>

    <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', gap: 1 }}>
      <Button onClick={onClose} sx={{ textTransform: 'none', color: '#666666', fontWeight: 500 }}>
        Cancel
      </Button>
      <Button
        onClick={onSave}
        variant="contained"
        disabled={!t.name.trim() || !t.comment.trim()}
        sx={{ textTransform: 'none', fontWeight: 600, bgcolor: P, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: PH, boxShadow: 'none' } }}
      >
        {isNew ? 'Add Testimonial' : 'Save Changes'}
      </Button>
    </DialogActions>
  </Dialog>
);

// ── Main component ────────────────────────────────────────────────────────────
const Appearance: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [fetchError,   setFetchError]   = useState<string | null>(null);
  const [snackbar,     setSnackbar]     = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [hasChanges,   setHasChanges]   = useState(false);

  // Filters
  const [search,         setSearch]         = useState('');
  const [filterApproval, setFilterApproval] = useState<'all' | 'approved' | 'hidden'>('all');
  const [filterRating,   setFilterRating]   = useState<number | ''>('');

  // Dialog
  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editIndex,    setEditIndex]    = useState<number | null>(null);
  const [editDraft,    setEditDraft]    = useState<Testimonial>(EMPTY_TESTIMONIAL);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await homePageService.getTestimonials();
      setTestimonials(data);
      setHasChanges(false);
    } catch (err: any) {
      setFetchError(err.message || 'Failed to load testimonials.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Save all ───────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      await homePageService.updateTestimonials(testimonials);
      setHasChanges(false);
      setSnackbar({ open: true, message: 'Testimonials saved successfully.', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message || 'Failed to save testimonials.', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // ── CRUD helpers ───────────────────────────────────────────────────────────
  const mutate = (next: Testimonial[]) => { setTestimonials(next); setHasChanges(true); };

  const openAdd = () => {
    setEditIndex(null);
    setEditDraft({ ...EMPTY_TESTIMONIAL, created_at: new Date().toISOString() });
    setDialogOpen(true);
  };

  const openEdit = (index: number) => {
    setEditIndex(index);
    setEditDraft({ ...testimonials[index] });
    setDialogOpen(true);
  };

  const handleDialogSave = () => {
    if (editIndex === null) {
      mutate([...testimonials, editDraft]);
    } else {
      const next = [...testimonials];
      next[editIndex] = editDraft;
      mutate(next);
    }
    setDialogOpen(false);
  };

  const handleDelete = (index: number) => {
    mutate(testimonials.filter((_, i) => i !== index));
  };

  const handleToggleApprove = (index: number) => {
    const next = [...testimonials];
    next[index] = { ...next[index], is_approved: !next[index].is_approved };
    mutate(next);
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return testimonials
      .map((t, i) => ({ t, i }))
      .filter(({ t }) => {
        if (search && !t.name.toLowerCase().includes(search.toLowerCase()) &&
            !t.comment.toLowerCase().includes(search.toLowerCase()) &&
            !(t.restaurant || '').toLowerCase().includes(search.toLowerCase())) return false;
        if (filterApproval === 'approved' && !t.is_approved) return false;
        if (filterApproval === 'hidden'   &&  t.is_approved) return false;
        if (filterRating !== '' && t.rating !== filterRating) return false;
        return true;
      });
  }, [testimonials, search, filterApproval, filterRating]);

  // ── Stats summary ──────────────────────────────────────────────────────────
  const totalCount    = testimonials.length;
  const approvedCount = testimonials.filter(t => t.is_approved).length;
  const hiddenCount   = totalCount - approvedCount;
  const avgRating     = totalCount > 0
    ? (testimonials.reduce((s, t) => s + t.rating, 0) / totalCount).toFixed(1)
    : '—';

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
      <Box sx={{
        bgcolor: '#ffffff',
        px: { xs: 3, sm: 4, md: 5 },
        pt: 3, pb: 3,
        borderBottom: '1px solid #e0e0e0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2,
      }}>
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>
            Testimonials
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#666666', mt: 0.5 }}>
            Manage customer reviews shown on the public homepage
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Tooltip title="Refresh from server" arrow>
            <IconButton onClick={fetchData} size="small" sx={{ border: '1px solid #e0e0e0', borderRadius: 2, color: '#666666', '&:hover': { bgcolor: PB, color: P, borderColor: PBR } }}>
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={openAdd}
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2, borderColor: PBR, color: P, '&:hover': { borderColor: P, bgcolor: PB } }}
          >
            Add Testimonial
          </Button>
          <Button
            variant="contained"
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <Save />}
            onClick={handleSaveAll}
            disabled={saving || !hasChanges}
            sx={{
              textTransform: 'none', fontWeight: 600, borderRadius: 2,
              bgcolor: P, boxShadow: 'none',
              '&:hover': { bgcolor: PH, boxShadow: 'none' },
              '&:disabled': { bgcolor: alpha(P, 0.35) },
            }}
          >
            {saving ? 'Saving...' : `Save Changes${hasChanges ? ' *' : ''}`}
          </Button>
        </Box>
      </Box>

      {/* ── Stats bar ── */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', px: { xs: 3, sm: 4, md: 5 }, py: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {[
          { label: 'Total',    value: totalCount,    color: '#1C1C1E' },
          { label: 'Approved', value: approvedCount, color: '#10b981' },
          { label: 'Hidden',   value: hiddenCount,   color: '#999999' },
          { label: 'Avg Rating', value: avgRating,   color: '#f59e0b', suffix: <Star sx={{ fontSize: 13, color: '#f59e0b', ml: 0.25, mb: '-2px' }} /> },
        ].map(({ label, value, color, suffix }) => (
          <Box key={label} sx={{ flex: '1 1 100px', bgcolor: '#f8fafc', border: '1px solid #e0e0e0', borderRadius: 2, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: '1.25rem', fontWeight: 700, color, lineHeight: 1, display: 'flex', alignItems: 'center' }}>
                {value}{suffix}
              </Typography>
              <Typography sx={{ fontSize: '0.72rem', color: '#999999', mt: 0.25 }}>{label}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* ── Toolbar ── */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0', px: { xs: 2, sm: 3, md: 5 }, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Search */}
        <Box sx={{ flex: '1 1 220px', display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f8fafc', border: '1px solid #e0e0e0', borderRadius: 2, px: 1.5, py: 0.75 }}>
          <Search sx={{ fontSize: 17, color: '#999999', flexShrink: 0 }} />
          <InputBase
            placeholder="Search by name, comment, business..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ flex: 1, fontSize: '0.875rem' }}
          />
          {search && (
            <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25, color: '#999999' }}>
              <Close sx={{ fontSize: 14 }} />
            </IconButton>
          )}
        </Box>

        {/* Approval filter */}
        <ToggleButtonGroup
          value={filterApproval}
          exclusive
          onChange={(_, v) => { if (v) setFilterApproval(v); }}
          size="small"
          sx={{
            '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', px: 1.5, py: 0.5, border: '1px solid #e0e0e0', color: '#666666' },
            '& .Mui-selected': { bgcolor: `${PB} !important`, color: `${P} !important`, borderColor: `${PBR} !important` },
          }}
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="approved">Approved</ToggleButton>
          <ToggleButton value="hidden">Hidden</ToggleButton>
        </ToggleButtonGroup>

        {/* Rating filter */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={filterRating}
            onChange={e => setFilterRating(e.target.value as number | '')}
            displayEmpty
            sx={{ borderRadius: 2, fontSize: '0.875rem', bgcolor: '#f8fafc' }}
          >
            <MenuItem value="">All Ratings</MenuItem>
            {[5, 4, 3, 2, 1].map(r => (
              <MenuItem key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear filters */}
        {(search || filterApproval !== 'all' || filterRating !== '') && (
          <Button
            size="small"
            onClick={() => { setSearch(''); setFilterApproval('all'); setFilterRating(''); }}
            sx={{ textTransform: 'none', color: '#666666', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 2 }}
          >
            Clear
          </Button>
        )}

        <Typography sx={{ ml: 'auto', fontSize: '0.8rem', color: '#999999', flexShrink: 0 }}>
          {filtered.length} of {totalCount}
        </Typography>
      </Box>

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, py: 3 }}>

        {fetchError && (
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setFetchError(null)}>
            {fetchError}
          </Alert>
        )}

        {hasChanges && (
          <Alert
            severity="info"
            sx={{ mb: 3, borderRadius: 2 }}
            action={
              <Button size="small" onClick={handleSaveAll} disabled={saving} sx={{ textTransform: 'none', fontWeight: 600, color: P }}>
                Save Now
              </Button>
            }
          >
            You have unsaved changes. Click "Save Changes" to publish to the homepage.
          </Alert>
        )}

        {filtered.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10, border: '2px dashed #e0e0e0', borderRadius: 3, bgcolor: '#fafafa' }}>
            <Box sx={{ width: 56, height: 56, borderRadius: 3, bgcolor: PB, border: `1px solid ${PBR}`, display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2, color: P }}>
              <FormatQuote sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: '#1C1C1E', mb: 0.5 }}>
              {totalCount === 0 ? 'No testimonials yet' : 'No results match your filters'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
              {totalCount === 0
                ? 'Add your first customer review to display on the homepage.'
                : 'Try adjusting your search or filter criteria.'}
            </Typography>
            {totalCount === 0 && (
              <Button variant="contained" startIcon={<Add />} onClick={openAdd}
                sx={{ textTransform: 'none', fontWeight: 600, bgcolor: P, borderRadius: 2, boxShadow: 'none', '&:hover': { bgcolor: PH, boxShadow: 'none' } }}>
                Add First Testimonial
              </Button>
            )}
          </Box>
        ) : (
          <Grid container spacing={2.5}>
            {filtered.map(({ t, i }) => (
              <Grid item xs={12} sm={6} lg={4} key={i}>
                <TestimonialCard
                  t={t}
                  index={i}
                  onEdit={() => openEdit(i)}
                  onDelete={() => handleDelete(i)}
                  onToggleApprove={() => handleToggleApprove(i)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>


      {/* ── Edit / Add Dialog ── */}
      <EditDialog
        open={dialogOpen}
        testimonial={editDraft}
        isNew={editIndex === null}
        onChange={(field, value) => setEditDraft(prev => ({ ...prev, [field]: value }))}
        onSave={handleDialogSave}
        onClose={() => setDialogOpen(false)}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: 1.5 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Appearance;