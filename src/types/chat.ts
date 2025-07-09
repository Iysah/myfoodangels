import { User } from './user';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    profileImg?: string;
    role?: string;
  };
  receiver?: {
    id: string;
    name: string;
    email: string;
    profileImg?: string;
    role?: string;
  };
  messageType?: 'text' | 'image' | 'video' | 'document';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
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
