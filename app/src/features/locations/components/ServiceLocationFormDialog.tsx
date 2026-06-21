import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  Button,
  IconButton,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import type { ServiceLocation, ServiceArea } from '../types';

const PRIMARY = '#00A6CA';
const PRIMARY_HOVER = '#005F8D';

const STATUS_OPTIONS = [
  { value: 'available', label: 'Available' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'reserved', label: 'Reserved' },
  { value: 'out_of_service', label: 'Out of Service' },
] as const;

type BackendStatus = 'available' | 'occupied' | 'reserved' | 'out_of_service';

interface FormState {
  table_number: string;
  area_id: number;
  capacity: number;
  status: BackendStatus;
}

const DEFAULT_FORM: FormState = {
  table_number: '',
  area_id: 0,
  capacity: 4,
  status: 'available',
};

export interface TableFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  table?: ServiceLocation | null;
  areas?: ServiceArea[];
  loading?: boolean;
}

const toBackendStatus = (status: string): BackendStatus => {
  if (status === 'maintenance') return 'out_of_service';
  if (['available', 'occupied', 'reserved', 'out_of_service'].includes(status)) {
    return status as BackendStatus;
  }
  return 'available';
};

export const ServiceLocationFormDialog: React.FC<TableFormDialogProps> = ({
  open,
  onClose,
  onSave,
  table,
  areas = [],
  loading = false,
}) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState<FormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<{ table_number: string; area_id: string; capacity: string }>({
    table_number: '',
    area_id: '',
    capacity: '',
  });

  useEffect(() => {
    if (open) {
      if (table) {
        setFormData({
          table_number: table.identifier || '',
          area_id: table.areaId ? Number(table.areaId) : 0,
          capacity: table.capacity ?? 4,
          status: toBackendStatus(table.status),
        });
      } else {
        setFormData(DEFAULT_FORM);
      }
      setErrors({ table_number: '', area_id: '', capacity: '' });
    }
  }, [open, table]);

  const validate = (): boolean => {
    const next = { table_number: '', area_id: '', capacity: '' };
    let valid = true;

    if (!formData.table_number.trim()) {
      next.table_number = 'Table number is required';
      valid = false;
    } else if (formData.table_number.trim().length > 50) {
      next.table_number = 'Table number must be 50 characters or fewer';
      valid = false;
    }

    if (formData.capacity < 1 || formData.capacity > 50) {
      next.capacity = 'Capacity must be between 1 and 50';
      valid = false;
    }

    setErrors(next);
    return valid;
  };

  const handleSave = () => {
    if (!validate()) return;

    onSave({
      table_number: formData.table_number.trim(),
      area_id: formData.area_id !== 0 ? formData.area_id : undefined,
      capacity: formData.capacity,
      status: formData.status,
    });
  };

  const handleFieldChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field in errors && errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const isEdit = Boolean(table);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          px: 3,
          py: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              bgcolor: alpha(PRIMARY, 0.08),
              border: `1px solid ${alpha(PRIMARY, 0.20)}`,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <TableRestaurantIcon sx={{ color: PRIMARY, fontSize: 20 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: '#1C1C1E', fontWeight: 700, lineHeight: 1.2 }}
            >
              {isEdit ? 'Edit Table' : 'Add Table'}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#666666', lineHeight: 1.2 }}
            >
              {isEdit ? 'Update table details' : 'Create a new table'}
            </Typography>
          </Box>

          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: '#666666',
              '&:hover': { color: '#1C1C1E', bgcolor: alpha('#000', 0.06) },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
        <Grid container spacing={2}>
          {/* Table Number */}
          <Grid item xs={12}>
            <TextField
              label="Table Number"
              value={formData.table_number}
              onChange={(e) => handleFieldChange('table_number', e.target.value)}
              error={Boolean(errors.table_number)}
              helperText={errors.table_number || 'e.g. T1, Table 5, Counter 2'}
              required
              autoFocus
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{ maxLength: 50 }}
            />
          </Grid>

          {/* Area */}
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="area-select-label">Area</InputLabel>
              <Select
                labelId="area-select-label"
                label="Area"
                value={formData.area_id}
                onChange={(e) => handleFieldChange('area_id', Number(e.target.value))}
              >
                <MenuItem value={0}>
                  <Typography component="span" sx={{ color: '#9e9e9e', fontStyle: 'italic' }}>
                    No Area
                  </Typography>
                </MenuItem>
                {areas.map((area) => (
                  <MenuItem key={area.id} value={Number(area.id)}>
                    {area.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Status */}
          <Grid item xs={12} sm={6}>
            <FormControl variant="outlined" size="small" fullWidth>
              <InputLabel id="status-select-label">Status</InputLabel>
              <Select
                labelId="status-select-label"
                label="Status"
                value={formData.status}
                onChange={(e) => handleFieldChange('status', e.target.value as BackendStatus)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Capacity */}
          <Grid item xs={12} sm={6}>
            <TextField
              label="Capacity"
              type="number"
              value={formData.capacity}
              onChange={(e) => handleFieldChange('capacity', Number(e.target.value))}
              error={Boolean(errors.capacity)}
              helperText={errors.capacity || ' '}
              variant="outlined"
              size="small"
              fullWidth
              inputProps={{ min: 1, max: 50 }}
            />
          </Grid>

        </Grid>
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          borderTop: '1px solid #e2e8f0',
          px: 3,
          py: 2,
          gap: 1,
          flexDirection: { xs: 'column-reverse', sm: 'row' },
        }}
      >
        <Button
          onClick={onClose}
          variant="text"
          disabled={loading}
          fullWidth={fullScreen}
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 1.5,
            color: '#64748b',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          fullWidth={fullScreen}
          startIcon={loading ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 1.5,
            bgcolor: PRIMARY,
            '&:hover': { bgcolor: PRIMARY_HOVER },
          }}
        >
          {isEdit ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ServiceLocationFormDialog;