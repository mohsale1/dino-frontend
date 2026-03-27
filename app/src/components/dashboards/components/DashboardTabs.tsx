import React from 'react';
import {
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Dashboard,
  Analytics,
  MenuBook,
  TableRestaurant,
  Payment,
} from '@mui/icons-material';
import { useAuth } from '../../../contexts/common/Auth';

interface DashboardTabsProps {
  currentTab: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({
  currentTab,
  onTabChange,
}) => {
  const { hasBackendPermission } = useAuth();

  const shouldShowTabs = hasBackendPermission('application.dashboard.read');

  if (!shouldShowTabs) {
    return null;
  }

  // Define all possible tabs with their flags
  const allTabs = [
    {
      flag: 'showOverviewTab',
      icon: <Dashboard />,
      label: 'Overview',
      originalIndex: 0
    },
    {
      flag: 'showSalesAnalyticsTab',
      icon: <Analytics />,
      label: 'Sales Analytics',
      originalIndex: 1
    },
    {
      flag: 'showMenuPerformanceTab',
      icon: <MenuBook />,
      label: 'Menu Performance',
      originalIndex: 2
    },
    {
      flag: 'showTablesOrdersTab',
      icon: <TableRestaurant />,
      label: 'Tables & Orders',
      originalIndex: 3
    },
    {
      flag: 'showPaymentsTab',
      icon: <Payment />,
      label: 'Payments',
      originalIndex: 4
    }
  ];

  // Feature flags removed - show all tabs
  const visibleTabs = allTabs;

  // If no tabs are visible, don't render anything
  if (visibleTabs.length === 0) {
    return null;
  }

  // Find the current visible tab index based on the original currentTab
  const currentVisibleTabIndex = visibleTabs.findIndex(tab => tab.originalIndex === currentTab);
  const safeCurrentTab = currentVisibleTabIndex >= 0 ? currentVisibleTabIndex : 0;

  // Handle tab change - convert visible index back to original index
  const handleTabChange = (event: React.SyntheticEvent, newVisibleIndex: number) => {
    const selectedTab = visibleTabs[newVisibleIndex];
    if (selectedTab) {
      onTabChange(event, selectedTab.originalIndex);
    }
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }} data-tour="quick-actions">
      <Tabs
        value={safeCurrentTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
      >
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.originalIndex}
            icon={tab.icon}
            label={tab.label}
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default DashboardTabs;