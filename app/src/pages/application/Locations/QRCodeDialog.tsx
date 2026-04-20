/**
 * QRCodeDialog
 *
 * Full-featured QR code viewer with:
 *  - 6 QR card styles (Classic, Rounded, Dark, Branded, Minimal, Framed)
 *  - Live in-dialog preview that reflects the selected style
 *  - 5 print layouts (Single, 2-Up, 4-Up, Label, Poster)
 *  - Download PNG / PDF, Print with chosen style + layout
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
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Close as CloseIcon,
  Print as PrintIcon,
  QrCode2 as QrCode2Icon,
  People as PeopleIcon,
  CheckCircle,
  Cancel,
  Schedule,
  Build,
  ContentCopy as CopyIcon,
  CheckCircleOutline as CheckedIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  ViewModule as GridIcon,
  CropPortrait as SingleIcon,
  CreditCard as LabelIcon,
  Article as PosterIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { locationService } from '../../../features/locations/services/locationService';
import type { ServiceLocation, LocationStatus } from '../../../features/locations/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

type PrintLayout = 'single' | '2up' | '4up' | 'label' | 'poster';
type QRStyle     = 'classic' | 'rounded' | 'dark' | 'branded' | 'minimal' | 'framed';

interface QRCodeDialogProps {
  open: boolean;
  location: ServiceLocation | null;
  areaName?: string;
  organizationId: string;
  onClose: () => void;
}

// ─── Status config ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  LocationStatus,
  { label: string; icon: React.ReactElement; color: string; bg: string; border: string }
> = {
  available:   { label: 'Available',   icon: <CheckCircle sx={{ fontSize: 12 }} />, color: '#059669', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.25)'  },
  occupied:    { label: 'Occupied',    icon: <Cancel     sx={{ fontSize: 12 }} />, color: '#dc2626', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)'   },
  reserved:    { label: 'Reserved',    icon: <Schedule   sx={{ fontSize: 12 }} />, color: '#d97706', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)'  },
  maintenance: { label: 'Maintenance', icon: <Build      sx={{ fontSize: 12 }} />, color: '#475569', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.25)' },
};

// ─── QR Style definitions ───────────────────────────────────────────────────────

interface QRStyleDef {
  value: QRStyle;
  label: string;
  desc: string;
  // Preview wrapper styles (applied around the <img> in the dialog)
  previewWrap: React.CSSProperties;
  previewImg: React.CSSProperties;
  // CSS string injected into print HTML
  printCss: string;
  // HTML wrapper template — receives {qrUrl} placeholder
  printWrap: (qrUrl: string) => string;
}

const QR_STYLES: QRStyleDef[] = [
  {
    value: 'classic',
    label: 'Classic',
    desc: 'Clean white card',
    previewWrap: { background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    previewImg:  { borderRadius: 4 },
    printCss: `.qr-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:16px; display:inline-block; box-shadow:0 2px 8px rgba(0,0,0,0.06); } .qr-wrap img { border-radius:4px; display:block; }`,
    printWrap: (u) => `<div class="qr-wrap"><img src="${u}" /></div>`,
  },
  {
    value: 'rounded',
    label: 'Rounded',
    desc: 'Soft corners',
    previewWrap: { background: '#fff', borderRadius: 24, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    previewImg:  { borderRadius: 16 },
    printCss: `.qr-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:24px; padding:18px; display:inline-block; box-shadow:0 4px 16px rgba(0,0,0,0.08); } .qr-wrap img { border-radius:16px; display:block; }`,
    printWrap: (u) => `<div class="qr-wrap"><img src="${u}" /></div>`,
  },
  {
    value: 'dark',
    label: 'Dark',
    desc: 'Dark background',
    previewWrap: { background: '#0f172a', borderRadius: 14, padding: 18, boxShadow: '0 4px 24px rgba(15,23,42,0.35)' },
    previewImg:  { borderRadius: 8, filter: 'invert(1)' },
    printCss: `.qr-wrap { background:#0f172a; border-radius:14px; padding:18px; display:inline-block; box-shadow:0 4px 20px rgba(0,0,0,0.4); } .qr-wrap img { border-radius:8px; display:block; filter:invert(1); }`,
    printWrap: (u) => `<div class="qr-wrap"><img src="${u}" /></div>`,
  },
  {
    value: 'branded',
    label: 'Branded',
    desc: 'With Dino header',
    previewWrap: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
    previewImg:  { borderRadius: 0 },
    printCss: `.qr-wrap { background:#fff; border:1px solid #e2e8f0; border-radius:14px; overflow:hidden; display:inline-block; box-shadow:0 4px 16px rgba(0,0,0,0.08); } .qr-brand { background:linear-gradient(135deg,#0f172a,#312e81); padding:8px 16px; text-align:center; } .qr-brand span { color:#fff; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; } .qr-wrap img { display:block; padding:12px; }`,
    printWrap: (u) => `<div class="qr-wrap"><div class="qr-brand"><span>Dino</span></div><img src="${u}" /></div>`,
  },
  {
    value: 'minimal',
    label: 'Minimal',
    desc: 'No border',
    previewWrap: { background: 'transparent', padding: 8 },
    previewImg:  { borderRadius: 4 },
    printCss: `.qr-wrap { display:inline-block; padding:8px; } .qr-wrap img { border-radius:4px; display:block; }`,
    printWrap: (u) => `<div class="qr-wrap"><img src="${u}" /></div>`,
  },
  {
    value: 'framed',
    label: 'Framed',
    desc: 'Decorative frame',
    previewWrap: { background: '#fff', borderRadius: 12, padding: 14, border: '3px solid #0f172a', boxShadow: '4px 4px 0 #0f172a' },
    previewImg:  { borderRadius: 4 },
    printCss: `.qr-wrap { background:#fff; border-radius:12px; padding:14px; border:3px solid #0f172a; box-shadow:4px 4px 0 #0f172a; display:inline-block; } .qr-wrap img { border-radius:4px; display:block; }`,
    printWrap: (u) => `<div class="qr-wrap"><img src="${u}" /></div>`,
  },
];

// ─── Print layout config ────────────────────────────────────────────────────────

const PRINT_LAYOUTS: { value: PrintLayout; label: string; desc: string; icon: React.ReactElement }[] = [
  { value: 'single', label: 'Single', desc: '1 per page',       icon: <SingleIcon /> },
  { value: '2up',    label: '2-Up',   desc: '2 per page',       icon: <GridIcon />   },
  { value: '4up',    label: '4-Up',   desc: '4 per page',       icon: <GridIcon />   },
  { value: 'label',  label: 'Label',  desc: 'Credit-card size', icon: <LabelIcon />  },
  { value: 'poster', label: 'Poster', desc: 'Full A4 poster',   icon: <PosterIcon /> },
];

// ─── Print HTML builders ────────────────────────────────────────────────────────

const buildSingleHtml = (qrUrl: string, name: string, area: string, menuUrl: string, style: QRStyleDef) => `
<!DOCTYPE html><html><head><title>QR – ${name}</title>
<style>
  @page { size: A4; margin: 20mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #fff; }
  .card { text-align: center; padding: 40px; max-width: 380px; width: 100%; }
  .qr-wrap img { width: 260px; height: 260px; }
  ${style.printCss}
  h2 { font-size: 22px; font-weight: 800; color: #0f172a; margin: 20px 0 4px; }
  .area { font-size: 14px; color: #64748b; margin-bottom: 16px; }
  .divider { border: none; border-top: 1px solid #f1f5f9; margin: 16px 0; }
  .scan { font-size: 12px; color: #475569; font-weight: 600; margin-bottom: 8px; }
  .url { font-size: 10px; color: #94a3b8; word-break: break-all; font-family: monospace; }
</style></head><body>
<div class="card">
  ${style.printWrap(qrUrl)}
  <h2>${name}</h2>
  ${area ? `<p class="area">${area}</p>` : ''}
  <hr class="divider" />
  <p class="scan">Scan to view menu</p>
  <p class="url">${menuUrl}</p>
</div>
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;

const buildTwoUpHtml = (qrUrl: string, name: string, area: string, menuUrl: string, style: QRStyleDef) => {
  const card = `
    <div class="card">
      ${style.printWrap(qrUrl)}
      <h2>${name}</h2>
      ${area ? `<p class="area">${area}</p>` : ''}
      <p class="url">${menuUrl}</p>
    </div>`;
  return `
<!DOCTYPE html><html><head><title>QR – ${name}</title>
<style>
  @page { size: A4 landscape; margin: 15mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; gap: 24px; background: #fff; }
  .card { text-align: center; flex: 1; max-width: 340px; }
  .qr-wrap img { width: 200px; height: 200px; }
  ${style.printCss}
  h2 { font-size: 18px; font-weight: 800; color: #0f172a; margin: 14px 0 4px; }
  .area { font-size: 12px; color: #64748b; margin-bottom: 10px; }
  .url { font-size: 9px; color: #94a3b8; word-break: break-all; font-family: monospace; margin-top: 10px; }
</style></head><body>
${card}${card}
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;
};

const buildFourUpHtml = (qrUrl: string, name: string, area: string, menuUrl: string, style: QRStyleDef) => {
  const card = `
    <div class="card">
      ${style.printWrap(qrUrl)}
      <h2>${name}</h2>
      ${area ? `<p class="area">${area}</p>` : ''}
      <p class="url">${menuUrl}</p>
    </div>`;
  return `
<!DOCTYPE html><html><head><title>QR – ${name}</title>
<style>
  @page { size: A4; margin: 10mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap: 12px; height: 100vh; padding: 4px; background: #fff; }
  .card { text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .qr-wrap img { width: 160px; height: 160px; }
  ${style.printCss}
  h2 { font-size: 15px; font-weight: 800; color: #0f172a; margin: 10px 0 2px; }
  .area { font-size: 11px; color: #64748b; margin-bottom: 6px; }
  .url { font-size: 8px; color: #94a3b8; word-break: break-all; font-family: monospace; margin-top: 6px; }
</style></head><body>
${card}${card}${card}${card}
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;
};

const buildLabelHtml = (qrUrl: string, name: string, area: string, menuUrl: string, style: QRStyleDef) => `
<!DOCTYPE html><html><head><title>QR Label – ${name}</title>
<style>
  @page { size: 85.6mm 54mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; width: 85.6mm; height: 54mm; display: flex; align-items: center; padding: 3mm; gap: 3mm; background: #fff; }
  .qr-wrap img { width: 44mm; height: 44mm; }
  ${style.printCss}
  .info { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 1.5mm; overflow: hidden; }
  h2 { font-size: 12px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .area { font-size: 9px; color: #64748b; }
  .divider { border: none; border-top: 0.5px solid #e2e8f0; }
  .scan { font-size: 8px; color: #475569; font-weight: 600; }
  .url { font-size: 6.5px; color: #94a3b8; word-break: break-all; font-family: monospace; }
</style></head><body>
${style.printWrap(qrUrl)}
<div class="info">
  <h2>${name}</h2>
  ${area ? `<p class="area">${area}</p>` : ''}
  <hr class="divider" />
  <p class="scan">Scan to view menu</p>
  <p class="url">${menuUrl}</p>
</div>
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;

const buildPosterHtml = (qrUrl: string, name: string, area: string, menuUrl: string, style: QRStyleDef) => `
<!DOCTYPE html><html><head><title>QR Poster – ${name}</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; width: 210mm; min-height: 297mm; background: #0f172a; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20mm; }
  .inner { background: #fff; border-radius: 20px; padding: 48px 40px; text-align: center; width: 100%; max-width: 420px; }
  .qr-wrap img { width: 240px; height: 240px; }
  ${style.printCss}
  h1 { font-size: 30px; font-weight: 900; color: #0f172a; margin: 24px 0 6px; letter-spacing: -0.5px; }
  .area { font-size: 16px; color: #64748b; margin-bottom: 20px; }
  .divider { border: none; border-top: 1px solid #f1f5f9; margin: 20px 0; }
  .scan { font-size: 14px; color: #475569; font-weight: 700; margin-bottom: 10px; }
  .url { font-size: 9px; color: #94a3b8; word-break: break-all; font-family: monospace; }
  .footer { margin-top: 28px; font-size: 11px; color: rgba(255,255,255,0.35); letter-spacing: 0.15em; text-transform: uppercase; }
</style></head><body>
<div class="inner">
  ${style.printWrap(qrUrl)}
  <h1>${name}</h1>
  ${area ? `<p class="area">${area}</p>` : ''}
  <hr class="divider" />
  <p class="scan">Point your camera at the QR code</p>
  <p class="url">${menuUrl}</p>
</div>
<p class="footer">Powered by Dino</p>
<script>window.onload=()=>{window.print();}<\/script>
</body></html>`;

// ─── Dot-grid texture ───────────────────────────────────────────────────────────

const DOT_GRID_BG =
  "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1' cy='1' r='1' fill='rgba(255,255,255,0.07)'/%3E%3C/svg%3E\")";

// ─── QR Style Preview Card ──────────────────────────────────────────────────────

const QRStyleCard: React.FC<{
  styleDef: QRStyleDef;
  qrUrl: string | null;
  selected: boolean;
  onClick: () => void;
}> = ({ styleDef, qrUrl, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      p: 1.5,
      borderRadius: 2,
      border: selected ? '2px solid #312e81' : '2px solid #e2e8f0',
      bgcolor: selected ? alpha('#312e81', 0.04) : '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
      '&:hover': {
        borderColor: selected ? '#312e81' : '#94a3b8',
        bgcolor: selected ? alpha('#312e81', 0.06) : '#f8fafc',
        transform: 'translateY(-1px)',
      },
    }}
  >
    {/* Selected checkmark */}
    {selected && (
      <Box
        sx={{
          position: 'absolute',
          top: 6,
          right: 6,
          width: 18,
          height: 18,
          borderRadius: '50%',
          bgcolor: '#312e81',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CheckIcon sx={{ fontSize: 11, color: '#fff' }} />
      </Box>
    )}

    {/* Mini QR preview */}
    <Box
      sx={{
        width: 64,
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...styleDef.previewWrap as any,
      }}
    >
      {qrUrl ? (
        <Box
          component="img"
          src={qrUrl}
          alt={styleDef.label}
          sx={{ width: 44, height: 44, display: 'block', ...styleDef.previewImg as any }}
        />
      ) : (
        <Box sx={{ width: 44, height: 44, bgcolor: '#f1f5f9', borderRadius: 1 }} />
      )}
    </Box>

    <Box sx={{ textAlign: 'center' }}>
      <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, color: selected ? '#312e81' : '#0f172a', lineHeight: 1.2 }}>
        {styleDef.label}
      </Typography>
      <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.3 }}>
        {styleDef.desc}
      </Typography>
    </Box>
  </Box>
);

// ─── Component ─────────────────────────────────────────────────────────────────

const QRCodeDialog: React.FC<QRCodeDialogProps> = ({
  open,
  location,
  areaName,
  organizationId: _organizationId,
  onClose,
}) => {
  const theme      = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [qrUrl,      setQrUrl]      = useState<string | null>(null);
  const [menuUrl,    setMenuUrl]    = useState<string>('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [layout,     setLayout]     = useState<PrintLayout>('single');
  const [qrStyle,    setQrStyle]    = useState<QRStyle>('classic');

  const selectedStyleDef = QR_STYLES.find(s => s.value === qrStyle) ?? QR_STYLES[0];

  // ── Fetch QR ──────────────────────────────────────────────────────────────────

  const fetchQRCode = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    setError(null);
    setQrUrl(null);
    try {
      const url = await locationService.generateQRCode(location.id);
      setQrUrl(url);
      setMenuUrl(url);
    } catch {
      setError('Failed to load QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    if (open && location) {
      fetchQRCode();
      setLayout('single');
      setQrStyle('classic');
      setCopied(false);
    }
  }, [open, location, fetchQRCode]);

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const handleDownloadPng = () => {
    if (!qrUrl || !location) return;
    const safeName = (location.name ?? location.id).toLowerCase().replace(/\s+/g, '-');
    const a = document.createElement('a');
    a.href = qrUrl;
    a.download = `qr-${safeName}.png`;
    a.click();
  };

  const handleDownloadPdf = async () => {
    if (!location) return;
    setPdfLoading(true);
    try {
      await locationService.printQRCode(location.id);
    } catch {
      setError('Failed to download PDF. Please try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePrint = () => {
    if (!qrUrl || !location) return;
    const name = location.name ?? location.identifier;
    const area = areaName ?? '';
    const builders: Record<PrintLayout, (q: string, n: string, a: string, u: string, s: QRStyleDef) => string> = {
      single: buildSingleHtml,
      '2up':  buildTwoUpHtml,
      '4up':  buildFourUpHtml,
      label:  buildLabelHtml,
      poster: buildPosterHtml,
    };
    const html = builders[layout](qrUrl, name, area, menuUrl, selectedStyleDef);
    const win  = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
  };

  const handleCopyUrl = async () => {
    if (!menuUrl) return;
    try {
      await navigator.clipboard.writeText(menuUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  // ── Derived ───────────────────────────────────────────────────────────────────

  const status    = location?.status ?? 'available';
  const statusCfg = STATUS_CONFIG[status as LocationStatus] ?? STATUS_CONFIG.available;
  const selectedLayoutLabel = PRINT_LAYOUTS.find(l => l.value === layout)?.label ?? 'Single';

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          overflow: 'hidden',
          bgcolor: '#f8fafc',
          maxHeight: '95vh',
        },
      }}
    >
      {/* ── Header ── */}
      <Box
        sx={{
          position: 'relative',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          overflow: 'hidden',
          flexShrink: 0,
          '&::before': { content: '""', position: 'absolute', inset: 0, backgroundImage: DOT_GRID_BG, pointerEvents: 'none' },
        }}
      >
        <Box sx={{ position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <Box sx={{ width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, borderRadius: 2, bgcolor: alpha('#fff', 0.12), border: `1px solid ${alpha('#fff', 0.20)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
          <QrCode2Icon sx={{ color: '#fff', fontSize: 22 }} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, zIndex: 1 }}>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '0.9375rem', sm: '1rem' } }}>
            QR Code
          </Typography>
          <Typography variant="caption" sx={{ color: alpha('#c7d2fe', 0.75), display: 'block', mt: 0.25 }} noWrap>
            {location?.name ?? location?.identifier ?? 'Location'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: alpha('#fff', 0.7), zIndex: 1, '&:hover': { bgcolor: alpha('#fff', 0.1), color: '#fff' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* ── Scrollable content ── */}
      <DialogContent sx={{ p: 0, bgcolor: '#f8fafc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>

        {/* ── 1. Location info ── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: { xs: 1.5, sm: 2 }, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem', mb: 0.75 }}>
            {location?.name ?? location?.identifier}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap', mb: 1.25 }}>
            {areaName && <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{areaName}</Typography>}
            {areaName && location?.capacity != null && <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: '#cbd5e1' }} />}
            {location?.capacity != null && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PeopleIcon sx={{ fontSize: 13, color: '#94a3b8' }} />
                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>{location.capacity} seats</Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, px: 1, py: 0.3, borderRadius: 10, bgcolor: statusCfg.bg, border: `1px solid ${statusCfg.border}` }}>
            <Box sx={{ color: statusCfg.color, display: 'flex', alignItems: 'center' }}>{statusCfg.icon}</Box>
            <Typography variant="caption" sx={{ color: statusCfg.color, fontWeight: 600, fontSize: '0.7rem' }}>{statusCfg.label}</Typography>
          </Box>
        </Box>

        {/* ── 2. QR Style selector ── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1.5 }}>
            QR Style
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: { xs: 1, sm: 1.25 } }}>
            {QR_STYLES.map((s) => (
              <QRStyleCard
                key={s.value}
                styleDef={s}
                qrUrl={qrUrl}
                selected={qrStyle === s.value}
                onClick={() => setQrStyle(s.value)}
              />
            ))}
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* ── 3. Live QR preview ── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', alignSelf: 'flex-start' }}>
            Preview
          </Typography>

          {loading && (
            <Box sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
              <CircularProgress size={32} sx={{ color: '#312e81' }} />
              <Typography variant="caption" color="#64748b">Generating QR code...</Typography>
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ width: '100%', fontSize: '0.75rem' }}>{error}</Alert>
          )}

          {!loading && !error && qrUrl && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                bgcolor: selectedStyleDef.value === 'dark' ? '#1e293b' : '#f1f5f9',
                borderRadius: 2,
                width: '100%',
                transition: 'background 0.2s',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', ...selectedStyleDef.previewWrap as any }}>
                <Box
                  component="img"
                  src={qrUrl}
                  alt="QR preview"
                  sx={{
                    width: { xs: 160, sm: 200 },
                    height: { xs: 160, sm: 200 },
                    display: 'block',
                    ...selectedStyleDef.previewImg as any,
                  }}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* ── 4. Menu URL ── */}
        {menuUrl && (
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 2 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 0.75 }}>
              Menu URL
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 1.5, px: 1.5, py: 1 }}>
              <Typography variant="caption" sx={{ flex: 1, fontFamily: 'monospace', fontSize: '0.72rem', color: '#475569', wordBreak: 'break-all', lineHeight: 1.5 }}>
                {menuUrl}
              </Typography>
              <Tooltip title={copied ? 'Copied!' : 'Copy URL'}>
                <IconButton size="small" onClick={handleCopyUrl} sx={{ flexShrink: 0, color: copied ? '#059669' : '#64748b', '&:hover': { bgcolor: '#f1f5f9' } }}>
                  {copied ? <CheckedIcon sx={{ fontSize: 16 }} /> : <CopyIcon sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* ── 5. Print layout selector ── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', mb: 1 }}>
            Print Layout
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(5, 1fr)' }, gap: 1 }}>
            {PRINT_LAYOUTS.map((opt) => {
              const selected = layout === opt.value;
              return (
                <Box
                  key={opt.value}
                  onClick={() => setLayout(opt.value)}
                  sx={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 0.5, px: 1, py: { xs: 1, sm: 1.25 },
                    borderRadius: 1.5,
                    border: selected ? '1.5px solid #312e81' : '1.5px solid #e2e8f0',
                    bgcolor: selected ? '#0f172a' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.18s cubic-bezier(0.25,0.46,0.45,0.94)',
                    userSelect: 'none',
                    '&:hover': { borderColor: selected ? '#312e81' : '#94a3b8', bgcolor: selected ? '#0f172a' : '#f8fafc' },
                  }}
                >
                  <Box sx={{ color: selected ? '#a5b4fc' : '#64748b', display: 'flex', fontSize: { xs: 18, sm: 20 }, '& .MuiSvgIcon-root': { fontSize: 'inherit' } }}>
                    {opt.icon}
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: selected ? '#fff' : '#0f172a', lineHeight: 1.2 }}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.62rem', color: selected ? alpha('#a5b4fc', 0.8) : '#94a3b8', lineHeight: 1.2, textAlign: 'center' }}>
                    {opt.desc}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#e2e8f0' }} />

        {/* ── 6. Actions ── */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, bgcolor: '#ffffff', flexShrink: 0 }}>
          <Box sx={{ display: { xs: 'grid', sm: 'flex' }, gridTemplateColumns: { xs: '1fr 1fr' }, gap: 1.25, justifyContent: { sm: 'flex-end' }, alignItems: { sm: 'center' } }}>
            <Button
              variant="outlined" size="small"
              startIcon={<ImageIcon sx={{ fontSize: 16 }} />}
              onClick={handleDownloadPng}
              disabled={!qrUrl || loading}
              sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#475569', borderRadius: 1.5, px: 2, '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' } }}
            >
              PNG
            </Button>
            <Button
              variant="outlined" size="small"
              startIcon={pdfLoading ? <CircularProgress size={14} sx={{ color: 'inherit' }} /> : <PdfIcon sx={{ fontSize: 16 }} />}
              onClick={handleDownloadPdf}
              disabled={!qrUrl || loading || pdfLoading}
              sx={{ textTransform: 'none', fontWeight: 600, borderColor: '#e2e8f0', color: '#475569', borderRadius: 1.5, px: 2, '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' } }}
            >
              PDF
            </Button>
            <Button
              variant="contained" size="small"
              startIcon={<PrintIcon sx={{ fontSize: 16 }} />}
              onClick={handlePrint}
              disabled={!qrUrl || loading}
              sx={{
                gridColumn: { xs: '1 / -1', sm: 'unset' },
                textTransform: 'none', fontWeight: 700,
                bgcolor: '#0f172a', color: '#fff', borderRadius: 1.5, px: 2.5, boxShadow: 'none',
                '&:hover': { bgcolor: '#1e293b', boxShadow: 'none' },
                '&.Mui-disabled': { bgcolor: '#e2e8f0', color: '#94a3b8' },
              }}
            >
              Print · {selectedLayoutLabel} · {selectedStyleDef.label}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeDialog;