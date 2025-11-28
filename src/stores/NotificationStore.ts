import { makeAutoObservable, runInAction } from 'mobx';
import { listenToDocument, updateDocument } from '../services/firebase/firestore';
import { Timestamp } from 'firebase/firestore';

export interface NotificationModel {
  date: Date | Timestamp | string;
  email?: string;
  firstName?: string;
  lastName?: string;
  message: string;
  read: boolean;
  status?: string;
  type: string;
  userId?: string;
}

class NotificationStore {
  notifications: NotificationModel[] = [];
  isLoading: boolean = false;
  userId: string | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  get unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  setupRealtimeListener = (userId: string) => {
    if (this.userId === userId && this.unsubscribe) return; // Already listening
    
    this.cleanup(); // Cleanup previous listener
    this.userId = userId;
    this.isLoading = true;

    this.unsubscribe = listenToDocument<{ notifications: NotificationModel[] }>(
      'notifications',
      userId,
      (doc) => {
        runInAction(() => {
          if (doc && doc.notifications) {
             // Sort by date desc
             this.notifications = doc.notifications.sort((a, b) => {
                const dateA = this.parseDate(a.date);
                const dateB = this.parseDate(b.date);
                return dateB.getTime() - dateA.getTime();
             });
          } else {
            this.notifications = [];
          }
          this.isLoading = false;
        });
      }
    );
  }

  cleanup = () => {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.userId = null;
    this.notifications = [];
  }

  markAsRead = async (notification: NotificationModel) => {
    if (!this.userId) return;
    
    // Optimistic update
    const originalNotifications = [...this.notifications];
    const updatedNotifications = this.notifications.map(n => {
      if (this.isSameNotification(n, notification)) {
        return { ...n, read: true };
      }
      return n;
    });
    
    this.notifications = updatedNotifications;

    try {
      await updateDocument('notifications', this.userId, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Failed to mark notification as read", error);
      runInAction(() => {
        this.notifications = originalNotifications; // Revert on error
      });
    }
  }

  markAllAsRead = async () => {
    if (!this.userId) return;

    const originalNotifications = [...this.notifications];
    const updatedNotifications = this.notifications.map(n => ({ ...n, read: true }));
    
    this.notifications = updatedNotifications; // Optimistic update
    
    try {
      await updateDocument('notifications', this.userId, { notifications: updatedNotifications });
    } catch (error) {
      console.error("Failed to mark all as read", error);
       runInAction(() => {
        this.notifications = originalNotifications; // Revert on error
      });
    }
  }

  private parseDate(date: any): Date {
    if (date instanceof Timestamp) return date.toDate();
    if (date?.toDate) return date.toDate();
    if (typeof date === 'string') return new Date(date);
    if (date instanceof Date) return date;
    return new Date(); // Fallback
  }

  private isSameNotification(n1: NotificationModel, n2: NotificationModel): boolean {
     const t1 = this.parseDate(n1.date).getTime();
     const t2 = this.parseDate(n2.date).getTime();
     return n1.message === n2.message && t1 === t2 && n1.type === n2.type;
  }
}

export { NotificationStore };
export default new NotificationStore();
