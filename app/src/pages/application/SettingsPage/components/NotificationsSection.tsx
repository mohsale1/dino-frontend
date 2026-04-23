/**
 * NotificationsSection Component
 * 
 * Clean, professional notification preferences
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Switch,
  Divider,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Save,
  Notifications as NotificationsIcon,
  Email,
  Sms,
  PhoneAndroid,
  ShoppingCart,
  Inventory,
  Assessment,
  Feedback,
} from '@mui/icons-material';

export interface NotificationsSectionProps {
  notificationSettings?: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    orderAlerts: boolean;
    lowStockAlerts: boolean;
    dailyReports: boolean;
    customerFeedback: boolean;
  };
  onSave?: (data: any) => Promise<void>;
}

const NotificationsSection: React.FC<NotificationsSectionProps> = ({
  notificationSettings,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    emailNotifications: notificationSettings?.emailNotifications ?? true,
    smsNotifications: notificationSettings?.smsNotifications ?? false,
    pushNotifications: notificationSettings?.pushNotifications ?? true,
    orderAlerts: notificationSettings?.orderAlerts ?? true,
    lowStockAlerts: notificationSettings?.lowStockAlerts ?? true,
    dailyReports: notificationSettings?.dailyReports ?? false,
    customerFeedback: notificationSettings?.customerFeedback ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setSaving(true);
      await onSave(formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save notifications:', error);
    } finally {
      setSaving(false);
    }
  };

  const NotificationToggle = ({
    icon,
    label,
    description,
    field,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    field: keyof typeof formData;
  }) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#374151',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: '#1a1a1a',
              mb: 0.25,
            }}
          >
            {label}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: '#6b7280',
              fontSize: '0.8125rem',
            }}
          >
            {description}
          </Typography>
        </Box>
      </Box>
      <Switch
        checked={formData[field]}
        onChange={(e) => handleChange(field, e.target.checked)}
        sx={{
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#1a1a1a',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#1a1a1a',
          },
        }}
      />
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.125rem',
            color: '#1a1a1a',
            mb: 0.5,
          }}
        >
          Notification Preferences
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#6b7280',
            fontSize: '0.875rem',
          }}
        >
          Manage how you receive notifications and alerts
        </Typography>
      </Box>

      <Box sx={{ p: 3 }}>
        {/* Notification Channels */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1a1a1a',
              mb: 2,
            }}
          >
            Notification Channels
          </Typography>

          <NotificationToggle
            icon={<Email sx={{ fontSize: 20 }} />}
            label="Email Notifications"
            description="Receive notifications via email"
            field="emailNotifications"
          />
          <Divider />

          <NotificationToggle
            icon={<Sms sx={{ fontSize: 20 }} />}
            label="SMS Notifications"
            description="Receive notifications via text message"
            field="smsNotifications"
          />
          <Divider />

          <NotificationToggle
            icon={<PhoneAndroid sx={{ fontSize: 20 }} />}
            label="Push Notifications"
            description="Receive push notifications on your device"
            field="pushNotifications"
          />
        </Box>

        <Divider sx={{ my: 3, borderColor: '#e5e7eb' }} />

        {/* Alert Types */}
        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              fontSize: '1rem',
              color: '#1a1a1a',
              mb: 2,
            }}
          >
            Alert Types
          </Typography>

          <NotificationToggle
            icon={<ShoppingCart sx={{ fontSize: 20 }} />}
            label="Order Alerts"
            description="Get notified when new orders are placed"
            field="orderAlerts"
          />
          <Divider />

          <NotificationToggle
            icon={<Inventory sx={{ fontSize: 20 }} />}
            label="Low Stock Alerts"
            description="Get notified when inventory is running low"
            field="lowStockAlerts"
          />
          <Divider />

          <NotificationToggle
            icon={<Assessment sx={{ fontSize: 20 }} />}
            label="Daily Reports"
            description="Receive daily summary reports"
            field="dailyReports"
          />
          <Divider />

          <NotificationToggle
            icon={<Feedback sx={{ fontSize: 20 }} />}
            label="Customer Feedback"
            description="Get notified of customer reviews and feedback"
            field="customerFeedback"
          />
        </Box>

        {/* Action Buttons */}
        {hasChanges && (
          <Box
            sx={{
              mt: 3,
              pt: 3,
              borderTop: '1px solid #f3f4f6',
              display: 'flex',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              justifyContent: { xs: 'stretch', sm: 'flex-end' },
              gap: 2,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => {
                setFormData({
                  emailNotifications: notificationSettings?.emailNotifications ?? true,
                  smsNotifications: notificationSettings?.smsNotifications ?? false,
                  pushNotifications: notificationSettings?.pushNotifications ?? true,
                  orderAlerts: notificationSettings?.orderAlerts ?? true,
                  lowStockAlerts: notificationSettings?.lowStockAlerts ?? true,
                  dailyReports: notificationSettings?.dailyReports ?? false,
                  customerFeedback: notificationSettings?.customerFeedback ?? true,
                });
                setHasChanges(false);
              }}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                borderColor: '#e5e7eb',
                color: '#374151',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  borderColor: '#9ca3af',
                  backgroundColor: '#f9fafb',
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 1.5,
                px: 3,
                backgroundColor: '#1a1a1a',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: '#374151',
                },
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default NotificationsSection;
