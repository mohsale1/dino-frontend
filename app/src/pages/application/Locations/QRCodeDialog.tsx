/**
 * QRCodeDialog
 *
 * Shows the QR code for a location (table). Fetches the QR image from the API,
 * displays table details, the encoded menu URL, and provides download / print actions.
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  QrCode2 as QrCode2Icon,
  People as PeopleIcon,
  CheckCircle,
  Cancel,
  Schedule,
  Build,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { locationService } from '../../../features/locations/services/locationService';
import type { ServiceLocation, LocationStatus } from '../../../features/locations/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface QRCodeDialogProps {
  open: boolean;
  location: ServiceLocation | null;
  areaName?: string;
  organizationId: string;
  onClose: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusConfig = (status: LocationStatus) => {
  const configs: Record<LocationStatus, { label: string; icon: React.ReactElement; color: string; bg: string; border: string }> = {
    available: { label: 'Available', icon: <CheckCircle sx={{ fontSize: 14 }} />, color: '#059669', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    occupied:  { label: 'Occupied',  icon: <Cancel     sx={{ fontSize: 14 }} />, color: '#dc2626', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.2)'   },
    reserved:  { label: 'Reserved',  icon: <Schedule   sx={{ fontSize: 14 }} />, color: '#d97706', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)'  },
    maintenance:{ label: 'Maintenance', icon: <Build   sx={{ fontSize: 14 }} />, color: '#475569', bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.2)' },
  };
  return configs[status];
};

// ─── Component ────────────────────────────────────────────────────────────────

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  location,
  areaName,
  organizationId,
  onClose,
}) => {
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // The public menu URL encoded in the QR code
  const menuUrl = location
    ? `${window.location.origin}/${organizationId}/${location.id}/menu`
    : '';

  const fetchQRCode = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setQrImageUrl(null);

    try {
      // generateQRCode returns the QR code URL string from the API
      const url = await locationService.generateQRCode(location.id);
      if (url) {
        setQrImageUrl(url);
      } else {
        // Fallback: build a Google Charts QR URL client-side
        const encoded = encodeURIComponent(menuUrl);
        setQrImageUrl(
          `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=10`
        );
      }
    } catch (err: any) {
      // Fallback to a client-side QR generator so the dialog is still useful
      const encoded = encodeURIComponent(menuUrl);
      setQrImageUrl(
        `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&margin=10`
      );
    } finally {
      setLoading(false);
    }
  }, [location, menuUrl]);

  useEffect(() => {
    if (open && location) {
      fetchQRCode();
    }
    // Reset when closed
    if (!open) {
      setQrImageUrl(null);
      setError(null);
      setCopied(false);
    }
  }, [open, location]);

  const handleDownload = () => {
    if (!qrImageUrl || !location) return;
    const link = document.createElement('a');
    link.href = qrImageUrl;
    link.download = `qr-${location.name || location.identifier}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handlePrint = () => {
    if (!qrImageUrl || !location) return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${location.name || location.identifier}</title>
          <style>
            body { margin: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui, sans-serif; }
            .container { text-align: center; padding: 32px; }
            img { width: 280px; height: 280px; display: block; margin: 0 auto 16px; }
            h2 { margin: 0 0 4px; font-size: 20px; color: #0f172a; }
            p  { margin: 0; font-size: 13px; color: #64748b; }
            .url { margin-top: 12px; font-size: 11px; color: #94a3b8; word-break: break-all; max-width: 280px; }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrImageUrl}" alt="QR Code" />
            <h2>${location.name || location.identifier}</h2>
            ${areaName ? `<p>${areaName}</p>` : ''}
            <p class="url">${menuUrl}</p>
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    win.document.close();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard not available — silently ignore
    }
  };

  if (!location) return null;

  const statusConfig = getStatusConfig(location.status);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 3,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f1f5f9',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QrCode2Icon sx={{ fontSize: 20, color: 'white' }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="#0f172a" lineHeight={1.2}>
              QR Code
            </Typography>
            <Typography variant="caption" color="#64748b">
              Scan to open menu
            </Typography>
          </Box>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a', bgcolor: '#f8fafc' } }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 0 }}>
        {/* Location Info */}
        <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
          <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 0.5 }}>
            {location.name || location.identifier}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {areaName && (
              <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.8125rem' }}>
                {areaName}
              </Typography>
            )}
            {location.capacity && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 14, color: '#94a3b8' }} />
                <Typography variant="body2" color="#64748b" sx={{ fontSize: '0.8125rem' }}>
                  {location.capacity} seats
                </Typography>
              </Box>
            )}
          </Stack>

          <Box
            sx={{
              mt: 1.5,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.25,
              py: 0.5,
              borderRadius: 1,
              bgcolor: statusConfig.bg,
              border: `1px solid ${statusConfig.border}`,
            }}
          >
            {statusConfig.icon}
            <Typography variant="caption" fontWeight={600} sx={{ color: statusConfig.color }}>
              {statusConfig.label}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        {/* QR Code */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: 3,
            py: 3,
            bgcolor: '#f8fafc',
          }}
        >
          {loading && (
            <Box sx={{ py: 5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={36} thickness={4} sx={{ color: '#0f172a' }} />
              <Typography variant="body2" color="#64748b">
                Generating QR code...
              </Typography>
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ width: '100%', borderRadius: 1.5 }}>
              {error}
            </Alert>
          )}

          {!loading && qrImageUrl && (
            <Box
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <img
                src={qrImageUrl}
                alt={`QR code for ${location.name || location.identifier}`}
                style={{ width: 220, height: 220, display: 'block' }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        {/* Menu URL */}
        <Box sx={{ px: 3, py: 2 }}>
          <Typography variant="caption" fontWeight={600} color="#94a3b8" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Menu URL
          </Typography>
          <Box
            sx={{
              mt: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1.5,
              py: 1,
              bgcolor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                flex: 1,
                color: '#475569',
                fontFamily: 'monospace',
                fontSize: '0.75rem',
                wordBreak: 'break-all',
              }}
            >
              {menuUrl}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
              <IconButton
                size="small"
                onClick={handleCopyUrl}
                sx={{
                  flexShrink: 0,
                  color: copied ? '#059669' : '#94a3b8',
                  '&:hover': { color: '#0f172a', bgcolor: '#f1f5f9' },
                }}
              >
                <CopyIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#f1f5f9' }} />

        {/* Actions */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            gap: 1.5,
          }}
        >
          <Box
            component="button"
            onClick={handleDownload}
            disabled={!qrImageUrl || loading}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1.25,
              px: 2,
              border: '1px solid #e2e8f0',
              borderRadius: 1.5,
              bgcolor: 'white',
              color: '#0f172a',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              '&:hover:not(:disabled)': {
                bgcolor: '#f8fafc',
                borderColor: '#cbd5e1',
              },
              '&:disabled': {
                opacity: 0.4,
                cursor: 'not-allowed',
              },
            }}
          >
            <DownloadIcon sx={{ fontSize: 17 }} />
            Download
          </Box>
          <Box
            component="button"
            onClick={handlePrint}
            disabled={!qrImageUrl || loading}
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              py: 1.25,
              px: 2,
              border: 'none',
              borderRadius: 1.5,
              bgcolor: '#0f172a',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
              '&:hover:not(:disabled)': {
                bgcolor: '#1e293b',
              },
              '&:disabled': {
                opacity: 0.4,
                cursor: 'not-allowed',
              },
            }}
          >
            <PrintIcon sx={{ fontSize: 17 }} />
            Print
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;
