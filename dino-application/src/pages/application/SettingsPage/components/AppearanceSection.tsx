/**
 * AppearanceSection Component
 * 
 * Clean, professional theme and display settings
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Save,
  DarkMode,
  LightMode,
  SettingsBrightness,
  ViewCompact,
  Animation,
} from '@mui/icons-material';

export interface AppearanceSectionProps {
  appearanceSettings?: {
    theme: 'light' | 'dark' | 'auto';
    compactMode: boolean;
    animations: boolean;
  };
  onSave?: (data: any) => Promise<void>;
}

const AppearanceSection: React.FC<AppearanceSectionProps> = ({
  appearanceSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    theme: appearanceSettings?.theme || 'light',
    compactMode: appearanceSettings?.compactMode ?? false,
    animations: appearanceSettings?.animations ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save appearance settings:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#1a1a1a',
            mb: 0.5,
          }}
        >
          Appearance Settings
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          Customize how the application looks and feels
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Theme Selection */}
        <Box sx={{ mb: 3 }}>
          <FormControl component="fieldset" fullWidth>
            <FormLabel
              component="legend"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                color: '#1a1a1a',
                mb: 2,
                '&.Mui-focused': {
                  color: '#1a1a1a',
                },
              }}
            >
              Theme
            </FormLabel>
            <RadioGroup
              value={formData.theme}
              onChange={(e) => handleChange('theme', e.target.value)}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box
                  sx={{
                    border: '2px solid',
                    borderColor: formData.theme === 'light' ? '#1a1a1a' : '#e5e7eb',
                    borderRadius: 1.5,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.theme === 'light' ? '#f9fafb' : 'transparent',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb',
                    },
                  }}
                  onClick={() => handleChange('theme', 'light')}
                >
                  <FormControlLabel
                    value="light"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <LightMode sx={{ fontSize: 24, color: '#374151' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a' }}>
                            Light Mode
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                            Clean and bright interface
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Box>

                <Box
                  sx={{
                    border: '2px solid',
                    borderColor: formData.theme === 'dark' ? '#1a1a1a' : '#e5e7eb',
                    borderRadius: 1.5,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.theme === 'dark' ? '#f9fafb' : 'transparent',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb',
                    },
                  }}
                  onClick={() => handleChange('theme', 'dark')}
                >
                  <FormControlLabel
                    value="dark"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <DarkMode sx={{ fontSize: 24, color: '#374151' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a' }}>
                            Dark Mode
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                            Easy on the eyes in low light
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Box>

                <Box
                  sx={{
                    border: '2px solid',
                    borderColor: formData.theme === 'auto' ? '#1a1a1a' : '#e5e7eb',
                    borderRadius: 1.5,
                    p: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: formData.theme === 'auto' ? '#f9fafb' : 'transparent',
                    '&:hover': {
                      borderColor: '#9ca3af',
                      backgroundColor: '#f9fafb',
                    },
                  }}
                  onClick={() => handleChange('theme', 'auto')}
                >
                  <FormControlLabel
                    value="auto"
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <SettingsBrightness sx={{ fontSize: 24, color: '#374151' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.9375rem', color: '#1a1a1a' }}>
                            Auto
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8125rem' }}>
                            Matches your system preference
                          </Typography>
                        </Box>
                      </Box>
                    }
                    sx={{ m: 0, width: '100%' }}
                  />
                </Box>
              </Box>
            </RadioGroup>
          </FormControl>
        </Box>

        <Divider sx={{ my: 3, borderColor: '#e5e7eb' }} />

        {/* Display Options */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1a1a1a',
              mb: 2,
            }}
          >
            Display Options
          </Typography>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                  flexShrink: 0,
                }}
              >
                <ViewCompact sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#1a1a1a',
                    mb: 0.25,
                  }}
                >
                  Compact Mode
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.8125rem',
                  }}
                >
                  Reduce spacing for a more condensed layout
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={formData.compactMode}
              onChange={(e) => handleChange('compactMode', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1a1a1a',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            />
          </Box>

          <Divider />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1.5,
                  backgroundColor: '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#374151',
                  flexShrink: 0,
                }}
              >
                <Animation sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.9375rem',
                    color: '#1a1a1a',
                    mb: 0.25,
                  }}
                >
                  Animations
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#6b7280',
                    fontSize: '0.8125rem',
                  }}
                >
                  Enable smooth transitions and animations
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={formData.animations}
              onChange={(e) => handleChange('animations', e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1a1a1a',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#1a1a1a',
                },
              }}
            />
          </Box>
        </Box>

        {/* Action Buttons */}
        {hasChanges && (
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setFormData({
                  theme: appearanceSettings?.theme || 'light',
                  compactMode: appearanceSettings?.compactMode ?? false,
                  animations: appearanceSettings?.animations ?? true,
                });
                setHasChanges(false);
              }}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                borderColor: '#e5e7eb',
                color: '#374151',
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                backgroundColor: '#1a1a1a',
                '&:hover': {
                  backgroundColor: '#374151',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AppearanceSection;