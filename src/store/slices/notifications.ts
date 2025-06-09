import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { Notification } from '../../types/notification';

interface NotificationResponse {
  _id: string;
  user: string;
  title: string;
  description: string;
  seen: boolean;
  updatedAt: string;
  createdAt: string;
}

interface ApiResponse {
  data: {
    notifications: NotificationResponse[];
  };
}

export class NotificationStore {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;
  refreshing = false;
  loadingMore = false;
  isLoading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async fetchNotifications(pageNumber: number, shouldRefresh: boolean) {
    if (shouldRefresh) {
      this.refreshing = true;
    } else if (pageNumber === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<ApiResponse>(`/general/notification?page=${pageNumber}&limit=10`);
      
      runInAction(() => {
        if (shouldRefresh || pageNumber === 1) {
          this.notifications = response.data.notifications.map(this.mapNotification);
          console.log('notifications:', response.data.notifications) 
        } else {
          this.notifications = [...this.notifications, ...response.data.notifications.map(this.mapNotification)];
        }
        this.updateUnreadCount();
      });

    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
        this.loading = false;
        this.refreshing = false;
        this.loadingMore = false;
      });
    }
  }

  private mapNotification(notification: NotificationResponse): Notification {
    return {
      id: notification._id,
      userId: notification.user,
      type: 'SYSTEM', // Default type since it's not provided in the API
      title: notification.title,
      message: notification.description,
      isRead: notification.seen,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  async markAsRead(notificationId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      await apiClient.put(`/general/notification/read/${notificationId}`);
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.isRead = true;
        this.updateUnreadCount();
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async markAllAsRead() {
    try {
      this.isLoading = true;
      this.error = null;
      
      await apiClient.put('/general/notification/read-all');
      runInAction(() => {
        this.notifications.forEach(n => n.isRead = true);
        this.unreadCount = 0;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      await apiClient.delete(`/general/notification/remove/${notificationId}`);
      runInAction(() => {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.updateUnreadCount();
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  private updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }
}
