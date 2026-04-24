import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save,
  SecurityOutlined,
  EmailOutlined,
  PaymentOutlined,
} from '@mui/icons-material';

const textFieldSx = {
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#00A6CA' },
  '& label.Mui-focused': { color: '#00A6CA' },
};

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A6CA' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00A6CA' },
};

const sectionIconBoxSx = {
  width: 36,
  height: 36,
  borderRadius: 2,
  bgcolor: 'rgba(0,166,202,0.10)',
  border: '1px solid rgba(0,166,202,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const Settings: React.FC = () => {
  // General
  const [systemName, setSystemName] = useState('Dino Platform');
  const [supportEmail, setSupportEmail] = useState('support@dino.in');
  const [adminEmail, setAdminEmail] = useState('admin@dino.in');
  const [enableRegistration, setEnableRegistration] = useState(true);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Security
  const [sessionTimeout, setSessionTimeout] = useState('30');
  const [maxLoginAttempts, setMaxLoginAttempts] = useState('5');
  const [passwordMinLength, setPasswordMinLength] = useState('8');
  const [requireStrongPasswords, setRequireStrongPasswords] = useState(true);
  const [enableTwoFactor, setEnableTwoFactor] = useState(true);
  const [enableJWT, setEnableJWT] = useState(true);

  // Email
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('noreply@dino.in');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [useTLS, setUseTLS] = useState(true);

  // Billing
  const [currency, setCurrency] = useState('USD');
  const [taxRate, setTaxRate] = useState('10');
  const [trialPeriod, setTrialPeriod] = useState('14');
  const [enableFreeTrial, setEnableFreeTrial] = useState(true);
  const [autoCharge, setAutoCharge] = useState(true);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSave = () => {
    setSnackbarOpen(true);
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>
      {/* Page Header */}
      <Box
        sx={{
          bgcolor: '#ffffff',
          px: { xs: 3, sm: 4, md: 5 },
          pt: 3,
          pb: 3,
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '22px', fontWeight: 700, color: '#1C1C1E', letterSpacing: '-0.3px' }}>
            System Settings
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#666666', mt: 0.5 }}>
            Configure platform-wide settings
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          sx={{
            bgcolor: '#00A6CA',
            color: '#ffffff',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 2,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#005F8D', boxShadow: 'none' },
          }}
        >
          Save Changes
        </Button>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: 3, pb: 6 }}>
        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={sectionIconBoxSx}>
                  <SettingsIcon sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  General Settings
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="System Name"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="Support Email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="Admin Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableRegistration}
                    onChange={(e) => setEnableRegistration(e.target.checked)}
                    sx={switchSx}
                  />
                }
                label="Enable User Registration"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={enableEmailNotifications}
                    onChange={(e) => setEnableEmailNotifications(e.target.checked)}
                    sx={switchSx}
                  />
                }
                label="Enable Email Notifications"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={maintenanceMode}
                    onChange={(e) => setMaintenanceMode(e.target.checked)}
                    sx={switchSx}
                  />
                }
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
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={sectionIconBoxSx}>
                  <SecurityOutlined sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  Security Settings
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="Password Min Length"
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={requireStrongPasswords}
                    onChange={(e) => setRequireStrongPasswords(e.target.checked)}
                    sx={switchSx}
                  />
                }
                label="Require Strong Passwords"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={enableTwoFactor}
                    onChange={(e) => setEnableTwoFactor(e.target.checked)}
                    sx={switchSx}
                  />
                }
                label="Enable Two-Factor Authentication"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={enableJWT}
                    onChange={(e) => setEnableJWT(e.target.checked)}
                    sx={switchSx}
                  />
                }
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
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={sectionIconBoxSx}>
                  <EmailOutlined sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  Email Configuration
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="SMTP Host"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="SMTP Username"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={useTLS}
                    onChange={(e) => setUseTLS(e.target.checked)}
                    sx={switchSx}
                  />
                }
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
                border: '1px solid #e0e0e0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={sectionIconBoxSx}>
                  <PaymentOutlined sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  Billing Configuration
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />
              <TextField
                fullWidth
                label="Trial Period (days)"
                type="number"
                value={trialPeriod}
                onChange={(e) => setTrialPeriod(e.target.value)}
                sx={{ mb: 2, ...textFieldSx }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableFreeTrial}
                    onChange={(e) => setEnableFreeTrial(e.target.checked)}
                    sx={switchSx}
                  />
                }
                label="Enable Free Trial"
                sx={{ mb: 1 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={autoCharge}
                    onChange={(e) => setAutoCharge(e.target.checked)}
                    sx={switchSx}
                  />
                }
                label="Auto-charge on Trial End"
              />
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ fontWeight: 600 }}
        >
          Settings saved successfully.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;