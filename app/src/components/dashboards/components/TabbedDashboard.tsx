import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
  { label: 'Overview',        icon: <Dashboard sx={{ fontSize: 18 }} /> },
  { label: 'Sales & Revenue', icon: <TrendingUp sx={{ fontSize: 18 }} /> },
  { label: 'Menu & Items',    icon: <Restaurant sx={{ fontSize: 18 }} /> },
  { label: 'Tables & Orders', icon: <TableRestaurant sx={{ fontSize: 18 }} /> },
];

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
      <Skeleton variant="rounded" height={260} sx={{ borderRadius: 2 }} />
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
          borderBottom: '1px solid #e2e8f0',
          px: 2,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          aria-label="dashboard tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 46,
            '& .MuiTabs-indicator': {
              backgroundColor: '#1976d2',
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              minHeight: 46,
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.secondary',
              px: 2.5,
              gap: 0.75,
              transition: 'color 0.2s, background-color 0.2s',
              '&.Mui-selected': {
                color: '#1976d2',
                fontWeight: 600,
              },
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
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