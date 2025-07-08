
import { useState, useEffect } from 'react';
import { NotificationService, Notification } from '@/services/notificationService';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadNotifications = async () => {
      setLoading(true);
      try {
        const data = await NotificationService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error loading notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const addNotification = async (notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const newNotification = await NotificationService.addNotification(notification);
      if (newNotification) {
        setNotifications(prev => [newNotification, ...prev]);
        return newNotification;
      }
      return null;
    } catch (error) {
      console.error('Error adding notification:', error);
      return null;
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const success = await NotificationService.markAsRead(id);
      if (success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      const promises = notifications
        .filter(n => !n.is_read)
        .map(n => markAsRead(n.id!));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const success = await NotificationService.deleteNotification(id);
      if (success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  const clearAll = async () => {
    try {
      const promises = notifications.map(n => deleteNotification(n.id!));
      await Promise.all(promises);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return {
    notifications,
    loading,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  };
};
