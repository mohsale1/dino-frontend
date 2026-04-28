import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Skeleton,
} from '@mui/material';
import { BusinessOutlined } from '@mui/icons-material';
import { useUserData } from '../../../../contexts/application/UserData';
import { workspaceService } from '../../../../services/application/workspace.service';

// ---------------------------------------------------------------------------
// Brand
// ---------------------------------------------------------------------------

const BRAND = {
  primary: '#1976D2',
  primaryHover: '#1565C0',
  primaryBg: 'rgba(25,118,210,0.08)',
  primaryBorder: 'rgba(25,118,210,0.2)',
};

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#ffffff',
    '& fieldset': { borderColor: '#e0e0e0' },
    '&:hover fieldset': { borderColor: BRAND.primaryBorder },
    '&.Mui-focused fieldset': { borderColor: BRAND.primary },
  },
  '& .MuiInputLabel-root.Mui-focused': { color: BRAND.primary },
};

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string }> = ({ icon, title, subtitle }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: { xs: 2, sm: 3 } }}>
    <Box sx={{
      width: { xs: 34, sm: 38 }, height: { xs: 34, sm: 38 },
      borderRadius: 2, bgcolor: BRAND.primaryBg, border: `1px solid ${BRAND.primaryBorder}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: BRAND.primary, flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C1C1E', lineHeight: 1.2, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface WorkspaceSectionProps {
  onSave?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const WorkspaceSection: React.FC<WorkspaceSectionProps> = ({ onSave }) => {
  const { userData, loading, refreshUserData } = useUserData();
  const workspace = userData?.workspace ?? null;

  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [dirty,       setDirty]       = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [success,     setSuccess]     = useState('');
  const [error,       setError]       = useState('');

  // Populate fields once workspace data is available
  useEffect(() => {
    if (workspace) {
      setName(workspace.name ?? '');
      setDescription(workspace.description ?? '');
      setDirty(false);
    }
  }, [workspace]);

  const handleChange = (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setter(e.target.value);
      setDirty(true);
      setSuccess('');
      setError('');
    };

  const handleCancel = () => {
    setName(workspace?.name ?? '');
    setDescription(workspace?.description ?? '');
    setDirty(false);
    setSuccess('');
    setError('');
  };

  const handleSave = async () => {
    if (!workspace?.id || !name.trim()) return;
    setSaving(true);
    setSuccess('');
    setError('');
    try {
      await workspaceService.updateWorkspace(workspace.id, {
        name: name.trim(),
        description: description.trim(),
      });
      await refreshUserData();
      setDirty(false);
      setSuccess('Workspace updated successfully.');
      onSave?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save workspace details.');
    } finally {
      setSaving(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render — skeleton while loading
  // ---------------------------------------------------------------------------

  return (
    <Card elevation={0} sx={{ borderRadius: '12px', border: '1px solid #e0e0e0' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <SectionHeader
          icon={<BusinessOutlined sx={{ fontSize: 20 }} />}
          title="Workspace Details"
          subtitle="Update your workspace name and description"
        />

        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2.5, borderRadius: 2 }}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !workspace ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Skeleton variant="rounded" height={40} />
            <Skeleton variant="rounded" height={96} />
            <Skeleton variant="rounded" height={36} width={120} sx={{ alignSelf: 'flex-end' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Workspace Name"
              value={name}
              onChange={handleChange(setName)}
              fullWidth
              size="small"
              required
              sx={fieldSx}
            />

            <TextField
              label="Description"
              value={description}
              onChange={handleChange(setDescription)}
              fullWidth
              multiline
              rows={3}
              size="small"
              sx={fieldSx}
            />

            <Divider sx={{ borderColor: '#e0e0e0' }} />

            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              justifyContent: 'flex-end',
              gap: { xs: 1.5, sm: 1.5 },
            }}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving || !dirty}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                  borderColor: '#e0e0e0', color: '#475569',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { borderColor: '#cbd5e1', bgcolor: '#f8fafc' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={saving || !dirty || !name.trim() || !workspace?.id}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
                sx={{
                  textTransform: 'none', fontWeight: 600, borderRadius: 2, px: 3,
                  bgcolor: BRAND.primary, boxShadow: 'none',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': { bgcolor: BRAND.primaryHover },
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkspaceSection;
