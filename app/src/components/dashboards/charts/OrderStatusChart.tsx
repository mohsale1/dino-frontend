import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Box, Typography } from '@mui/material';

interface Props {
  data: {
    pending?: number;
    confirmed?: number;
    preparing?: number;
    ready?: number;
    served?: number;
    completed?: number;
    cancelled?: number;
  };
  height?: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#8b5cf6',
  ready: '#10b981',
  served: '#06b6d4',
  completed: '#22c55e',
  cancelled: '#ef4444',
};

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload.length) return null;
  const entry = payload[0];
  return (
    <Box
      sx={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 1.5,
        p: 1.25,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      }}
    >
      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
        {entry.name}: {entry.value}
      </Typography>
      <Typography sx={{ fontSize: '0.7rem', color: '#64748b' }}>
        {((entry.value / entry.payload.total) * 100).toFixed(1)}%
      </Typography>
    </Box>
  );
};


const OrderStatusChart: React.FC<Props> = ({ data, height = 280 }) => {
  const entries = useMemo(
    () =>
      STATUS_ORDER
        .filter((key) => (data[key as keyof typeof data] ?? 0) > 0)
        .map((key) => ({
          key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          value: data[key as keyof typeof data] as number,
          color: STATUS_COLORS[key],
        })),
    [data],
  );

  const total = useMemo(() => entries.reduce((s, e) => s + e.value, 0), [entries]);

  const chartData = useMemo(
    () => entries.map((e) => ({ ...e, total })),
    [entries, total],
  );

  if (total === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          No order data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <ResponsiveContainer width="100%" height={height - 56}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {chartData.map((entry) => (
              <Cell key={entry.key} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* Center label rendered via customized label */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 20, fontWeight: 700, fill: '#0f172a' }}
            dy={-8}
          >
            {total}
          </text>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: 11, fill: '#64748b' }}
            dy={14}
          >
            Orders
          </text>
        </PieChart>
      </ResponsiveContainer>

      {/* Custom legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1,
          mt: 1,
          px: 1,
        }}
      >
        {entries.map((entry) => (
          <Box
            key={entry.key}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: entry.color,
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', color: '#374151' }}>
              {entry.name}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default OrderStatusChart;