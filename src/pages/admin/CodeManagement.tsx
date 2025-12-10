import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  TextField,
  IconButton,
  alpha,
  Paper,
  keyframes,
} from '@mui/material';
import {
  Refresh,
  LockOutlined,
  CachedOutlined,
  Code as CodeIcon,
} from '@mui/icons-material';
import { codeService } from '../../services/business';
import AnimatedBackground from '../../components/ui/AnimatedBackground';

// Animation for refresh icon
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const CodeManagement: React.FC = () => {
  const theme = useTheme();
  
  const [code, setCode] = useState<string[]>(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' | 'info'
  });
  
  // Refs for input fields (read-only, but keeping for consistency)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Load current code on mount
  useEffect(() => {
    loadCurrentCode();
  }, []);

  const loadCurrentCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await codeService.getCurrentCode();
      
      if (response.success && response.data) {
        const digits = response.data.digits || response.data.code.split('');
        setCode(digits);
      } else {
        throw new Error(response.message || 'Failed to load code');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load code';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCode = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await codeService.refreshCode();
      
      if (response.success && response.data) {
        const digits = response.data.digits || response.data.code.split('');
        setCode(digits);
        
        setSnackbar({
          open: true,
          message: 'Code refreshed successfully!',
          severity: 'success'
        });
      } else {
        throw new Error(response.message || 'Failed to refresh code');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to refresh code';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'auto',
        height: 'auto',
        backgroundColor: '#f8f9fa',
        padding: 0,
        margin: 0,
        width: '100%',
        overflow: 'visible',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          backgroundColor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          color: 'text.primary',
        }}
      >
        <AnimatedBackground />
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: { xs: 2, md: 3 },
              py: { xs: 3, sm: 4 },
              px: { xs: 3, sm: 4 },
            }}
          >
            {/* Header Content */}
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CodeIcon sx={{ fontSize: 32, mr: 1.5, color: 'text.primary', opacity: 0.9 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="600"
                  sx={{
                    fontSize: { xs: '1.75rem', sm: '2rem' },
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    color: 'text.primary',
                  }}
                >
                  Code Management
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 400,
                  mb: 1,
                  maxWidth: '500px',
                  color: 'text.secondary',
                }}
              >
                View and manage the system's 4-digit access code
              </Typography>
            </Box>

            {/* Refresh Button */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <IconButton
                onClick={handleRefreshCode}
                disabled={loading || refreshing}
                size="medium"
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    color: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                title={refreshing ? 'Refreshing...' : 'Refresh code'}
              >
                {refreshing ? (
                  <CachedOutlined sx={{ animation: `${spin} 1s linear infinite` }} />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box sx={{ width: '100%', padding: 0, margin: 0 }}>
        {/* Error Alert */}
        {error && (
          <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3, pb: 1 }}>
            <Alert 
              severity="error" 
              onClose={() => setError(null)}
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Code Display Section */}
        <Box sx={{ px: { xs: 3, sm: 4 }, py: 4 }}>
          <Container maxWidth="sm">
            <Paper
              sx={{
                p: { xs: 3, sm: 5 },
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    py: 8,
                  }}
                >
                  <CircularProgress size={48} sx={{ mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Loading code...
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                      variant="h5"
                      component="h2"
                      fontWeight="700"
                      sx={{
                        mb: 1,
                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        color: 'text.primary',
                      }}
                    >
                      Current Access Code
                    </Typography>
                    
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                      }}
                    >
                      This is the current 4-digit system code
                    </Typography>
                  </Box>

                  {/* Lock Icon */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      mb: 3,
                    }}
                  >
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <LockOutlined
                        sx={{
                          fontSize: 35,
                          color: 'primary.main',
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Code Input Fields (Read-only) */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: { xs: 1.5, sm: 2 },
                      mb: 3,
                    }}
                  >
                    {code.map((digit, index) => (
                      <TextField
                        key={index}
                        inputRef={(el) => (inputRefs.current[index] = el)}
                        value={digit}
                        inputProps={{
                          readOnly: true,
                          style: {
                            textAlign: 'center',
                            fontSize: '1.75rem',
                            fontWeight: 700,
                            padding: '14px 0',
                            cursor: 'default',
                          },
                        }}
                        sx={{
                          width: { xs: 55, sm: 65 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            '& fieldset': {
                              borderWidth: 2,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                            },
                            '&:hover fieldset': {
                              borderColor: alpha(theme.palette.primary.main, 0.5),
                            },
                          },
                          '& input': {
                            color: 'primary.main',
                          },
                        }}
                      />
                    ))}
                  </Box>

                  {/* Refresh Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    onClick={handleRefreshCode}
                    disabled={refreshing}
                    startIcon={refreshing ? <CircularProgress size={20} /> : <Refresh />}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      textTransform: 'none',
                      mb: 2,
                    }}
                  >
                    {refreshing ? 'Refreshing...' : 'Refresh Code'}
                  </Button>

                  {/* Help Text */}
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.05),
                      border: '1px solid',
                      borderColor: alpha(theme.palette.info.main, 0.2),
                      width: '100%',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
                        display: 'block',
                        textAlign: 'center',
                      }}
                    >
                      Click the refresh button to generate a new random 4-digit code. 
                      The code will be updated in the system immediately.
                    </Typography>
                  </Box>
                </Box>
              )}
            </Paper>
          </Container>
        </Box>

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert 
            severity={snackbar.severity} 
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CodeManagement;