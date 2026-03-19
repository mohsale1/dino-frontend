import React from 'react';
import { Grid, Box, Paper, Typography, Stack } from '@mui/material';
import {
  Inventory,
  CheckCircle,
  Cancel,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { formatCurrency } from '../../../utils/data';

export interface CatalogStatsData {
  totalItems: number;
  activeItems: number;
  inactiveItems: number;
  totalCategories: number;
  totalValue: number;
  averagePrice: number;
  trends?: {
    items: number;
    value: number;
  };
}

export interface CatalogStatsProps {
  stats: CatalogStatsData;
  loading?: boolean;
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  subtitle?: string;
}> = ({ title, value, icon, subtitle }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: '100%',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        transition: 'border-color 0.2s',
        '&:hover': {
          borderColor: '#bdbdbd',
        },
      }}
    >
      <Stack spacing={1.5}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {title}
          </Typography>
          <Box sx={{ color: 'text.secondary' }}>
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" fontWeight={600} color="text.primary">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
};

export const CatalogStats: React.FC<CatalogStatsProps> = ({ stats }) => {
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon={<Inventory />}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Active Items"
          value={stats.activeItems}
          icon={<CheckCircle />}
          subtitle={`${Math.round((stats.activeItems / stats.totalItems) * 100)}% of total`}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={<CategoryIcon />}
        />
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <StatCard
          title="Catalog Value"
          value={formatCurrency(stats.totalValue)}
          icon={<Inventory />}
        />
      </Grid>
    </Grid>
  );
};

export default CatalogStats;