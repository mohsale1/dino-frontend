import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save,
} from '@mui/icons-material';

const Settings: React.FC = () => {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', p: { xs: 2, sm: 3, md: 4 } }}>
      <Container maxWidth="xl" disableGutters sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a', mb: 1 }}>
            System Settings
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748b' }}>
            Configure global system settings
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <SettingsIcon sx={{ fontSize: 24, color: '#0f172a', mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  General Settings
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="System Name"
                defaultValue="Dino Platform"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Support Email"
                defaultValue="support@dino.in"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Admin Email"
                defaultValue="admin@dino.in"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable User Registration"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Email Notifications"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch />}
                label="Maintenance Mode"
              />
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                Security Settings
              </Typography>

              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                defaultValue="30"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                defaultValue="5"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password Min Length"
                type="number"
                defaultValue="8"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Require Strong Passwords"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Two-Factor Authentication"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable JWT Authentication"
              />
            </Paper>
          </Grid>

          {/* Email Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                Email Configuration
              </Typography>

              <TextField
                fullWidth
                label="SMTP Host"
                defaultValue="smtp.gmail.com"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                defaultValue="587"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="SMTP Username"
                defaultValue="noreply@dino.in"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                defaultValue="••••••••"
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Use TLS"
              />
            </Paper>
          </Grid>

          {/* Billing Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', mb: 3 }}>
                Billing Configuration
              </Typography>

              <TextField
                fullWidth
                label="Currency"
                defaultValue="USD"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                defaultValue="10"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Trial Period (days)"
                type="number"
                defaultValue="14"
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Enable Free Trial"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Auto-charge on Trial End"
              />
            </Paper>
          </Grid>
        </Grid>

        {/* Save Button */}
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Save />}
            sx={{
              bgcolor: '#0f172a',
              '&:hover': { bgcolor: '#1e293b' },
              textTransform: 'none',
              fontWeight: 600,
              px: 4,
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;