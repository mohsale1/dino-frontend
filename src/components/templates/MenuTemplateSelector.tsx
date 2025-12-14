import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Chip,
  alpha,
  useTheme,
  Radio,
  RadioGroup,
  FormControlLabel,
  Paper,
  Fade,
  Zoom,
} from '@mui/material';
import {
  CheckCircle,
  Star,
  TrendingUp,
} from '@mui/icons-material';
import { templateConfigs } from './index';

interface MenuTemplateSelectorProps {
  selectedTemplate: string;
  onTemplateSelect: (templateName: string) => void;
  onSave: () => void;
  saving?: boolean;
}

const MenuTemplateSelector: React.FC<MenuTemplateSelectorProps> = ({
  selectedTemplate,
  onTemplateSelect,
  onSave,
  saving = false,
}) => {
  const theme = useTheme();
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Group templates by category
  const categorizedTemplates = Object.entries(templateConfigs).reduce((acc, [key, config]) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push({ key, ...config });
    return acc;
  }, {} as Record<string, Array<{ key: string } & typeof templateConfigs[string]>>);

  const categoryLabels = {
    professional: 'Professional Templates',
    creative: 'Creative Templates',
    themed: 'Themed Templates',
  };

  const categoryIcons = {
    professional: <Star sx={{ fontSize: 14 }} />,
    creative: <TrendingUp sx={{ fontSize: 14 }} />,
    themed: <CheckCircle sx={{ fontSize: 14 }} />,
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="600" gutterBottom>
          Choose Your Menu Template
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Select a template that best represents your venue's style. This will be displayed to all customers viewing your menu.
        </Typography>
      </Box>

      {/* Template Categories */}
      {Object.entries(categorizedTemplates).map(([category, templates]) => (
        <Box key={category} sx={{ mb: 5 }}>
          {/* Category Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              mb: 3,
              pb: 1.5,
              borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 36,
                height: 36,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
              }}
            >
              {categoryIcons[category as keyof typeof categoryIcons]}
            </Box>
            <Typography variant="h6" fontWeight="600">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </Typography>
            <Chip
              label={`${templates.length} templates`}
              size="small"
              sx={{
                ml: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                fontWeight: 600,
              }}
            />
          </Box>

          {/* Template Grid */}
          <Grid container spacing={3}>
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.key;
              const isHovered = hoveredTemplate === template.key;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={template.key}>
                  <Zoom in timeout={300}>
                    <Card
                      onMouseEnter={() => setHoveredTemplate(template.key)}
                      onMouseLeave={() => setHoveredTemplate(null)}
                      onClick={() => onTemplateSelect(template.key)}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        position: 'relative',
                        border: isSelected
                          ? `3px solid ${theme.palette.primary.main}`
                          : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        transform: isHovered || isSelected ? 'translateY(-8px)' : 'translateY(0)',
                        boxShadow: isSelected
                          ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.3)}`
                          : isHovered
                          ? theme.shadows[8]
                          : theme.shadows[2],
                        '&:hover': {
                          boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                      }}
                    >
                      {/* Selected Badge */}
                      {isSelected && (
                        <Fade in>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 12,
                              right: 12,
                              zIndex: 2,
                              backgroundColor: 'primary.main',
                              color: 'white',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: theme.shadows[4],
                            }}
                          >
                            <CheckCircle sx={{ fontSize: 14 }} />
                          </Box>
                        </Fade>
                      )}

                      {/* Template Preview */}
                      <Box
                        sx={{
                          height: 180,
                          background: template.previewGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: isHovered
                              ? `linear-gradient(135deg, ${alpha(theme.palette.common.black, 0.1)} 0%, transparent 100%)`
                              : 'transparent',
                            transition: 'background 0.3s ease',
                          },
                        }}
                      >
                        <Typography
                          variant="h2"
                          sx={{
                            fontSize: '4rem',
                            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.2))',
                          }}
                        >
                          {template.icon}
                        </Typography>
                      </Box>

                      {/* Template Info */}
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight="700" sx={{ flex: 1 }}>
                            {template.name}
                          </Typography>
                          <Radio
                            checked={isSelected}
                            value={template.key}
                            sx={{
                              p: 0,
                              '& .MuiSvgIcon-root': {
                                fontSize: 14,
                              },
                            }}
                          />
                        </Box>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.5,
                            minHeight: 40,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {template.description}
                        </Typography>

                        {/* Category Badge */}
                        <Box sx={{ mt: 2 }}>
                          <Chip
                            label={template.category}
                            size="small"
                            sx={{
                              textTransform: 'capitalize',
                              fontSize: '0.7rem',
                              height: 22,
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              color: 'primary.main',
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}

      {/* Save Button - Fixed at bottom */}
      <Paper
        elevation={4}
        sx={{
          position: 'sticky',
          bottom: 0,
          left: 0,
          right: 0,
          p: 3,
          mt: 4,
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              Selected Template: {templateConfigs[selectedTemplate]?.name || 'None'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {templateConfigs[selectedTemplate]?.description || 'Please select a template'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={onSave}
            disabled={saving || !selectedTemplate}
            sx={{
              px: 4,
              py: 1.5,
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              '&:hover': {
                boxShadow: theme.shadows[8],
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MenuTemplateSelector;