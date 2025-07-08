import { supabase } from '@/lib/supabase';

export interface Notification {
  id?: number;
  user_id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at?: string;
  updated_at?: string;
}

export class NotificationService {
  static async getNotifications(): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const stored = localStorage.getItem('notifications');
        return stored ? JSON.parse(stored) : [];
      }

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getNotifications:', error);
      return [];
    }
  }

  static async addNotification(notification: Omit<Notification, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Notification | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const stored = localStorage.getItem('notifications');
        const notifications = stored ? JSON.parse(stored) : [];
        const newNotification = { ...notification, id: Date.now() };
        notifications.unshift(newNotification);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        return newNotification;
      }

      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding notification:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addNotification:', error);
      return null;
    }
  }

  static async markAsRead(id: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const stored = localStorage.getItem('notifications');
        const notifications = stored ? JSON.parse(stored) : [];
        const index = notifications.findIndex((n: Notification) => n.id === id);
        if (index !== -1) {
          notifications[index].is_read = true;
          localStorage.setItem('notifications', JSON.stringify(notifications));
        }
        return true;
      }

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markAsRead:', error);
      return false;
    }
  }

  static async deleteNotification(id: number): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const stored = localStorage.getItem('notifications');
        const notifications = stored ? JSON.parse(stored) : [];
        const filteredNotifications = notifications.filter((n: Notification) => n.id !== id);
        localStorage.setItem('notifications', JSON.stringify(filteredNotifications));
        return true;
      }

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting notification:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteNotification:', error);
      return false;
    }
  }

  static async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      if (!userId) {
        // Fallback to localStorage if no authenticated user
        const stored = localStorage.getItem('notifications');
        const notifications = stored ? JSON.parse(stored) : [];
        return notifications.filter((n: Notification) => !n.is_read).length;
      }

      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        console.error('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getUnreadCount:', error);
      return 0;
    }
  }
} 