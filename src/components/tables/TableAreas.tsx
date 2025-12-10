import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Stack,
} from '@mui/material';
import { Edit, Delete, LocationOn, Add, TableRestaurant } from '@mui/icons-material';

interface TableAreasProps {
  areas: any[];
  tables: any[];
  onEditArea: (area: any) => void;
  onDeleteArea: (areaId: string) => void;
  onAddArea: () => void;
}

const TableAreas: React.FC<TableAreasProps> = ({
  areas,
  tables,
  onEditArea,
  onDeleteArea,
  onAddArea
}) => {
  return (
    <Box sx={{ 
      backgroundColor: 'white',
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <LocationOn sx={{ color: 'white', fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5 }}>
              Seating Areas ({areas.length})
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Organize tables by location and area
            </Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onAddArea}
          size="medium"
          sx={{
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: 'white',
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          Add Area
        </Button>
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 3 }}>
        {areas.length === 0 ? (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3
              }}
            >
              <LocationOn sx={{ fontSize: 40, color: 'text.secondary' }} />
            </Box>
            <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary">
              No Seating Areas Yet
            </Typography>
            <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: '500px', mx: 'auto' }}>
              Create your first seating area to organize your tables by location. Areas help you manage different sections of your restaurant.
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={onAddArea}
              size="large"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 2,
                fontWeight: 600,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              Create Your First Area
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {areas.map((area) => {
              const tablesInArea = tables.filter(t => t.location === area.id);
              
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={area.id}>
                  <Card
                    sx={{
                      height: '100%',
                      backgroundColor: 'white',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      borderRadius: 2,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 28px rgba(0, 0, 0, 0.12)',
                        borderColor: 'primary.main',
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        backgroundColor: 'primary.main',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 2.5, position: 'relative' }}>
                      {/* Action Buttons */}
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12,
                        display: 'flex',
                        gap: 0.5,
                        zIndex: 2
                      }}>
                        <Tooltip title="Edit Area" placement="top">
                          <IconButton 
                            size="small" 
                            onClick={() => onEditArea(area)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                              width: 32,
                              height: 32,
                              '&:hover': { 
                                backgroundColor: 'primary.50',
                                color: 'primary.main',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Edit sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Area" placement="top">
                          <IconButton 
                            size="small" 
                            onClick={() => onDeleteArea(area.id)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                              width: 32,
                              height: 32,
                              '&:hover': { 
                                backgroundColor: 'error.50',
                                color: 'error.main',
                                transform: 'scale(1.1)',
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Delete sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Area Icon */}
                      <Box
                        sx={{
                          width: 64,
                          height: 64,
                          borderRadius: 2,
                          backgroundColor: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mx: 'auto',
                          mb: 2,
                        }}
                      >
                        <LocationOn sx={{ color: 'white', fontSize: 32 }} />
                      </Box>
                      
                      {/* Area Name */}
                      <Typography 
                        variant="h6" 
                        fontWeight="700" 
                        sx={{ 
                          color: 'text.primary',
                          mb: 1,
                          fontSize: '1rem',
                          textAlign: 'center',
                          display: '-webkit-box',
                          WebkitLineClamp: 1,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {area.name}
                      </Typography>
                      
                      {/* Description */}
                      {area.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            mb: 2,
                            fontSize: '0.85rem',
                            textAlign: 'center',
                            lineHeight: 1.5,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: '2.5em'
                          }}
                        >
                          {area.description}
                        </Typography>
                      )}
                      
                      {/* Table Count */}
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 1, 
                        mb: 2,
                        p: 1.5,
                        borderRadius: 1,
                        backgroundColor: 'grey.50',
                        border: '1px solid',
                        borderColor: 'grey.200'
                      }}>
                        <TableRestaurant sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography 
                          variant="h6" 
                          fontWeight="700" 
                          sx={{ color: 'primary.main', fontSize: '1.25rem' }}
                        >
                          {tablesInArea.length}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}
                        >
                          {tablesInArea.length === 1 ? 'table' : 'tables'}
                        </Typography>
                      </Box>
                      
                      {/* Status Chip - Show active if area has active tables */}
                      <Box sx={{ textAlign: 'center' }}>
                        <Chip
                          label={
                            tablesInArea.some(t => t.is_active) 
                              ? 'Active' 
                              : (area.active ? 'Active' : 'Inactive')
                          }
                          size="small"
                          color={
                            tablesInArea.some(t => t.is_active) 
                              ? 'success' 
                              : (area.active ? 'success' : 'default')
                          }
                          variant="outlined"
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            height: 24,
                            '& .MuiChip-label': {
                              px: 1.5
                            }
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default TableAreas;