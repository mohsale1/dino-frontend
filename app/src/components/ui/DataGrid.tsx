import React from 'react';
import { Grid, GridProps } from '@mui/material';

export interface DataGridProps<T = any> {
  data: T[];
  columns?: { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  renderItem: (item: T, index: number) => React.ReactNode;
  spacing?: number;
}

export function DataGrid<T = any>({
  data,
  columns = { xs: 12, sm: 6, md: 4, lg: 3 },
  renderItem,
  spacing = 3,
}: DataGridProps<T>) {
  return (
    <Grid container spacing={spacing}>
      {data.map((item, index) => (
        <Grid item key={index} {...columns}>
          {renderItem(item, index)}
        </Grid>
      ))}
    </Grid>
  );
}

export default DataGrid;