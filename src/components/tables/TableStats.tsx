import React from 'react';
import { Box, Grid, Typography, Stack, useTheme, alpha } from '@mui/material';
import { TableRestaurant, CheckCircle, People, LocationOn } from '@mui/icons-material';

interface TableStatsProps {
  tables: any[];
  areas: any[];
}

const TableStats: React.FC<TableStatsProps> = ({ tables, areas }) => {
  const theme = useTheme();

  const stats = [
    { 
      label: 'Total Tables', 
      value: tables.length, 
      color: '#2196F3', 
      icon: <TableRestaurant />,
      description: 'All tables in venue'
    },
    { 
      label: 'Available', 
      value: tables.filter(t => t.table_status === 'available').length, 
      color: '#4CAF50', 
      icon: <CheckCircle />,
      description: 'Ready for seating'
    },
    { 
      label: 'Occupied', 
      value: tables.filter(t => t.table_status === 'occupied').length, 
      color: '#F44336', 
      icon: <People />,
      description: 'Currently in use'
    },
    { 
      label: 'Areas', 
      value: areas.length, 
      color: '#FF9800', 
      icon: <LocationOn />,
      description: 'Seating areas'
    },
  ];

  if (tables.length === 0 && areas.length === 0) return null;

  return (
    <Grid container spacing={2} sx={{ mb: 2.5 }}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 1.5,
              backgroundColor: alpha(stat.color, 0.05),
              border: `1px solid ${alpha(stat.color, 0.2)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 6px 20px ${alpha(stat.color, 0.2)}`,
                backgroundColor: alpha(stat.color, 0.08),
              },
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              {/* Icon on the left */}
              <Box
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 1.5,
                  backgroundColor: stat.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}
              >
                {React.cloneElement(stat.icon, { fontSize: 'medium' })}
              </Box>
              
              {/* Text content on the right */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h4" 
                  fontWeight="700" 
                  color="text.primary" 
                  sx={{ 
                    fontSize: { xs: '1.25rem', sm: '2rem' },
                    lineHeight: 1.2,
                    mb: 0.5
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  fontWeight="600"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
};

export default TableStats;
