import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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

const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

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

  const xLabels = data.map((d) => formatHourShort(d.hour));
  const orderValues = data.map((d) => d.orders);

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
        const d = data[idx];
        if (!d) return '';
        return `
          <div style="font-weight:700;font-size:12px;color:#f1f5f9;margin-bottom:6px">${formatHour(d.hour)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:3px">Orders: <strong style="color:#f1f5f9">${d.orders}</strong></div>
          <div style="font-size:11px;color:#94a3b8">Revenue: <strong style="color:#f1f5f9">${formatINR(d.revenue)}</strong></div>
        `;
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max: maxOrders,
      inRange: {
        color: ['#10b981', '#f59e0b', '#f43f5e'],
      },
      dimension: 1,
    },
    grid: {
      top: 8,
      right: 8,
      bottom: 28,
      left: 36,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#94a3b8',
        fontSize: 10,
        interval: (index: number) => index % 3 === 0,
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'solid' } },
    },
    series: [
      {
        name: 'Orders',
        type: 'bar',
        data: orderValues,
        barMaxWidth: 20,
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0,0,0,0.40)',
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

export default PeakHoursChart;
