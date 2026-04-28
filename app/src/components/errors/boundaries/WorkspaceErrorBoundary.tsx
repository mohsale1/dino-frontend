import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import LockOutlined from '@mui/icons-material/LockOutlined';
import BusinessOutlined from '@mui/icons-material/BusinessOutlined';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { useWorkspace } from '../../../contexts/application/Workspace';
import { useAuth } from '../../../contexts/common/Auth';

interface WorkspaceErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const WorkspaceErrorBoundary = ({
  children,
  fallback,
}: WorkspaceErrorBoundaryProps): React.ReactElement => {
  const { workspaces, workspacesLoading, currentWorkspace } = useWorkspace();
  const { isAuthenticated } = useAuth();

  // If not authenticated, show authentication message
  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1.5}
        p={2}
        borderRadius={1.5}
        border="1px solid rgba(245,158,11,0.2)"
        bgcolor="rgba(245,158,11,0.08)"
      >
        <Box
          width={36}
          height={36}
          borderRadius={1.5}
          bgcolor="rgba(245,158,11,0.14)"
          border="1px solid rgba(245,158,11,0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <LockOutlined sx={{ fontSize: 18, color: '#f59e0b' }} />
        </Box>
        <Box flex={1}>
          <Typography
            fontWeight={700}
            fontSize="0.875rem"
            color="#1C1C1E"
            lineHeight={1.3}
          >
            Authentication Required
          </Typography>
          <Typography
            fontSize="0.8rem"
            color="#64748b"
            lineHeight={1.6}
            mt={0.4}
          >
            Please log in to access workspace features.
          </Typography>
        </Box>
      </Box>
    );
  }

  // If loading workspaces, show loading state
  if (workspacesLoading) {
    return (
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1.5}
        p={2}
        borderRadius={1.5}
        border="1px solid rgba(25,118,210,0.15)"
        bgcolor="rgba(25,118,210,0.06)"
      >
        <Box
          width={36}
          height={36}
          borderRadius={1.5}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <CircularProgress size={18} sx={{ color: '#1976D2' }} />
        </Box>
        <Box flex={1}>
          <Typography
            fontWeight={700}
            fontSize="0.875rem"
            color="#1C1C1E"
            lineHeight={1.3}
          >
            Loading Workspace
          </Typography>
          <Typography
            fontSize="0.8rem"
            color="#64748b"
            lineHeight={1.6}
            mt={0.4}
          >
            Please wait while we load your workspace data...
          </Typography>
        </Box>
      </Box>
    );
  }

  // If no workspaces found, show appropriate message
  if (!workspaces || workspaces.length === 0) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1.5}
        p={2}
        borderRadius={1.5}
        border="1px solid #e0e0e0"
        bgcolor="#f8fafc"
      >
        <Box
          width={36}
          height={36}
          borderRadius={1.5}
          bgcolor="#f1f5f9"
          border="1px solid #e0e0e0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <BusinessOutlined sx={{ fontSize: 18, color: '#64748b' }} />
        </Box>
        <Box flex={1}>
          <Typography
            fontWeight={700}
            fontSize="0.875rem"
            color="#1C1C1E"
            lineHeight={1.3}
          >
            No Workspace Found
          </Typography>
          <Typography
            fontSize="0.8rem"
            color="#64748b"
            lineHeight={1.6}
            mt={0.4}
          >
            You need to select a workspace to manage users. Please select or
            create a workspace to continue.
          </Typography>
          <Button
            variant="contained"
            onClick={() => (window.location.href = '/register')}
            sx={{
              mt: 1,
              bgcolor: '#1976D2',
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              px: 2,
              py: 0.625,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#1565C0',
                boxShadow: 'none',
              },
            }}
          >
            Create Workspace
          </Button>
        </Box>
      </Box>
    );
  }

  // If no current workspace selected, show selection message
  if (!currentWorkspace) {
    return (
      <Box
        display="flex"
        alignItems="flex-start"
        gap={1.5}
        p={2}
        borderRadius={1.5}
        border="1px solid rgba(245,158,11,0.2)"
        bgcolor="rgba(245,158,11,0.08)"
      >
        <Box
          width={36}
          height={36}
          borderRadius={1.5}
          bgcolor="rgba(245,158,11,0.14)"
          border="1px solid rgba(245,158,11,0.2)"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <WarningAmber sx={{ fontSize: 18, color: '#f59e0b' }} />
        </Box>
        <Box flex={1}>
          <Typography
            fontWeight={700}
            fontSize="0.875rem"
            color="#1C1C1E"
            lineHeight={1.3}
          >
            No Workspace Selected
          </Typography>
          <Typography
            fontSize="0.8rem"
            color="#64748b"
            lineHeight={1.6}
            mt={0.4}
          >
            Please select a workspace to continue.
          </Typography>
          <Select
            size="small"
            displayEmpty
            defaultValue=""
            onChange={(e: SelectChangeEvent) => {
              if (e.target.value) {
                // This would trigger workspace selection
              }
            }}
            sx={{
              mt: 1,
              minWidth: 200,
              borderRadius: 1.5,
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e0e0e0',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#f59e0b',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#1976D2',
              },
            }}
          >
            <MenuItem value="" disabled>
              Select a workspace...
            </MenuItem>
            {workspaces.map((workspace) => (
              <MenuItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>
    );
  }

  // All good, render children
  return <>{children}</> as React.ReactElement;
};

export default WorkspaceErrorBoundary;
