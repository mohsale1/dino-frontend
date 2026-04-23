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
  alpha,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Save,
  CalendarToday,
  SecurityOutlined,
  EmailOutlined,
  PaymentOutlined,
} from '@mui/icons-material';

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
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 45%, #312e81 100%)',
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
            background: 'radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)',
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
            background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{ color: 'rgba(199,210,254,0.75)', fontWeight: 700, letterSpacing: 3, fontSize: '0.65rem' }}
            >
              SYSTEM CONTROL CENTER
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mt: 0.5,
                fontSize: { xs: '1.5rem', md: '2rem' },
                letterSpacing: '-0.025em',
                lineHeight: 1.2,
              }}
            >
              System Settings
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 1 }}>
              <CalendarToday sx={{ fontSize: 13, color: 'rgba(199,210,254,0.6)' }} />
              <Typography
                variant="caption"
                sx={{ color: 'rgba(199,210,254,0.6)', fontWeight: 500, fontSize: '0.75rem' }}
              >
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={handleSave}
            sx={{
              mt: 1,
              bgcolor: alpha('#ffffff', 0.15),
              color: '#fff',
              border: `1px solid ${alpha('#ffffff', 0.25)}`,
              backdropFilter: 'blur(8px)',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { bgcolor: alpha('#ffffff', 0.25), border: `1px solid ${alpha('#ffffff', 0.4)}` },
            }}
          >
            Save Changes
          </Button>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, pt: 4, pb: 6 }}>
        <Grid container spacing={3}>
          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SettingsIcon sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                  General Settings
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="System Name"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Support Email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Admin Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableRegistration}
                    onChange={(e) => setEnableRegistration(e.target.checked)}
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
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SecurityOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                  Security Settings
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Session Timeout (minutes)"
                type="number"
                value={sessionTimeout}
                onChange={(e) => setSessionTimeout(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Max Login Attempts"
                type="number"
                value={maxLoginAttempts}
                onChange={(e) => setMaxLoginAttempts(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Password Min Length"
                type="number"
                value={passwordMinLength}
                onChange={(e) => setPasswordMinLength(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={requireStrongPasswords}
                    onChange={(e) => setRequireStrongPasswords(e.target.checked)}
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
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmailOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                  Email Configuration
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="SMTP Host"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="SMTP Username"
                value={smtpUsername}
                onChange={(e) => setSmtpUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                value={smtpPassword}
                onChange={(e) => setSmtpPassword(e.target.value)}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={useTLS}
                    onChange={(e) => setUseTLS(e.target.checked)}
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
                border: '1px solid #e2e8f0',
                borderRadius: 3,
                bgcolor: '#ffffff',
                height: '100%',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#f1f5f9', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PaymentOutlined sx={{ fontSize: 18, color: '#64748b' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>
                  Billing Configuration
                </Typography>
              </Box>

              <TextField
                fullWidth
                label="Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Trial Period (days)"
                type="number"
                value={trialPeriod}
                onChange={(e) => setTrialPeriod(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={enableFreeTrial}
                    onChange={(e) => setEnableFreeTrial(e.target.checked)}
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
