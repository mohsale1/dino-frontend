import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Box,
  Modal,
  Backdrop,
  Fade,
  AppBar,
  Toolbar,
  IconButton,
  Stack
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface AreaDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (area: any) => void;
  area: any | null;
  isMobile?: boolean;
}

const AreaDialog: React.FC<AreaDialogProps> = ({
  open,
  onClose,
  onSave,
  area,
  isMobile = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
  });

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name || '',
        description: area.description || '',
        active: area.active !== undefined ? area.active : true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        active: true,
      });
    }
  }, [area, open]);

  const handleSave = () => {
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isMobile) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={open}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '95%',
              maxWidth: '450px',
              maxHeight: '85vh',
              bgcolor: 'background.paper',
              borderRadius: 1,
              boxShadow: 24,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <AppBar position="static" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
              <Toolbar sx={{ px: { xs: 1, sm: 3 } }}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                  {area ? 'Edit Area' : 'Add Area'}
                </Typography>
                <IconButton edge="end" color="inherit" onClick={onClose}>
                  <Close />
                </IconButton>
              </Toolbar>
            </AppBar>

            <Box sx={{ overflow: 'auto', p: { xs: 2, sm: 3 } }}>
              <Stack spacing={1}>
                <TextField
                  fullWidth
                  label="Area Name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  size="medium"
                />
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  size="medium"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.active}
                      onChange={(e) => handleChange('active', e.target.checked)}
                    />
                  }
                  label="Active"
                />
              </Stack>
            </Box>

            <Box sx={{ p: { xs: 2, sm: 3 }, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
              <Stack direction="row" spacing={1}>
                <Button onClick={onClose} fullWidth variant="outlined">
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="contained" fullWidth>
                  {area ? 'Update' : 'Add'} Area
                </Button>
              </Stack>
            </Box>
          </Box>
        </Fade>
      </Modal>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          m: 2,
          maxHeight: 'calc(100vh - 64px)'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight="600">
          {area ? 'Edit Area' : 'Add Area'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ 
        px: { xs: 1, sm: 3 }, 
        py: { xs: 1, sm: 4 }
      }}>
        <Grid container spacing={1} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Area Name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., Main Hall, Outdoor Patio, VIP Section"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe this seating area..."
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => handleChange('active', e.target.checked)}
                />
              }
              label="Active"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          {area ? 'Update' : 'Add'} Area
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AreaDialog;
