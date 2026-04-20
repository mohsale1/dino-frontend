declare module 'echarts-for-react' {
  import React from 'react';

  export interface EChartsReactProps {
    option: object;
    style?: React.CSSProperties;
    className?: string;
    theme?: string | object;
    notMerge?: boolean;
    lazyUpdate?: boolean;
    showLoading?: boolean;
    loadingOption?: object;
    onChartReady?: (instance: any) => void;
    onEvents?: Record<string, Function>;
    opts?: object;
  }

  const ReactECharts: React.FC<EChartsReactProps>;
  export default ReactECharts;
}