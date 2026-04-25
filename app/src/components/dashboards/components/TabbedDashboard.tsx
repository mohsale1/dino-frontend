import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  Restaurant,
  TableRestaurant,
} from '@mui/icons-material';

import OverviewTab from './tabs/OverviewTab';
import SalesTab from './tabs/SalesTab';
import ItemsTab from './tabs/ItemsTab';
import TablesOrdersTab from './tabs/TablesOrdersTab';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabbedDashboardData {
  stats?: Record<string, any>;
  analytics?: Record<string, any>;
  recentActivity?: any[];
  tableStatuses?: any[];
  summary?: Record<string, any>;
}

interface TabbedDashboardProps {
  dashboardData: TabbedDashboardData | null;
  loading: boolean;
  lastUpdated: Date | null;
}

// ---------------------------------------------------------------------------
// Tab panel
// ---------------------------------------------------------------------------

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

const TAB_DEFINITIONS = [
  { label: 'Overview',        icon: <Dashboard sx={{ fontSize: 16 }} /> },
  { label: 'Sales & Revenue', icon: <TrendingUp sx={{ fontSize: 16 }} /> },
  { label: 'Menu & Items',    icon: <Restaurant sx={{ fontSize: 16 }} /> },
  { label: 'Tables & Orders', icon: <TableRestaurant sx={{ fontSize: 16 }} /> },
];

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: '32px' },
        pt: 3,
        pb: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        bgcolor: '#f8fafc',
      }}
    >
      <Skeleton
        variant="rounded"
        height={220}
        sx={{ borderRadius: '12px', bgcolor: '#e0e0e0' }}
      />
      <Skeleton
        variant="rounded"
        height={320}
        sx={{ borderRadius: '12px', bgcolor: '#e0e0e0' }}
      />
      <Skeleton
        variant="rounded"
        height={260}
        sx={{ borderRadius: '12px', bgcolor: '#e0e0e0' }}
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const TabbedDashboard: React.FC<TabbedDashboardProps> = ({
  dashboardData,
  loading,
}) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const analytics      = dashboardData?.analytics      ?? {};
  const recentActivity = dashboardData?.recentActivity ?? [];
  const tableStatuses  = dashboardData?.tableStatuses  ?? [];
  const stats          = dashboardData?.stats          ?? {};
  const summary        = dashboardData?.summary        ?? {};

  return (
    <Box sx={{ bgcolor: '#f8fafc' }}>

      {/* Tab navigation bar */}
      <Paper
        elevation={0}
        square
        sx={{
          bgcolor: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          borderTop: '1px solid #e0e0e0',
          mt: 3,
          px: { xs: 2, sm: '32px' },
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976D2',
              height: 2,
              borderRadius: '2px 2px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 48,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#666666',
              px: 2,
              gap: 0.75,
              transition: 'background-color 0.15s ease, color 0.15s ease',
              '& .MuiTab-iconWrapper': {
                color: 'inherit',
              },
              '&.Mui-selected': {
                color: '#1C1C1E',
                fontWeight: 600,
              },
              '&:hover': {
                bgcolor: '#f7f9fa',
                color: '#1C1C1E',
              },
            },
          }}
        >
          {TAB_DEFINITIONS.map((tab, index) => (
            <Tab
              key={index}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              id={`dashboard-tab-${index}`}
              aria-controls={`dashboard-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Tab panels */}
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <>
          <TabPanel value={currentTab} index={0}>
            <OverviewTab
              dashboardData={{ analytics, recentActivity, summary } as any}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            <SalesTab
              dashboardData={{ stats, analytics, summary } as any}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            <ItemsTab
              dashboardData={{ stats, analytics, summary } as any}
            />
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            <TablesOrdersTab
              dashboardData={{ tableStatuses, analytics, summary, recentActivity } as any}
            />
          </TabPanel>
        </>
      )}

    </Box>
  );
};

export default TabbedDashboard;
