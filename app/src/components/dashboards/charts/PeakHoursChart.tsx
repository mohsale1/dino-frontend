import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import {
  Box,
  Card,
  CardContent,
  Typography,
  useTheme,
  alpha,
  Grid,
} from '@mui/material';
import { AccessTime, LocalFireDepartment, WbSunny, Nightlight } from '@mui/icons-material';

interface PeakHoursChartProps {
  data?: Array<{ hour: string | number; orders: number; revenue: number }>;
  title?: string;
  height?: number;
}

const COLOR_LOW = '#10b981';
const COLOR_MED = '#f59e0b';
const COLOR_HIGH = '#ef4444';

const formatHourLabel = (h: number): string => {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
};

const normalizeHour = (h: string | number): number => {
  if (typeof h === 'number') return h;
  return parseInt(h.split(':')[0], 10);
};

const getBusiestPeriod = (hourNum: number): string => {
  if (hourNum >= 6 && hourNum < 11) return 'Breakfast';
  if (hourNum >= 11 && hourNum < 15) return 'Lunch';
  if (hourNum >= 17 && hourNum < 22) return 'Dinner';
  return 'Off-peak';
};

const PeakHoursChart: React.FC<PeakHoursChartProps> = ({
  data,
  title = 'Peak Hours Analysis',
  height = 320,
}) => {
  const theme = useTheme();

  const { chartData, peakEntry, avgOrders, periodSummary } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], peakEntry: null, avgOrders: 0, periodSummary: null };
    }

    const normalized = data.map((item) => {
      const hourNum = normalizeHour(item.hour);
      return {
        hourNum,
        label: formatHourLabel(hourNum),
        orders: item.orders,
        revenue: item.revenue,
      };
    });

    const maxOrders = Math.max(...normalized.map((d) => d.orders), 1);
    const totalOrders = normalized.reduce((s, d) => s + d.orders, 0);
    const avg = normalized.length > 0 ? totalOrders / normalized.length : 0;

    const peak = normalized.reduce(
      (best, d) => (d.orders > best.orders ? d : best),
      normalized[0]
    );

    const periods = [
      { label: 'Breakfast', range: '6 - 11 AM', hours: [6, 7, 8, 9, 10], color: '#f59e0b' },
      { label: 'Lunch', range: '11 AM - 3 PM', hours: [11, 12, 13, 14], color: '#3b82f6' },
      { label: 'Dinner', range: '5 - 10 PM', hours: [17, 18, 19, 20, 21], color: '#ef4444' },
    ].map((p) => {
      const periodOrders = normalized
        .filter((d) => p.hours.includes(d.hourNum))
        .reduce((s, d) => s + d.orders, 0);
      return { ...p, orders: periodOrders, pct: totalOrders > 0 ? (periodOrders / totalOrders) * 100 : 0 };
    });

    return {
      chartData: normalized.map((d) => ({ ...d, maxOrders })),
      peakEntry: peak,
      avgOrders: avg,
      periodSummary: periods,
    };
  }, [data]);

  const getBarColor = (orders: number): string => {
    if (!chartData.length) return COLOR_LOW;
    const max = chartData[0]?.maxOrders ?? 1;
    const ratio = orders / max;
    if (ratio >= 0.66) return COLOR_HIGH;
    if (ratio >= 0.33) return COLOR_MED;
    return COLOR_LOW;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: alpha(theme.palette.background.paper, 0.97),
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1.5,
          boxShadow: theme.shadows[4],
          minWidth: 150,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
          {d.label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getBarColor(d.orders) }} />
          <Typography variant="body2" color="text.secondary">
            Orders:&nbsp;
            <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
              {d.orders}
            </Typography>
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Revenue:&nbsp;
          <Typography component="span" variant="body2" fontWeight={700} color="text.primary">
            ₹{d.revenue.toFixed(0)}
          </Typography>
        </Typography>
      </Box>
    );
  };

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            {title}
          </Typography>
          <Box
            sx={{
              height: height,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              bgcolor: alpha(theme.palette.grey[500], 0.04),
              borderRadius: 2,
              border: `2px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
            }}
          >
            <AccessTime sx={{ fontSize: 48, color: 'text.disabled' }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              No peak hours data available
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Data will appear once orders are recorded
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  const busiestPeriodLabel = peakEntry ? getBusiestPeriod(peakEntry.hourNum) : '';

  return (
    <Card
      elevation={0}
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h6" fontWeight={700} color="text.primary">
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Order volume distribution across the day
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              bgcolor: alpha('#ef4444', 0.08),
              border: `1px solid ${alpha('#ef4444', 0.2)}`,
              borderRadius: 1.5,
            }}
          >
            <LocalFireDepartment sx={{ fontSize: 16, color: '#ef4444' }} />
            <Typography variant="caption" fontWeight={700} color="#ef4444">
              {peakEntry?.label} &mdash; {peakEntry?.orders} orders
            </Typography>
          </Box>
        </Box>

        {/* Summary row */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: alpha('#ef4444', 0.06),
                border: `1px solid ${alpha('#ef4444', 0.15)}`,
                textAlign: 'center',
              }}
            >
              <LocalFireDepartment sx={{ fontSize: 20, color: '#ef4444', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1}>
                {peakEntry?.label}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Peak Hour
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: alpha('#f59e0b', 0.06),
                border: `1px solid ${alpha('#f59e0b', 0.15)}`,
                textAlign: 'center',
              }}
            >
              <WbSunny sx={{ fontSize: 20, color: '#f59e0b', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1}>
                {busiestPeriodLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Busiest Period
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: alpha('#10b981', 0.06),
                border: `1px solid ${alpha('#10b981', 0.15)}`,
                textAlign: 'center',
              }}
            >
              <AccessTime sx={{ fontSize: 20, color: '#10b981', mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1}>
                {avgOrders.toFixed(1)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Orders/Hr
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box
              sx={{
                p: 1.75,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                textAlign: 'center',
              }}
            >
              <Nightlight sx={{ fontSize: 20, color: theme.palette.primary.main, mb: 0.5 }} />
              <Typography variant="h6" fontWeight={800} color="text.primary" lineHeight={1}>
                {peakEntry?.orders}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Peak Orders
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* Bar Chart */}
        <Box sx={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.5)} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
                interval={1}
                angle={-40}
                textAnchor="end"
                height={52}
              />
              <YAxis
                tick={{ fontSize: 11, fill: theme.palette.text.secondary }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: alpha(theme.palette.primary.main, 0.06) }} />
              <ReferenceLine
                y={avgOrders}
                stroke={alpha(theme.palette.primary.main, 0.6)}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{
                  value: 'Avg',
                  position: 'insideTopRight',
                  fill: theme.palette.primary.main,
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
              <Bar dataKey="orders" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.orders)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

        {/* Color legend */}
        <Box sx={{ display: 'flex', gap: 2.5, justifyContent: 'center', mt: 1.5, mb: 2.5 }}>
          {[
            { color: COLOR_LOW, label: 'Low' },
            { color: COLOR_MED, label: 'Medium' },
            { color: COLOR_HIGH, label: 'High' },
          ].map((l) => (
            <Box key={l.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: l.color }} />
              <Typography variant="caption" color="text.secondary">
                {l.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Period breakdown */}
        {periodSummary && (
          <Box sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Period Breakdown
            </Typography>
            <Grid container spacing={1.5} sx={{ mt: 0.75 }}>
              {periodSummary.map((p) => (
                <Grid item xs={4} key={p.label}>
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: alpha(p.color, 0.06),
                      border: `1px solid ${alpha(p.color, 0.18)}`,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
                      {p.label}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={800} color="text.primary" lineHeight={1.2}>
                      {p.orders}
                    </Typography>
                    <Typography variant="caption" sx={{ color: p.color, fontWeight: 600 }}>
                      {p.pct.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ display: 'block' }}>
                      {p.range}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PeakHoursChart;