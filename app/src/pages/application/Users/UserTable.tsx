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
        return { bg: 'rgba(0,166,202,0.08)', color: '#00A6CA', border: 'rgba(0,166,202,0.2)' };
    }
  };

  const paginatedUsers = users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0' }}>
                User
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0', display: { xs: 'none', sm: 'table-cell' } }}>
                Email
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0', display: { xs: 'none', sm: 'table-cell' } }}>
                Phone
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0' }}>
                Role
              </TableCell>
              <TableCell sx={{ fontWeight: 600, color: '#666666', fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0' }}>
                Status
              </TableCell>
              <TableCell
                align="right"
                sx={{ fontWeight: 600, color: '#666666', fontSize: '0.875rem', borderBottom: '1px solid #e0e0e0' }}
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
                    <Typography variant="h6" sx={{ color: '#666666', fontWeight: 600 }}>
                      No users found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#999999' }}>
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
                        backgroundColor: '#f8fafc',
                      },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell sx={{ borderBottom: '1px solid #f8fafc' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: '#00A6CA',
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
                              color: '#1C1C1E',
                              fontSize: '0.9375rem',
                            }}
                          >
                            {user.firstName} {user.lastName}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f8fafc', display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                        {user.email}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f8fafc', display: { xs: 'none', sm: 'table-cell' } }}>
                      <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.875rem' }}>
                        {user.phone || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: '1px solid #f8fafc' }}>
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
                    <TableCell sx={{ borderBottom: '1px solid #f8fafc' }}>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        onClick={() => onToggleStatus(user.id, user.isActive)}
                        sx={{
                          backgroundColor: user.isActive ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                          color: user.isActive ? '#059669' : '#dc2626',
                          border: user.isActive ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(239,68,68,0.2)',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                          height: 24,
                          cursor: 'pointer',
                          '&:hover': {
                            backgroundColor: user.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderBottom: '1px solid #f8fafc' }}>
                      <Tooltip title="Edit user">
                        <IconButton
                          size="small"
                          onClick={() => onEdit(user)}
                          sx={{
                            color: '#666666',
                            '&:hover': {
                              backgroundColor: 'rgba(0,166,202,0.08)',
                              color: '#00A6CA',
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
                            color: '#666666',
                            '&:hover': {
                              backgroundColor: 'rgba(239,68,68,0.08)',
                              color: '#dc2626',
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
          borderTop: '1px solid #e0e0e0',
          '& .MuiTablePagination-toolbar': {
            color: '#666666',
            flexWrap: 'wrap',
            px: { xs: 1, sm: 2 },
          },
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: '0.875rem',
          },
          '& .MuiTablePagination-selectLabel': {
            display: { xs: 'none', sm: 'block' },
          },
          '& .MuiTablePagination-select': {
            display: { xs: 'none', sm: 'block' },
          },
        }}
      />
    </Box>
  );
};

export default UserTable;
