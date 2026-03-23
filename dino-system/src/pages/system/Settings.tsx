import React from 'react';
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

              <TextField fullWidth label="System Name" defaultValue="Dino Platform" sx={{ mb: 2 }} />
              <TextField fullWidth label="Support Email" defaultValue="support@dino.in" sx={{ mb: 2 }} />
              <TextField fullWidth label="Admin Email" defaultValue="admin@dino.in" sx={{ mb: 2 }} />

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
              <FormControlLabel control={<Switch />} label="Maintenance Mode" />
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
              <FormControlLabel control={<Switch defaultChecked />} label="Enable JWT Authentication" />
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

              <TextField fullWidth label="SMTP Host" defaultValue="smtp.gmail.com" sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="SMTP Port"
                type="number"
                defaultValue="587"
                sx={{ mb: 2 }}
              />
              <TextField fullWidth label="SMTP Username" defaultValue="noreply@dino.in" sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="SMTP Password"
                type="password"
                defaultValue="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                sx={{ mb: 2 }}
              />

              <FormControlLabel control={<Switch defaultChecked />} label="Use TLS" />
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

              <TextField fullWidth label="Currency" defaultValue="USD" sx={{ mb: 2 }} />
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
              <FormControlLabel control={<Switch defaultChecked />} label="Auto-charge on Trial End" />
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Settings;