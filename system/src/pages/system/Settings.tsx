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

// ── Shared sx tokens ──────────────────────────────────────────────────────────

const textFieldSx = {
  '& .MuiOutlinedInput-root.Mui-focused fieldset': { borderColor: '#00A6CA' },
  '& label.Mui-focused': { color: '#00A6CA' },
};

const switchSx = {
  '& .MuiSwitch-switchBase.Mui-checked': { color: '#00A6CA' },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#00A6CA' },
};

const iconBoxSx = {
  width: 36,
  height: 36,
  borderRadius: 2,
  bgcolor: 'rgba(0,166,202,0.10)',
  border: '1px solid rgba(0,166,202,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const cardSx = {
  p: 3,
  border: '1px solid #e0e0e0',
  borderRadius: 2,
  bgcolor: '#ffffff',
};

// ── Component ─────────────────────────────────────────────────────────────────

const Settings: React.FC = () => {
  // General
  const [systemName,               setSystemName]               = useState('Dino Platform');
  const [supportEmail,             setSupportEmail]             = useState('support@dino.in');
  const [adminEmail,               setAdminEmail]               = useState('admin@dino.in');
  const [enableRegistration,       setEnableRegistration]       = useState(true);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [maintenanceMode,          setMaintenanceMode]          = useState(false);

  // Security
  const [sessionTimeout,        setSessionTimeout]        = useState('30');
  const [maxLoginAttempts,      setMaxLoginAttempts]      = useState('5');
  const [passwordMinLength,     setPasswordMinLength]     = useState('8');
  const [requireStrongPasswords,setRequireStrongPasswords]= useState(true);
  const [enableTwoFactor,       setEnableTwoFactor]       = useState(true);
  const [enableJWT,             setEnableJWT]             = useState(true);

  // Email
  const [smtpHost,     setSmtpHost]     = useState('smtp.gmail.com');
  const [smtpPort,     setSmtpPort]     = useState('587');
  const [smtpUsername, setSmtpUsername] = useState('noreply@dino.in');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [useTLS,       setUseTLS]       = useState(true);

  // Billing
  const [currency,       setCurrency]       = useState('USD');
  const [taxRate,        setTaxRate]        = useState('10');
  const [trialPeriod,    setTrialPeriod]    = useState('14');
  const [enableFreeTrial,setEnableFreeTrial]= useState(true);
  const [autoCharge,     setAutoCharge]     = useState(true);

  // Snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleSave = () => setSnackbarOpen(true);

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#f8fafc' }}>

      {/* ── Page Header ── */}
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

      {/* ── Content ── */}
      <Box sx={{ px: { xs: 2, sm: 3, md: 5 }, py: 3 }}>
        <Grid container spacing={3}>

          {/* General Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={iconBoxSx}>
                  <SettingsIcon sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  General Settings
                </Typography>
              </Box>

              <TextField fullWidth label="System Name"   value={systemName}   onChange={e => setSystemName(e.target.value)}   sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth label="Support Email" value={supportEmail} onChange={e => setSupportEmail(e.target.value)} sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth label="Admin Email"   value={adminEmail}   onChange={e => setAdminEmail(e.target.value)}   sx={{ mb: 2, ...textFieldSx }} />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel sx={{ mb: 1, display: 'flex' }} label="Enable User Registration"   control={<Switch checked={enableRegistration}       onChange={e => setEnableRegistration(e.target.checked)}       sx={switchSx} />} />
              <FormControlLabel sx={{ mb: 1, display: 'flex' }} label="Enable Email Notifications" control={<Switch checked={enableEmailNotifications} onChange={e => setEnableEmailNotifications(e.target.checked)} sx={switchSx} />} />
              <FormControlLabel sx={{ display: 'flex' }}        label="Maintenance Mode"            control={<Switch checked={maintenanceMode}          onChange={e => setMaintenanceMode(e.target.checked)}          sx={switchSx} />} />
            </Paper>
          </Grid>

          {/* Security Settings */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={iconBoxSx}>
                  <SecurityOutlined sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  Security Settings
                </Typography>
              </Box>

              <TextField fullWidth type="number" label="Session Timeout (minutes)" value={sessionTimeout}    onChange={e => setSessionTimeout(e.target.value)}    sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth type="number" label="Max Login Attempts"        value={maxLoginAttempts}  onChange={e => setMaxLoginAttempts(e.target.value)}  sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth type="number" label="Password Min Length"       value={passwordMinLength} onChange={e => setPasswordMinLength(e.target.value)} sx={{ mb: 2, ...textFieldSx }} />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel sx={{ mb: 1, display: 'flex' }} label="Require Strong Passwords"        control={<Switch checked={requireStrongPasswords} onChange={e => setRequireStrongPasswords(e.target.checked)} sx={switchSx} />} />
              <FormControlLabel sx={{ mb: 1, display: 'flex' }} label="Enable Two-Factor Authentication" control={<Switch checked={enableTwoFactor}        onChange={e => setEnableTwoFactor(e.target.checked)}        sx={switchSx} />} />
              <FormControlLabel sx={{ display: 'flex' }}        label="Enable JWT Authentication"        control={<Switch checked={enableJWT}              onChange={e => setEnableJWT(e.target.checked)}              sx={switchSx} />} />
            </Paper>
          </Grid>

          {/* Email Configuration */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={iconBoxSx}>
                  <EmailOutlined sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  Email Configuration
                </Typography>
              </Box>

              <TextField fullWidth label="SMTP Host"     value={smtpHost}     onChange={e => setSmtpHost(e.target.value)}     sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth type="number" label="SMTP Port" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth label="SMTP Username" value={smtpUsername} onChange={e => setSmtpUsername(e.target.value)} sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth type="password" label="SMTP Password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} sx={{ mb: 2, ...textFieldSx }} />

              <FormControlLabel sx={{ display: 'flex' }} label="Use TLS" control={<Switch checked={useTLS} onChange={e => setUseTLS(e.target.checked)} sx={switchSx} />} />
            </Paper>
          </Grid>

          {/* Billing Configuration */}
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={cardSx}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={iconBoxSx}>
                  <PaymentOutlined sx={{ fontSize: 18, color: '#00A6CA' }} />
                </Box>
                <Typography sx={{ fontWeight: 700, color: '#1C1C1E', fontSize: '0.9375rem' }}>
                  Billing Configuration
                </Typography>
              </Box>

              <TextField fullWidth label="Currency"             value={currency}    onChange={e => setCurrency(e.target.value)}    sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth type="number" label="Tax Rate (%)"       value={taxRate}     onChange={e => setTaxRate(e.target.value)}     sx={{ mb: 2, ...textFieldSx }} />
              <TextField fullWidth type="number" label="Trial Period (days)" value={trialPeriod} onChange={e => setTrialPeriod(e.target.value)} sx={{ mb: 2, ...textFieldSx }} />

              <Divider sx={{ my: 2 }} />

              <FormControlLabel sx={{ mb: 1, display: 'flex' }} label="Enable Free Trial"       control={<Switch checked={enableFreeTrial} onChange={e => setEnableFreeTrial(e.target.checked)} sx={switchSx} />} />
              <FormControlLabel sx={{ display: 'flex' }}        label="Auto-charge on Trial End" control={<Switch checked={autoCharge}      onChange={e => setAutoCharge(e.target.checked)}      sx={switchSx} />} />
            </Paper>
          </Grid>

        </Grid>
      </Box>

      {/* ── Snackbar ── */}
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
