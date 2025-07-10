import { User } from './user';

export interface MessageUser {
  _id: string;
  name: string;
  email: string;
  profileImg?: string;
  position?: string;
  title?: string;
  about?: string;
  location?: {
    country?: string;
    city?: string;
    _id?: string;
  };
  // Add other fields as needed (statistic, achievement, etc.)
}

export interface Message {
  id: string; // maps to _id
  sender: MessageUser;
  receiver: MessageUser;
  content: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  messageType?: 'text' | 'image' | 'video' | 'document';
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
