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
}
