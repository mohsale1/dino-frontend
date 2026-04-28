import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Grid,
  Skeleton,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  CreditCardOutlined,
  EventOutlined,
  ReceiptOutlined,
  CheckCircleOutline,
  BusinessOutlined,
  ExpandMore,
  ExpandLess,
  RefreshOutlined,
  ReceiptLongOutlined,
  LocationOnOutlined,
  BadgeOutlined,
} from '@mui/icons-material';
import { useUserData } from '../../../../contexts/application/UserData';
import { workspaceService } from '../../../../services/application/workspace.service';
import type {
  WorkspaceBilling,
  BillingDetail,
  BillingTransaction,
} from '../../../../services/application/workspace.service';

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  primary:       '#00A6CA',
  primaryHv:     '#005F8D',
  primaryBg:     'rgba(0,166,202,0.08)',
  primaryBorder: 'rgba(0,166,202,0.2)',
  textPri:       '#1C1C1E',
  textSec:       '#666666',
  textMuted:     '#999999',
  border:        '#e0e0e0',
  surface:       '#ffffff',
  bg:            '#f8fafc',
  success:       '#008A00',
  successBg:     'rgba(0,138,0,0.08)',
  successBorder: 'rgba(0,138,0,0.2)',
  warning:       '#d97706',
  warningBg:     'rgba(245,158,11,0.08)',
  warningBorder: 'rgba(245,158,11,0.2)',
  error:         '#EB0000',
  errorBg:       'rgba(235,0,0,0.08)',
  errorBorder:   'rgba(235,0,0,0.2)',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatShortDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(amount: number, currency = 'INR'): string {
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function daysUntil(iso?: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}

function daysLabel(days: number | null): string | undefined {
  if (days === null) return undefined;
  if (days === 0) return 'Due today';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
  return `In ${days} day${days !== 1 ? 's' : ''}`;
}

// ── Status configs ────────────────────────────────────────────────────────────

const PLAN_STATUS: Record<string, { label: string; bg: string; border: string; text: string }> = {
  active:    { label: 'Active',    bg: T.successBg,  border: T.successBorder,  text: T.success  },
  trialing:  { label: 'Trial',     bg: T.primaryBg,  border: T.primaryBorder,  text: T.primary  },
  past_due:  { label: 'Past Due',  bg: T.warningBg,  border: T.warningBorder,  text: T.warning  },
  cancelled: { label: 'Cancelled', bg: T.errorBg,    border: T.errorBorder,    text: T.error    },
  inactive:  { label: 'Inactive',  bg: T.errorBg,    border: T.errorBorder,    text: T.error    },
};

const TX_STATUS: Record<string, { label: string; color: string; bg: string }> = {
  paid:     { label: 'Paid',     color: T.success, bg: T.successBg  },
  pending:  { label: 'Pending',  color: T.warning, bg: T.warningBg  },
  failed:   { label: 'Failed',   color: T.error,   bg: T.errorBg    },
  refunded: { label: 'Refunded', color: T.primary, bg: T.primaryBg  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}> = ({ icon, title, subtitle, action }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
    <Box sx={{
      width: 36, height: 36, borderRadius: 2,
      bgcolor: T.primaryBg, border: `1px solid ${T.primaryBorder}`,
      color: T.primary, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0,
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: '0.9375rem', lineHeight: 1.2 }}>
        {title}
      </Typography>
      <Typography variant="caption" sx={{ color: T.textSec }}>
        {subtitle}
      </Typography>
    </Box>
    {action}
  </Box>
);

const InfoTile: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  subColor?: string;
}> = ({ icon, label, value, sub, subColor }) => (
  <Box sx={{
    display: 'flex', alignItems: 'flex-start', gap: 1.5,
    px: 2, py: 1.75, borderRadius: 2,
    bgcolor: T.bg, border: `1px solid ${T.border}`,
    height: '100%',
  }}>
    <Box sx={{
      width: 34, height: 34, borderRadius: 1.5,
      bgcolor: T.primaryBg, border: `1px solid ${T.primaryBorder}`,
      color: T.primary, display: 'flex', alignItems: 'center',
      justifyContent: 'center', flexShrink: 0, mt: 0.25,
      '& svg': { fontSize: 17 },
    }}>
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" sx={{ color: T.textMuted, display: 'block', mb: 0.25 }}>
        {label}
      </Typography>
      {typeof value === 'string'
        ? <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: '0.875rem' }}>{value}</Typography>
        : value
      }
      {sub && (
        <Typography variant="caption" sx={{ color: subColor ?? T.textMuted, display: 'block', mt: 0.25 }}>
          {sub}
        </Typography>
      )}
    </Box>
  </Box>
);

const DetailRow: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => {
  if (!value) return null;
  return (
    <Box sx={{
      display: 'flex', alignItems: 'flex-start', gap: 2,
      px: 1.5, py: 1.25, borderRadius: 2,
      bgcolor: T.bg, border: `1px solid ${T.border}`,
    }}>
      <Typography variant="caption" sx={{ color: T.textMuted, minWidth: 100, flexShrink: 0, pt: 0.1 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: T.textPri, wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Box>
  );
};

const SkeletonCard: React.FC = () => (
  <Card elevation={0} sx={{ border: `1px solid ${T.border}`, borderRadius: '12px', mb: 2 }}>
    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <Skeleton variant="rounded" width={36} height={36} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={20} />
          <Skeleton variant="text" width="60%" height={16} />
        </Box>
      </Box>
      <Skeleton variant="rounded" height={72} sx={{ mb: 3 }} />
      <Grid container spacing={2}>
        {[0, 1, 2, 3].map(i => (
          <Grid item xs={12} sm={6} key={i}>
            <Skeleton variant="rounded" height={80} />
          </Grid>
        ))}
      </Grid>
    </CardContent>
  </Card>
);

// ── Main component ────────────────────────────────────────────────────────────

const BillingSection: React.FC = () => {
  const { userData } = useUserData();
  const workspaceId = userData?.workspace?.id;

  const [billing,      setBilling]      = useState<WorkspaceBilling | null>(null);
  const [detail,       setDetail]       = useState<BillingDetail | null>(null);
  const [transactions, setTransactions] = useState<BillingTransaction[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [txExpanded,   setTxExpanded]   = useState(false);

  const load = useCallback(async () => {
    if (!workspaceId) return;
    setLoading(true);
    setError(null);
    try {
      const [billingData, detailData, txData] = await Promise.allSettled([
        workspaceService.getWorkspaceBilling(workspaceId),
        workspaceService.getBillingDetail(workspaceId),
        workspaceService.getBillingTransactions(workspaceId, { page: 1, page_size: 10 }),
      ]);

      if (billingData.status === 'fulfilled') setBilling(billingData.value);
      if (detailData.status === 'fulfilled')  setDetail(detailData.value);
      if (txData.status === 'fulfilled')      setTransactions(txData.value.items ?? []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load billing information');
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { load(); }, [load]);

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box>
        <SkeletonCard />
        <SkeletonCard />
      </Box>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ borderRadius: 2 }}
        action={
          <Tooltip title="Retry">
            <IconButton size="small" onClick={load} color="inherit">
              <RefreshOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      >
        {error}
      </Alert>
    );
  }

  // ── Derived values ────────────────────────────────────────────────────────

  const planStatus   = billing?.plan_status?.toLowerCase() ?? 'active';
  const statusCfg    = PLAN_STATUS[planStatus] ?? PLAN_STATUS.active;
  const nextBilling  = billing?.next_billing_date;
  const days         = daysUntil(nextBilling);
  const dLabel       = daysLabel(days);
  const dLabelColor  = days !== null && days <= 7 ? T.warning : T.textMuted;
  const cycleLabel   = billing?.billing_cycle === 'annual' ? 'per year' : 'per month';
  const hasDetail    = detail && Object.values(detail).some(v => v && typeof v === 'string' && v.trim());
  const hasTx        = transactions.length > 0;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

      {/* ── Card 1: Plan & Subscription ── */}
      <Card elevation={0} sx={{ border: `1px solid ${T.border}`, borderRadius: '12px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <SectionHeader
            icon={<CreditCardOutlined sx={{ fontSize: 20 }} />}
            title="Billing & Subscription"
            subtitle="Your current plan and upcoming charges"
            action={
              <Tooltip title="Refresh">
                <IconButton size="small" onClick={load} sx={{ color: T.textMuted, '&:hover': { color: T.textPri } }}>
                  <RefreshOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            }
          />

          {/* Plan banner */}
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: 1.5,
            px: 2.5, py: 2, mb: 3,
            borderRadius: 2, bgcolor: T.primaryBg, border: `1px solid ${T.primaryBorder}`,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CheckCircleOutline sx={{ fontSize: 22, color: T.primary }} />
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: T.textPri, lineHeight: 1.2 }}>
                  {billing?.plan ? `${billing.plan} Plan` : 'No Active Plan'}
                </Typography>
                {billing?.billing_cycle && (
                  <Typography variant="caption" sx={{ color: T.textSec }}>
                    Billed {billing.billing_cycle === 'annual' ? 'annually' : 'monthly'}
                  </Typography>
                )}
              </Box>
            </Box>
            <Chip
              label={statusCfg.label}
              size="small"
              sx={{
                bgcolor: statusCfg.bg, color: statusCfg.text,
                border: `1px solid ${statusCfg.border}`,
                fontWeight: 700, fontSize: '0.72rem', height: 24,
              }}
            />
          </Box>

          {/* Detail tiles */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InfoTile
                icon={<EventOutlined />}
                label="Next Billing Date"
                value={formatDate(nextBilling)}
                sub={dLabel}
                subColor={dLabelColor}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <InfoTile
                icon={<ReceiptOutlined />}
                label="Billing Cycle"
                value={billing?.billing_cycle
                  ? billing.billing_cycle.charAt(0).toUpperCase() + billing.billing_cycle.slice(1)
                  : '—'
                }
                sub={cycleLabel}
              />
            </Grid>

            {billing?.billing_email && (
              <Grid item xs={12} sm={6}>
                <InfoTile
                  icon={<CreditCardOutlined />}
                  label="Billing Email"
                  value={billing.billing_email}
                />
              </Grid>
            )}

            {billing?.billing_name && (
              <Grid item xs={12} sm={6}>
                <InfoTile
                  icon={<BusinessOutlined />}
                  label="Billing Name"
                  value={billing.billing_name}
                />
              </Grid>
            )}

            {(billing?.billing_city || billing?.billing_state || billing?.billing_country) && (
              <Grid item xs={12} sm={6}>
                <InfoTile
                  icon={<LocationOnOutlined />}
                  label="Billing Location"
                  value={[billing?.billing_city, billing?.billing_state, billing?.billing_country]
                    .filter(Boolean).join(', ')}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Card 2: Billing Detail (GST / Tax) ── */}
      {hasDetail && (
        <Card elevation={0} sx={{ border: `1px solid ${T.border}`, borderRadius: '12px' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeader
              icon={<BadgeOutlined sx={{ fontSize: 20 }} />}
              title="Tax & Business Details"
              subtitle="GST, PAN and registered business information"
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              <DetailRow label="Legal Name"   value={detail?.legal_name} />
              <DetailRow label="Trade Name"   value={detail?.trade_name} />
              <DetailRow label="GSTIN"        value={detail?.gstin} />
              <DetailRow label="PAN"          value={detail?.pan} />
              <DetailRow label="Email"        value={detail?.billing_email} />
              <DetailRow label="Phone"        value={detail?.billing_phone} />
              <DetailRow label="Address"      value={detail?.address_line1} />
              <DetailRow label="City"         value={detail?.city} />
              <DetailRow label="State"        value={detail?.state} />
              <DetailRow label="Country"      value={detail?.country} />
              <DetailRow label="Postal Code"  value={detail?.postal_code} />
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── Card 3: Transaction History ── */}
      {hasTx && (
        <Card elevation={0} sx={{ border: `1px solid ${T.border}`, borderRadius: '12px' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <SectionHeader
              icon={<ReceiptLongOutlined sx={{ fontSize: 20 }} />}
              title="Transaction History"
              subtitle={`${transactions.length} recent billing record${transactions.length !== 1 ? 's' : ''}`}
              action={
                <Tooltip title={txExpanded ? 'Collapse' : 'Expand'}>
                  <IconButton
                    size="small"
                    onClick={() => setTxExpanded(p => !p)}
                    sx={{ color: T.textMuted, '&:hover': { color: T.textPri } }}
                  >
                    {txExpanded ? <ExpandLess sx={{ fontSize: 18 }} /> : <ExpandMore sx={{ fontSize: 18 }} />}
                  </IconButton>
                </Tooltip>
              }
            />

            {/* Always show the most recent transaction */}
            {transactions.slice(0, 1).map(tx => (
              <Box
                key={tx.id}
                sx={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  flexWrap: 'wrap', gap: 1.5,
                  px: 2, py: 1.75, borderRadius: 2,
                  bgcolor: T.bg, border: `1px solid ${T.border}`, mb: 1.5,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: '0.875rem' }}>
                    {tx.plan} Plan
                  </Typography>
                  <Typography variant="caption" sx={{ color: T.textSec }}>
                    {formatShortDate(tx.billing_period_start)} – {formatShortDate(tx.billing_period_end)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Typography sx={{ fontWeight: 700, color: T.textPri, fontSize: '0.9375rem' }}>
                    {formatCurrency(tx.amount, tx.currency)}
                  </Typography>
                  <Chip
                    label={(TX_STATUS[tx.payment_status] ?? TX_STATUS.pending).label}
                    size="small"
                    sx={{
                      bgcolor: (TX_STATUS[tx.payment_status] ?? TX_STATUS.pending).bg,
                      color:   (TX_STATUS[tx.payment_status] ?? TX_STATUS.pending).color,
                      fontWeight: 700, fontSize: '0.68rem', height: 20,
                    }}
                  />
                </Box>
              </Box>
            ))}

            {/* Expanded table for all transactions */}
            <Collapse in={txExpanded} unmountOnExit>
              <Divider sx={{ mb: 2, borderColor: T.border }} />
              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ border: `1px solid ${T.border}`, borderRadius: 2, overflow: 'hidden' }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: T.bg }}>
                      {['Plan', 'Period', 'Amount', 'Method', 'Status', 'Invoice'].map(h => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 700, fontSize: '0.72rem', color: T.textSec,
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            borderBottom: `2px solid ${T.border}`, py: 1.25,
                          }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map(tx => {
                      const txCfg = TX_STATUS[tx.payment_status] ?? TX_STATUS.pending;
                      return (
                        <TableRow
                          key={tx.id}
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            '&:hover': { bgcolor: T.bg },
                          }}
                        >
                          <TableCell sx={{ fontWeight: 600, color: T.textPri, fontSize: '0.8125rem' }}>
                            {tx.plan}
                          </TableCell>
                          <TableCell sx={{ color: T.textSec, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {formatShortDate(tx.billing_period_start)}
                            <Typography component="span" sx={{ color: T.textMuted, mx: 0.5 }}>–</Typography>
                            {formatShortDate(tx.billing_period_end)}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: T.textPri, fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                            {formatCurrency(tx.amount, tx.currency)}
                          </TableCell>
                          <TableCell sx={{ color: T.textSec, fontSize: '0.8125rem' }}>
                            {tx.payment_method ?? '—'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={txCfg.label}
                              size="small"
                              sx={{
                                bgcolor: txCfg.bg, color: txCfg.color,
                                fontWeight: 700, fontSize: '0.68rem', height: 20,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: T.textSec, fontSize: '0.8125rem' }}>
                            {tx.invoice_number ?? '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>

            {transactions.length > 1 && (
              <Box
                onClick={() => setTxExpanded(p => !p)}
                sx={{
                  mt: 1.5, textAlign: 'center', cursor: 'pointer',
                  color: T.primary, fontSize: '0.8125rem', fontWeight: 600,
                  '&:hover': { color: T.primaryHv },
                }}
              >
                {txExpanded
                  ? 'Show less'
                  : `View all ${transactions.length} transactions`
                }
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Empty state when no billing data at all ── */}
      {!billing && !hasDetail && !hasTx && (
        <Card elevation={0} sx={{ border: `1px solid ${T.border}`, borderRadius: '12px' }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', py: 6 }}>
            <Box sx={{
              width: 56, height: 56, borderRadius: '50%',
              bgcolor: T.bg, border: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
            }}>
              <CreditCardOutlined sx={{ fontSize: 28, color: T.textMuted }} />
            </Box>
            <Typography sx={{ fontWeight: 600, color: T.textSec, mb: 0.5 }}>
              No billing information
            </Typography>
            <Typography variant="body2" sx={{ color: T.textMuted }}>
              Billing details will appear here once your workspace has an active plan.
            </Typography>
          </CardContent>
        </Card>
      )}

    </Box>
  );
};

export default BillingSection;
