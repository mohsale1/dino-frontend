import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface DataPoint {
  date: string;
  period?: string;
  revenue: number;
  orders: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatYAxisRevenue = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  const revenue = payload.find((p: any) => p.dataKey === 'revenue');
  const orders = payload.find((p: any) => p.dataKey === 'orders');
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 1.5,
        p: 1.5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: 160,
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#0f172a', mb: 0.75 }}>
        {label}
      </Typography>
      {revenue && (
        <Typography sx={{ fontSize: '0.72rem', color: '#6366f1', mb: 0.25 }}>
          Revenue: {formatINR(revenue.value ?? 0)}
        </Typography>
      )}
      {orders && (
        <Typography sx={{ fontSize: '0.72rem', color: '#f59e0b' }}>
          Orders: {orders.value ?? 0}
        </Typography>
      )}
    </Box>
  );
};

const RevenueChart: React.FC<Props> = ({ data, height = 300 }) => {
  const chartData = useMemo(
    () =>
      data.map((d) => ({
        ...d,
        label: d.period ?? d.date.slice(-6),
      })),
    [data],
  );

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          No revenue data available
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
        />
        <YAxis
          yAxisId="revenue"
          orientation="left"
          tickFormatter={formatYAxisRevenue}
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={56}
        />
        <YAxis
          yAxisId="orders"
          orientation="right"
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={32}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) => (
            <span style={{ color: '#374151', fontSize: 12 }}>{value}</span>
          )}
        />
        <Area
          yAxisId="revenue"
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        <Line
          yAxisId="orders"
          type="monotone"
          dataKey="orders"
          name="Orders"
          stroke="#f59e0b"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default RevenueChart;