import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
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

const formatINR = (value: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);

const formatYAxisRevenue = (value: number): string => {
  if (value >= 100000) return `\u20B9${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `\u20B9${(value / 1000).toFixed(0)}k`;
  return `\u20B9${value}`;
};

const TOOLTIP_STYLE = {
  backgroundColor: '#1e293b',
  borderColor: 'rgba(255,255,255,0.12)',
  borderWidth: 1,
  borderRadius: 8,
  textStyle: { color: '#f1f5f9', fontSize: 12 },
  padding: [10, 14],
};

const RevenueChart: React.FC<Props> = ({ data, height = 300 }) => {
  const labels = useMemo(
    () => data.map((d) => d.period ?? d.date.slice(-6)),
    [data],
  );

  const revenueValues = useMemo(() => data.map((d) => d.revenue), [data]);
  const orderValues = useMemo(() => data.map((d) => d.orders), [data]);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ color: '#94a3b8', fontSize: '0.875rem' }}>
          No revenue data available
        </Typography>
      </Box>
    );
  }

  const option = {
    backgroundColor: 'transparent',
    textStyle: { fontFamily: 'inherit' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: 'rgba(255,255,255,0.12)' } },
      ...TOOLTIP_STYLE,
      formatter: (params: any[]) => {
        const label = params[0]?.axisValue ?? '';
        const rev = params.find((p: any) => p.seriesName === 'Revenue');
        const ord = params.find((p: any) => p.seriesName === 'Orders');
        return `
          <div style="font-weight:700;font-size:12px;color:#f1f5f9;margin-bottom:6px">${label}</div>
          ${rev ? `<div style="font-size:11px;color:#42A5F5;margin-bottom:3px">Revenue: ${formatINR(rev.value ?? 0)}</div>` : ''}
          ${ord ? `<div style="font-size:11px;color:#f59e0b">Orders: ${ord.value ?? 0}</div>` : ''}
        `;
      },
    },
    legend: {
      bottom: 0,
      left: 'center',
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 20,
      textStyle: { color: '#94a3b8', fontSize: 12 },
      data: ['Revenue', 'Orders'],
    },
    grid: {
      top: 12,
      right: 40,
      bottom: 48,
      left: 60,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: labels,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#94a3b8', fontSize: 11 },
      splitLine: { show: false },
    },
    yAxis: [
      {
        type: 'value',
        name: '',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 10,
          formatter: formatYAxisRevenue,
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)', type: 'solid' } },
      },
      {
        type: 'value',
        name: '',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: 'Revenue',
        type: 'line',
        yAxisIndex: 0,
        data: revenueValues,
        smooth: true,
        symbol: 'circle',
        symbolSize: 0,
        lineStyle: { color: '#1976D2', width: 2.5 },
        itemStyle: { color: '#1976D2' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(25,118,210,0.30)' },
              { offset: 1, color: 'rgba(25,118,210,0.00)' },
            ],
          },
        },
        emphasis: {
          focus: 'series',
          itemStyle: { color: '#42A5F5', borderColor: '#1e293b', borderWidth: 2, symbolSize: 6 },
        },
      },
      {
        name: 'Orders',
        type: 'line',
        yAxisIndex: 1,
        data: orderValues,
        smooth: true,
        symbol: 'circle',
        symbolSize: 0,
        lineStyle: { color: '#f59e0b', width: 2, type: 'dashed' },
        itemStyle: { color: '#f59e0b' },
        emphasis: {
          focus: 'series',
          itemStyle: { color: '#f59e0b', borderColor: '#1e293b', borderWidth: 2, symbolSize: 6 },
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

export default RevenueChart;
