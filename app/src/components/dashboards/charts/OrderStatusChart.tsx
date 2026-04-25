import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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
  pending:   '#f59e0b',
  confirmed: '#42A5F5',
  preparing: '#8b5cf6',
  ready:     '#10b981',
  served:    '#0ea5e9',
  completed: '#10b981',
  cancelled: '#f43f5e',
};

const STATUS_ORDER = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled'];

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

  if (total === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          No order data available
        </Typography>
      </Box>
    );
  }

  const chartHeight = height - 64;

  const option = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1C1C1E',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      padding: [10, 14],
      formatter: (params: any) => {
        const pct = total > 0 ? ((params.value / total) * 100).toFixed(1) : '0.0';
        return `
          <div style="font-weight:700;font-size:12px;color:#f1f5f9;margin-bottom:4px">${params.name}</div>
          <div style="font-size:11px;color:#94a3b8">${params.value} orders &nbsp;<span style="color:#64748b">(${pct}%)</span></div>
        `;
      },
    },
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6,
          itemStyle: { shadowBlur: 16, shadowColor: 'rgba(0,0,0,0.40)' },
        },
        itemStyle: {
          borderColor: '#ffffff',
          borderWidth: 2,
          borderRadius: 4,
        },
        data: entries.map((e) => ({
          name: e.name,
          value: e.value,
          itemStyle: { color: e.color },
        })),
      },
    ],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: '42%',
        style: {
          text: String(total),
          textAlign: 'center',
          fill: '#1C1C1E',
          fontSize: 22,
          fontWeight: '800',
          fontFamily: 'inherit',
        },
      },
      {
        type: 'text',
        left: 'center',
        top: '56%',
        style: {
          text: 'Total Orders',
          textAlign: 'center',
          fill: '#94a3b8',
          fontSize: 11,
          fontFamily: 'inherit',
        },
      },
    ],
  };

  return (
    <Box>
      <ReactECharts
        option={option}
        style={{ height: chartHeight, width: '100%' }}
        opts={{ renderer: 'svg' }}
        notMerge
      />

      {/* Custom legend */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '6px 12px',
          px: 1,
        }}
      >
        {entries.map((entry) => (
          <Box key={entry.key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: entry.color,
                flexShrink: 0,
              }}
            />
            <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {entry.name}
            </Typography>
            <Typography sx={{ fontSize: '0.7rem', color: '#f1f5f9', fontWeight: 700 }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default OrderStatusChart;
