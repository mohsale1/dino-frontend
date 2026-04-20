import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { Box, Typography } from '@mui/material';
import type { CategoryPerformance } from '../../../types/dashboard';

interface Props {
  data: CategoryPerformance[];
  height?: number;
}

const COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#3b82f6',
  '#ef4444', '#8b5cf6', '#0ea5e9', '#22c55e',
];

const CategoryChart: React.FC<Props> = ({ data, height = 260 }) => {
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (p: any) =>
        `<b>${p.name}</b><br/>Revenue: ₹${Number(p.value).toLocaleString('en-IN')}<br/>${p.percent}%`,
    },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      textStyle: { fontSize: 11 },
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '68%'],
        center: ['38%', '50%'],
        data: data.map((d, i) => ({
          name: d.category,
          value: d.revenue,
          itemStyle: { color: COLORS[i % COLORS.length] },
        })),
        label: { show: false },
        emphasis: {
          itemStyle: { shadowBlur: 8, shadowColor: 'rgba(0,0,0,0.15)' },
        },
      },
    ],
  }), [data]);

  return (
    <Box>
      <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a', mb: 1.5 }}>
        Revenue by Category
      </Typography>
      <ReactECharts option={option} style={{ height }} notMerge />
    </Box>
  );
};

export default CategoryChart;