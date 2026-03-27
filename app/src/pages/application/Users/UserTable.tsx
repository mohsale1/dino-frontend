/**
 * UserTable Component - Clean Professional Design
 * 
 * Display users in a clean, modern table
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

interface UserTableProps {
  users: any[];
  page: number;
  rowsPerPage: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onEdit: (user: any) => void;
  onDelete: (userId: string) => void;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'superadmin':
      case 'super_admin':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      case 'admin':
        return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
      case 'operator':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
    }
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f9fafb' }}>
              <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                User
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                Phone
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}>
                Status
              </TableCell>
              <TableCell 
                align="right" 
                sx={{ fontWeight: 600, color: '#374151', fontSize: '0.875rem', borderBottom: '1px solid #e5e7eb' }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8, borderBottom: 'none' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ color: '#6b7280', fontWeight: 600 }}>
                      No users found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                      Try adjusting your filters or search criteria
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((user) => {
                const roleColors = getRoleColor(user.role?.name);
                return (
                  <TableRow 
                    key={user.id} 
                    sx={{
                      '&:hover': {
                        backgroundColor: '#f9fafb',
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: '#1a1a1a',
                            width: 40,
                            height: 40,
                            fontSize: '0.875rem',
                            fontWeight: 600,
                          }}
                        >
                          {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="subtitle2" 
                            sx={{ 
                              fontWeight: 600,
                              color: '#1a1a1a',
                              fontSize: '0.9375rem',
                            }}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        {user.phone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Chip
                        label={user.role?.displayName || user.role?.name || 'Unknown'}
                        size="small"
                        sx={{
                          backgroundColor: roleColors.bg,
                          color: roleColors.color,
                          border: `1px solid ${roleColors.border}`,
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        onClick={() => onToggleStatus(user.id, user.isActive)}
                        sx={{
                          backgroundColor: user.isActive ? '#dcfce7' : '#fee2e2',
                          color: user.isActive ? '#166534' : '#991b1b',
                          border: user.isActive ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: user.isActive ? '#bbf7d0' : '#fecaca',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #f3f4f6' }}>
                      <Tooltip title="Edit user">
                        <IconButton 
                          size="small" 
                          onClick={() => onEdit(user)}
                          sx={{
                            color: '#6b7280',
                            '&:hover': {
                              backgroundColor: '#f3f4f6',
                              color: '#1a1a1a',
                            },
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete user">
                        <IconButton 
                          size="small" 
                          onClick={() => onDelete(user.id)}
                          sx={{
                            color: '#6b7280',
                            '&:hover': {
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={users.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          borderTop: '1px solid #e5e7eb',
          '& .MuiTablePagination-toolbar': {
            color: '#6b7280',
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.875rem',
          },
        }}
      />
    </Box>
  );
};

export default UserTable;