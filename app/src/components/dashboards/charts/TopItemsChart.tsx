import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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

const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatXAxis = (value: number): string => {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(0)}k`;
  return `\u20B9${value}`;
};

const truncate = (str: string, max: number): string =>
  str.length > max ? str.slice(0, max) + '\u2026' : str;

const TopItemsChart: React.FC<Props> = ({ data, height = 320 }) => {
  const chartData = useMemo(
    () =>
      [...data]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8)
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

  const yLabels = chartData.map((d) => truncate(d.name, 22));
  const revenueValues = chartData.map((d) => d.revenue);

  const option = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#1e293b',
      borderColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderRadius: 8,
      textStyle: { color: '#f1f5f9', fontSize: 12 },
      padding: [10, 14],
      formatter: (params: any[]) => {
        const idx = params[0]?.dataIndex ?? 0;
        const item = chartData[idx];
        if (!item) return '';
        return `
          <div style="font-weight:700;font-size:12px;color:#f1f5f9;margin-bottom:4px">${item.name}</div>
          <div style="font-size:11px;color:#64748b;margin-bottom:6px">${item.category}</div>
          <div style="font-size:11px;color:#42A5F5;margin-bottom:3px">Revenue: ${formatINR(item.revenue)}</div>
          <div style="font-size:11px;color:#f59e0b">Orders: ${item.orders}</div>
        `;
      },
    },
    grid: {
      top: 8,
      right: 24,
      bottom: 32,
      left: 8,
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        formatter: formatXAxis,
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'solid' } },
    },
    yAxis: {
      type: 'category',
      data: yLabels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 11,
        width: 130,
        overflow: 'truncate',
      },
      splitLine: { show: false },
    },
    series: [
      {
        name: 'Revenue',
        type: 'bar',
        data: revenueValues,
        barMaxWidth: 18,
        itemStyle: {
          borderRadius: [0, 4, 4, 0],
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 1, y2: 0,
            colorStops: [
              { offset: 0, color: '#1976D2' },
              { offset: 1, color: '#42A5F5' },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 1, y2: 0,
              colorStops: [
                { offset: 0, color: '#1565C0' },
                { offset: 1, color: '#1976D2' },
              ],
            },
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height, width: '100%' }}
      opts={{ renderer: 'svg' }}
      notMerge
    />
  );
};

export default TopItemsChart;
