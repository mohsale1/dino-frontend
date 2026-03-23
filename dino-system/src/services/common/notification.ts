/**
 * Notification Service
 * Handles in-app notifications
 */

import type { AppNotification } from '../../types';

class NotificationService {
  private notifications: AppNotification[] = [];
  private notificationListeners: Array<(notification: AppNotification) => void> = [];
  private connectionListeners: Array<(connected: boolean) => void> = [];
  private connected: boolean = true; // Assume connected by default

  /**
   * Get all notifications
   */
  getNotifications(): AppNotification[] {
    return this.notifications;
  }

  /**
   * Add a notification
   */
  addNotification(notification: AppNotification): void {
    this.notifications = [notification, ...this.notifications];
    this.notifyNotificationListeners(notification);
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    this.notifications = this.notifications.map(notif =>
      notif.id === id ? { ...notif, isRead: true, readAt: new Date() } : notif
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notifications = this.notifications.map(notif => ({ 
      ...notif, 
      isRead: true, 
      readAt: new Date() 
    }));
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(notif => notif.id !== id);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notifications = [];
  }

  /**
   * Subscribe to new notifications
   */
  subscribe(listener: (notification: AppNotification) => void): () => void {
    this.notificationListeners.push(listener);
    return () => {
      this.notificationListeners = this.notificationListeners.filter(l => l !== listener);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(listener: (connected: boolean) => void): () => void {
    this.connectionListeners.push(listener);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(l => l !== listener);
    };
  }

  /**
   * Check if service is connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Set connection status
   */
  setConnected(connected: boolean): void {
    if (this.connected !== connected) {
      this.connected = connected;
      this.notifyConnectionListeners(connected);
    }
  }

  /**
   * Request browser notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission;
    }

    return Notification.permission;
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }

  private notifyNotificationListeners(notification: AppNotification): void {
    this.notificationListeners.forEach(listener => listener(notification));
  }

  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach(listener => listener(connected));
  }
}

export const notificationService = new NotificationService();