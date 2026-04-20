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

interface DataItem {
  id: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
}

interface Props {
  data: DataItem[];
  height?: number;
}

const formatINR = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const formatXAxis = (value: number) => {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
  return `₹${value}`;
};

const truncate = (str: string, max: number) =>
  str.length > max ? str.slice(0, max) + '\u2026' : str;

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0]?.payload as DataItem & { label: string };
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 1.5,
        p: 1.5,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        minWidth: 180,
      }}
    >
      <Typography sx={{ fontWeight: 600, fontSize: '0.75rem', color: '#0f172a', mb: 0.5 }}>
        {d.name}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: '#64748b', mb: 0.5 }}>
        {d.category}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#6366f1', mb: 0.25 }}>
        Revenue: {formatINR(d.revenue)}
      </Typography>
      <Typography sx={{ fontSize: '0.72rem', color: '#f59e0b' }}>
        Orders: {d.orders}
      </Typography>
    </Box>
  );
};

const TopItemsChart: React.FC<Props> = ({ data, height = 320 }) => {
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)
        .map((d) => ({ ...d, label: truncate(d.name, 20) }))
        .reverse(),
    [data],
  );

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          No items data available
        </Typography>
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={chartData}
        margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatXAxis}
          tick={{ fontSize: 10, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
        <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {chartData.map((entry) => (
            <Cell key={entry.id} fill="#6366f1" />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopItemsChart;