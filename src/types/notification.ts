import { User } from './user';

export type NotificationType = 
  | 'NEW_MESSAGE'
  | 'NEW_CONNECTION'
  | 'PROFILE_VIEW'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'VIDEO_LIKED'
  | 'COMMENT_ADDED'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  sender?: User;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}
