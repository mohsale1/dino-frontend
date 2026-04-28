import React from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  alpha,
  keyframes,
} from '@mui/material';
import {
  HourglassTop,
  BlockOutlined,
  HelpOutlineOutlined,
  Refresh,
  LogoutOutlined,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/common/Auth';
import { useWorkspaceApproval } from '../../contexts/application/WorkspaceApproval';
import { useNavigate } from 'react-router-dom';
import DinoLogo from '../../components/ui/DinoLogo';
import { APP_CONFIG } from '../../constants/app';

// ── Animations ─────────────────────────────────────────────────────────────────
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.6; transform: scale(0.92); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

// ── Config per status ──────────────────────────────────────────────────────────
type StatusKey = 'pending' | 'rejected' | 'no_request' | 'loading';

interface StatusConfig {
  icon: React.ReactNode;
  accentColor: string;
  accentBg: string;
  accentBorder: string;
  badge: string;
  title: string;
  subtitle: string;
  body: string;
  animated?: boolean;
}

const STATUS_CONFIG: Record<StatusKey, StatusConfig> = {
  loading: {
    icon: <CircularProgress size={26} sx={{ color: '#1976D2' }} />,
    accentColor: '#1976D2',
    accentBg: 'rgba(25,118,210,0.08)',
    accentBorder: 'rgba(25,118,210,0.2)',
    badge: 'Checking',
    title: 'Verifying access...',
    subtitle: 'Please wait a moment',
    body: 'We are checking your workspace approval status.',
  },
  pending: {
    icon: <HourglassTop sx={{ fontSize: 26, color: '#f59e0b' }} />,
    accentColor: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    accentBorder: 'rgba(245,158,11,0.2)',
    badge: 'Pending Review',
    title: 'Your request is under review',
    subtitle: 'Hang tight — we will notify you once approved',
    body: 'Your workspace registration has been received and is currently being reviewed by our team. This usually takes 1–2 business days. You will be able to access the portal as soon as your request is approved.',
    animated: true,
  },
  rejected: {
    icon: <BlockOutlined sx={{ fontSize: 26, color: '#ef4444' }} />,
    accentColor: '#ef4444',
    accentBg: 'rgba(239,68,68,0.08)',
    accentBorder: 'rgba(239,68,68,0.2)',
    badge: 'Request Rejected',
    title: 'Access request was rejected',
    subtitle: 'Your workspace request could not be approved',
    body: 'Unfortunately your workspace registration request has been rejected. Please review the reason below and contact our support team if you believe this is a mistake or would like to reapply.',
  },
  no_request: {
    icon: <HelpOutlineOutlined sx={{ fontSize: 26, color: '#64748b' }} />,
    accentColor: '#64748b',
    accentBg: 'rgba(100,116,139,0.08)',
    accentBorder: 'rgba(100,116,139,0.2)',
    badge: 'No Request Found',
    title: 'No approval request found',
    subtitle: 'Your workspace has not submitted a request yet',
    body: 'We could not find an approval request associated with your workspace. Please contact support or re-register your workspace to get started.',
  },
};

// ── Component ──────────────────────────────────────────────────────────────────
const WorkspaceApprovalPage: React.FC = () => {
  const { logout } = useAuth();
  const { approvalData, approvalStatus, isLoading, refresh } = useWorkspaceApproval();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Determine which config to show
  const statusKey: StatusKey = (() => {
    if (isLoading) return 'loading';
    if (approvalStatus === 'pending')  return 'pending';
    if (approvalStatus === 'rejected') return 'rejected';
    return 'no_request';
  })();

  const cfg = STATUS_CONFIG[statusKey];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f8fafc',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: 4,
      }}
    >
      {/* ── Card ── */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          bgcolor: '#ffffff',
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          overflow: 'hidden',
          animation: `${fadeUp} 0.45s ease-out both`,
        }}
      >
        {/* Accent top strip */}
        <Box sx={{ height: 4, bgcolor: cfg.accentColor, transition: 'background-color 0.3s ease' }} />

        {/* Body */}
        <Box sx={{ px: { xs: 3, sm: 4 }, pt: 3.5, pb: 3 }}>

          {/* Logo + brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3.5 }}>
            <DinoLogo size={26} animated={false} />
            <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: '#1C1C1E', letterSpacing: '-0.02em' }}>
              {APP_CONFIG.NAME}
            </Typography>
          </Box>

          {/* Icon box */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: cfg.accentBg,
              border: `1px solid ${cfg.accentBorder}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2.5,
              ...(cfg.animated && {
                animation: `${pulse} 2.4s ease-in-out infinite`,
              }),
            }}
          >
            {cfg.icon}
          </Box>

          {/* Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              bgcolor: cfg.accentBg,
              border: `1px solid ${cfg.accentBorder}`,
              borderRadius: '999px',
              px: 1.25,
              py: 0.35,
              mb: 1.5,
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: cfg.accentColor,
                mr: 0.75,
                flexShrink: 0,
                ...(cfg.animated && { animation: `${pulse} 1.8s ease-in-out infinite` }),
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: cfg.accentColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              {cfg.badge}
            </Typography>
          </Box>

          {/* Title */}
          <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#1C1C1E', lineHeight: 1.3, mb: 0.5 }}>
            {cfg.title}
          </Typography>

          {/* Subtitle */}
          <Typography sx={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500, mb: 2 }}>
            {cfg.subtitle}
          </Typography>

          {/* Body */}
          <Typography sx={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.75, mb: 2.5 }}>
            {cfg.body}
          </Typography>

          {/* Rejection reason box */}
          {statusKey === 'rejected' && approvalData?.rejection_reason && (
            <Box
              sx={{
                bgcolor: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: 1.5,
                px: 2,
                py: 1.5,
                mb: 2.5,
              }}
            >
              <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5 }}>
                Reason
              </Typography>
              <Typography sx={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.65 }}>
                {approvalData.rejection_reason}
              </Typography>
            </Box>
          )}

          {/* Reviewed at */}
          {approvalData?.reviewed_at && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                mb: 2.5,
                px: 1.5,
                py: 1,
                bgcolor: '#f8fafc',
                border: '1px solid #e0e0e0',
                borderRadius: 1.5,
              }}
            >
              <Typography sx={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>
                Reviewed on:
              </Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                {new Date(approvalData.reviewed_at).toLocaleDateString('en-IN', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </Typography>
            </Box>
          )}

          {/* Divider */}
          <Box sx={{ borderTop: '1px solid #f1f5f9', mb: 2.5 }} />

          {/* Actions */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {/* Refresh — shown for pending / no_request */}
            {(statusKey === 'pending' || statusKey === 'no_request') && (
              <Button
                variant="contained"
                startIcon={<Refresh sx={{ fontSize: 17 }} />}
                onClick={refresh}
                disabled={isLoading}
                disableElevation
                fullWidth
                sx={{
                  bgcolor: '#1976D2',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  borderRadius: 1.5,
                  py: 0.875,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#1565C0', boxShadow: 'none' },
                  '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
                }}
              >
                {isLoading ? 'Checking...' : 'Check Status'}
              </Button>
            )}

            {/* Contact support — shown for rejected / no_request */}
            {(statusKey === 'rejected' || statusKey === 'no_request') && (
              <Button
                variant="outlined"
                component="a"
                href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
                fullWidth
                sx={{
                  borderColor: '#e0e0e0',
                  color: '#64748b',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  borderRadius: 1.5,
                  py: 0.875,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { borderColor: '#1976D2', color: '#1976D2', bgcolor: 'transparent', boxShadow: 'none' },
                }}
              >
                Contact Support
              </Button>
            )}

            {/* Logout */}
            <Button
              variant="text"
              startIcon={<LogoutOutlined sx={{ fontSize: 16 }} />}
              onClick={handleLogout}
              fullWidth
              sx={{
                color: '#94a3b8',
                fontWeight: 600,
                fontSize: '0.8rem',
                borderRadius: 1.5,
                py: 0.75,
                textTransform: 'none',
                '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.05) },
              }}
            >
              Sign out
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Typography sx={{ mt: 3, fontSize: '0.72rem', color: '#cbd5e1' }}>
        {APP_CONFIG.copyright()}
      </Typography>
    </Box>
  );
};

export default WorkspaceApprovalPage;
