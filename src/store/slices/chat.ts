import { makeAutoObservable } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { Conversation, Message } from '../../types/chat';

export class ChatStore {
  conversations: Conversation[] = [];
  currentConversation: Conversation | null = null;
  messages: Message[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async fetchConversations() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<Conversation[]>('/general/message/athlete/chat-list');
      this.conversations = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async startConversation(userId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<Conversation>('/chat/conversations', { userId });
      this.conversations.push(response);
      return response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchMessages(conversationId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<Message[]>(`/chat/conversations/${conversationId}/messages`);
      this.messages = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchChatHistory(receiverId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const role = this.rootStore.auth.role?.toLowerCase();
      const endpoint = role === 'athlete' 
        ? `/general/message/athlete/history/${receiverId}`
        : `/general/message/scout/history/${receiverId}`;
      
      const response = await apiClient.get<any>(endpoint);
      
      // Transform the response to match our Message interface
      if (response.data && Array.isArray(response.data)) {
        this.messages = response.data.map((msg: any) => ({
          id: msg._id,
          conversationId: receiverId,
          senderId: msg.sender._id,
          content: msg.content,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
          messageType: msg.messageType || 'text',
          fileUrl: msg.fileUrl || '',
          fileName: msg.fileName || '',
          fileType: msg.fileType || '',
          sender: {
            id: msg.sender._id,
            name: msg.sender.name,
            email: msg.sender.email,
            profileImg: msg.sender.profileImg,
            role: msg.sender.position || '',
          },
          receiver: {
            id: msg.receiver._id,
            name: msg.receiver.name,
            email: msg.receiver.email,
            profileImg: msg.receiver.profileImg,
            role: msg.receiver.position || '',
          }
        }));
      } else {
        this.messages = [];
      }
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async sendMessage(conversationId: string, content: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<Message>(`/chat/conversations/${conversationId}/messages`, { content });
      this.messages.push(response);
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async markAsRead(conversationId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      await apiClient.put(`/chat/conversations/${conversationId}/read`);
      const conversation = this.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.unreadCount = 0;
      }
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  setCurrentConversation(conversation: Conversation | null) {
    this.currentConversation = conversation;
    if (conversation) {
      this.fetchMessages(conversation.id);
    } else {
      this.messages = [];
    }
  }

  addMessage(message: Message) {
    this.messages.push(message);
  }

  clearMessages() {
    this.messages = [];
  }
}
