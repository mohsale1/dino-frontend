/**
 * Notification Types
 * 
 * Application notification types and interfaces.
 */

export type NotificationTypeEnum = 
  | 'order_placed'
  | 'order_confirmed' 
  | 'order_ready'
  | 'order_delivered'
  | 'payment_received'
  | 'system_alert';

export type NotificationType = NotificationTypeEnum;

export interface AppNotification {
  id: string;
  recipient_id: string;
  recipient_type: 'user' | 'venue' | 'admin';
  notification_type: NotificationTypeEnum;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  createdAt: string;
  read_at?: string;
  // Legacy camelCase properties for compatibility
  recipientId?: string;
  recipientType?: 'user' | 'venue' | 'admin';
  notificationType?: NotificationTypeEnum;
  isRead?: boolean;
  readAt?: Date;
}