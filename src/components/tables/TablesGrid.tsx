import React from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Stack,
  IconButton,
  Avatar,
  Divider,
  List,
  ListItem,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  Add, 
  TableRestaurant, 
  Edit, 
  Delete, 
  QrCode, 
  Print, 
  People,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useTableFlags } from '../../flags/FlagContext';
import { FlagGate } from '../../flags/FlagComponent';

interface TablesGridProps {
  filteredTables: any[];
  tables: any[];
  areas: any[];
  selectedArea: string;
  setSelectedArea: (value: string) => void;
  getAreaName: (areaId: string) => string;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactElement;
  onToggleTableStatus: (tableId: string) => void;
  onGenerateQR: (tableId: string) => void;
  onPrintQR: (tableId: string) => void;
  onEditTable: (table: any) => void;
  onDeleteTable: (tableId: string) => void;
  onAddTable: () => void;
  isMobile?: boolean;
}

const TablesGrid: React.FC<TablesGridProps> = ({
  filteredTables,
  tables,
  areas,
  selectedArea,
  setSelectedArea,
  getAreaName,
  getStatusColor,
  getStatusIcon,
  onToggleTableStatus,
  onGenerateQR,
  onPrintQR,
  onEditTable,
  onDeleteTable,
  onAddTable,
  isMobile = false
}) => {
  const tableFlags = useTableFlags();

  return (
    <Box sx={{ 
      backgroundColor: 'white',
      borderRadius: 1,
      border: '1px solid',
      borderColor: 'grey.200',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <Box sx={{ 
        p: { xs: 2, sm: 3 },
        borderBottom: '1px solid',
        borderColor: 'grey.200'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1 }, width: { xs: '100%', sm: 'auto' } }}>
            <Box
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: '50%',
                backgroundColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}
            >
              <TableRestaurant sx={{ color: 'white', fontSize: { xs: 20, sm: 24 } }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h5" fontWeight="700" sx={{ color: 'text.primary', mb: 0.5, fontSize: { xs: '0.95rem', sm: '1.25rem' } }}>
                Tables ({filteredTables.length})
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: { xs: '0.8rem', sm: '1rem' }, display: { xs: 'none', sm: 'block' } }}>
                Manage your restaurant seating layout
              </Typography>
            </Box>
          </Box>
          
          {/* Filters and Add Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            {/* Area Filter */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 140 }, flex: { xs: 1, sm: 'none' } }}>
              <InputLabel>Filter Area</InputLabel>
              <Select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                label="Filter Area"
                sx={{ borderRadius: 1 }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'primary.main' }} />
                    All Areas
                  </Box>
                </MenuItem>
                {areas.map(area => (
                  <MenuItem key={area.id} value={area.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: 'primary.main' 
                        }} 
                      />
                      {area.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Add Table Button */}
            <FlagGate flag="tables.showAddTable">
              <Button
                variant="contained"
                startIcon={<Add fontSize={isMobile ? "small" : "medium"} />}
                onClick={onAddTable}
                size={isMobile ? "small" : "medium"}
                sx={{
                  borderRadius: 1,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.75, sm: 0.75 },
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  boxShadow: 'none',
                  flex: { xs: 1, sm: 'none' },
                  minWidth: { xs: 'auto', sm: 120 },
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {isMobile ? 'Add' : 'Add Table'}
              </Button>
            </FlagGate>
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        {filteredTables.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: { xs: 1, sm: 4 } }}>
            <Box
              sx={{
                width: { xs: 64, sm: 80 },
                height: { xs: 64, sm: 80 },
                borderRadius: '50%',
                backgroundColor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: { xs: 2, sm: 3 }
              }}
            >
              <TableRestaurant sx={{ fontSize: { xs: 32, sm: 40 }, color: 'text.secondary' }} />
            </Box>
            
            <Typography variant="h6" fontWeight="600" gutterBottom color="text.primary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              {selectedArea === 'all' ? 'No Tables Yet' : 'No Tables in This Area'}
            </Typography>
            
            <Typography variant="body1" sx={{ mb: { xs: 3, sm: 4 }, color: 'text.secondary', maxWidth: '500px', mx: 'auto', fontSize: { xs: '0.8rem', sm: '1rem' }, px: { xs: 1, sm: 0 } }}>
              {selectedArea === 'all' 
                ? 'Start building your restaurant layout by adding your first table. You can organize tables into different seating areas for better management.'
                : `No tables found in "${areas.find(a => a.id === selectedArea)?.name || 'this area'}". Add tables to this area or select a different area to view existing tables.`
              }
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add fontSize={isMobile ? "small" : "medium"} />}
              onClick={onAddTable}
              size={isMobile ? "medium" : "large"}
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                borderRadius: 1,
                fontWeight: 600,
                px: { xs: 3, sm: 4 },
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.8rem', sm: '1rem' },
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 8px 25px rgba(25, 118, 210, 0.4)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {selectedArea === 'all' ? (isMobile ? 'Add First Table' : 'Create Your First Table') : (isMobile ? 'Add Table' : 'Add Table to Area')}
            </Button>
          </Box>
        ) : (
          <List sx={{ p: 0, m: 0 }}>
            {filteredTables.map((table, index) => (
              <React.Fragment key={table.id}>
                <ListItem
                  sx={{
                    py: { xs: 1, sm: 1.5 },
                    px: 0,
                    transition: 'all 0.2s ease-in-out',
                    opacity: table.isActive ? 1 : 0.7,
                    '&:hover': {
                      backgroundColor: 'grey.50',
                      transform: { xs: 'none', sm: 'translateX(4px)' },
                      borderRadius: 1
                    }
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 3 }} sx={{ width: '100%' }}>
                    {/* Table Avatar with Status */}
                    <Box sx={{ position: 'relative', flexShrink: 0 }}>
                      <Avatar
                        sx={{
                          width: { xs: 48, sm: 64 },
                          height: { xs: 48, sm: 64 },
                          backgroundColor: 'primary.main',
                          border: { xs: '2px solid', sm: '3px solid' },
                          borderColor: 'grey.100',
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          fontWeight: 700,
                          color: 'white'
                        }}
                      >
                        {table.table_number}
                      </Avatar>
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: -2,
                          right: -2,
                          width: { xs: 16, sm: 20 },
                          height: { xs: 16, sm: 20 },
                          borderRadius: '50%',
                          backgroundColor: 'primary.main',
                          border: '2px solid white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Box sx={{ width: { xs: 6, sm: 8 }, height: { xs: 6, sm: 8 }, borderRadius: '50%', backgroundColor: 'white' }} />
                      </Box>
                    </Box>

                    {/* Table Info */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 0.5, sm: 1 }} sx={{ mb: { xs: 0.75, sm: 1 } }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="700" 
                          sx={{ color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
                          Table {table.table_number}
                        </Typography>
                        <Chip
                          label={getAreaName(table.location || '')}
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 20, sm: 24 }
                          }}
                        />
                      </Stack>
                      
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 1 }} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: { xs: 0.5, sm: 1 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <People sx={{ fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                            {table.capacity} people
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {React.cloneElement(getStatusIcon(table.table_status || table.status), { 
                            sx: { fontSize: { xs: 14, sm: 16 }, color: 'text.secondary' }
                          })}
                          <Chip 
                            label={(table.table_status || table.status).charAt(0).toUpperCase() + (table.table_status || table.status).slice(1)}
                            size="small"
                            color={getStatusColor(table.table_status || table.status) as any}
                            variant="outlined"
                            sx={{
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 20, sm: 24 }
                            }}
                          />
                        </Box>
                      </Stack>

                      {table.description && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: 'text.secondary',
                            fontSize: { xs: '0.75rem', sm: '0.85rem' },
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: { xs: 'none', sm: 'block' }
                          }}
                        >
                          {table.description}
                        </Typography>
                      )}
                    </Box>

                    {/* Actions */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.75, sm: 1 }} sx={{ flexShrink: 0 }}>
                      <Tooltip title={table.isActive ? 'Deactivate' : 'Activate'}>
                        <IconButton 
                          size={isMobile ? "small" : "medium"} 
                          onClick={() => onToggleTableStatus(table.id)}
                          sx={{ 
                            backgroundColor: 'grey.100',
                            color: table.isActive ? 'success.main' : 'text.disabled',
                            minWidth: 44,
                            minHeight: 44,
                            '&:hover': { 
                              backgroundColor: table.isActive ? 'success.50' : 'grey.200',
                              transform: { xs: 'none', sm: 'scale(1.05)' }
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          {table.isActive ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Generate QR Code">
                        <IconButton 
                          size={isMobile ? "small" : "medium"} 
                          onClick={() => onGenerateQR(table.id)}
                          sx={{ 
                            backgroundColor: 'grey.100',
                            color: 'text.secondary',
                            minWidth: 44,
                            minHeight: 44,
                            display: { xs: 'none', sm: 'inline-flex' },
                            '&:hover': { 
                              backgroundColor: 'primary.50',
                              color: 'primary.main',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <QrCode fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Print QR Code">
                        <IconButton 
                          size={isMobile ? "small" : "medium"} 
                          onClick={() => onPrintQR(table.id)}
                          sx={{ 
                            backgroundColor: 'grey.100',
                            color: 'text.secondary',
                            minWidth: 44,
                            minHeight: 44,
                            display: { xs: 'none', sm: 'inline-flex' },
                            '&:hover': { 
                              backgroundColor: 'secondary.50',
                              color: 'secondary.main',
                              transform: 'scale(1.05)'
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                        >
                          <Print fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      
                      <FlagGate flag="tables.showEditTable">
                        <Tooltip title="Edit Table">
                          <IconButton 
                            size={isMobile ? "small" : "medium"} 
                            onClick={() => onEditTable(table)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                              minWidth: 44,
                              minHeight: 44,
                              '&:hover': { 
                                backgroundColor: 'warning.50',
                                color: 'warning.main',
                                transform: { xs: 'none', sm: 'scale(1.05)' }
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </FlagGate>
                      
                      <FlagGate flag="tables.showDeleteTable">
                        <Tooltip title="Delete Table">
                          <IconButton 
                            size={isMobile ? "small" : "medium"} 
                            onClick={() => onDeleteTable(table.id)}
                            sx={{ 
                              backgroundColor: 'grey.100',
                              color: 'text.secondary',
                              minWidth: 44,
                              minHeight: 44,
                              display: { xs: 'none', sm: 'inline-flex' },
                              '&:hover': { 
                                backgroundColor: 'error.50',
                                color: 'error.main',
                                transform: 'scale(1.05)'
                              },
                              transition: 'all 0.2s ease-in-out'
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </FlagGate>
                    </Stack>
                  </Stack>
                </ListItem>
                {index < filteredTables.length - 1 && (
                  <Divider sx={{ 
                    borderColor: 'grey.200',
                    mx: 0
                  }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default TablesGrid;