import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface DataPoint {
  hour: number;
  orders: number;
  revenue: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
}

const formatHour = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
};

const formatHourShort = (hour: number): string => {
  if (hour === 0) return '12A';
  if (hour < 12) return `${hour}A`;
  if (hour === 12) return '12P';
  return `${hour - 12}P`;
};

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const getBarColor = (orders: number, maxOrders: number): string => {
  const ratio = maxOrders > 0 ? orders / maxOrders : 0;
  if (ratio > 0.7) return '#ef4444';
  if (ratio > 0.4) return '#f59e0b';
  return '#10b981';
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload as DataPoint;
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 1.5,
        p: 1.25,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: 140,
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#0f172a', mb: 0.5 }}>
        {formatHour(d.hour)}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#374151', mb: 0.25 }}>
        Orders: {d.orders}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#64748b' }}>
        Revenue: {formatINR(d.revenue)}
      </Typography>
    </Box>
  );
};

const PeakHoursChart: React.FC<Props> = ({ data, height = 220 }) => {
  const maxOrders = useMemo(() => Math.max(...data.map((d) => d.orders), 1), [data]);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          No peak hours data available
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
        <XAxis
          dataKey="hour"
          tickFormatter={(v) => (v % 6 === 0 ? formatHourShort(v) : '')}
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={{ stroke: '#e2e8f0' }}
          tickLine={false}
          interval={0}
        />
        <YAxis
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="orders" name="Orders" radius={[3, 3, 0, 0]} maxBarSize={20}>
          {data.map((entry) => (
            <Cell key={`cell-${entry.hour}`} fill={getBarColor(entry.orders, maxOrders)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default PeakHoursChart;