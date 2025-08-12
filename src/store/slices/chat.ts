import { makeAutoObservable } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { Conversation, Message, MessageUser } from '../../types/chat';

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
      
      // Check if user is authenticated
      if (!this.rootStore.auth.token) {
        throw new Error('User not authenticated');
      }
      
      const role = this.rootStore.auth.role?.toLowerCase();
      const endpoint = role === 'athlete' 
        ? `/general/message/athlete/history/${receiverId}`
        : `/general/message/scout/history/${receiverId}`;
      
      const response = await apiClient.get<any>(endpoint);
      
      // Map API response to Message interface
      if (response.data && Array.isArray(response.data)) {
        this.messages = response.data.map((msg: any) => ({
          id: msg._id,
          sender: {
            _id: msg.sender._id || msg.sender,
            name: msg.sender.name || msg.sender,
            email: msg.sender.email || '',
            profileImg: msg.sender.profileImg,
            position: msg.sender.position,
            title: msg.sender.title,
            about: msg.sender.about,
            location: msg.sender.location,
          },
          receiver: {
            _id: msg.receiver._id || msg.receiver,
            name: msg.receiver.name || msg.receiver,
            email: msg.receiver.email || '',
            profileImg: msg.receiver.profileImg,
            position: msg.receiver.position,
            title: msg.receiver.title,
            about: msg.receiver.about,
            location: msg.receiver.location,
          },
          content: msg.content,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileType: msg.fileType,
          messageType: msg.messageType,
          createdAt: msg.createdAt,
          updatedAt: msg.updatedAt,
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

  async sendMessageToUser(receiverId: string, content: string, messageType: string = 'text', fileUrl: string = '', fileName: string = '', fileType: string = '') {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Check if user is authenticated
      if (!this.rootStore.auth.token) {
        throw new Error('User not authenticated');
      }
      
      const role = this.rootStore.auth.role?.toLowerCase();
      const endpoint = role === 'athlete' 
        ? '/general/message/athlete/send'
        : '/general/message/scout/send';
      
      const messageData = {
        receiver: receiverId,
        content,
                  messageType: messageType as 'text' | 'image' | 'video' | 'document',
        fileUrl,
        fileName,
        fileType
      };
      
      const response = await apiClient.post<any>(endpoint, messageData);
      
      // Add the sent message to the local state
      if (response.data) {
        const newMessage = {
          id: response.data._id,
          sender: {
            _id: this.rootStore.auth.userData?.userID || '',
            name: this.rootStore.auth.userData?.fullName || '',
            email: this.rootStore.auth.userData?.email || '',
            profileImg: this.rootStore.auth.userData?.profileImg || '',
            position: this.rootStore.auth.userData?.position || '',
            title: this.rootStore.auth.userData?.position || '',
            about: this.rootStore.auth.userData?.about || '',
            location: {
              country: this.rootStore.auth.userData?.country || '',
              city: this.rootStore.auth.userData?.city || '',
            },
          },
          receiver: {
            _id: receiverId,
            name: '',
            email: '',
            profileImg: '',
            position: '',
            title: '',
            about: '',
            location: {},
          },
          content,
          fileUrl,
          fileName,
          fileType,
          messageType,
          createdAt: response.data.createdAt || new Date().toISOString(),
          updatedAt: response.data.updatedAt || new Date().toISOString(),
        };
        
        this.messages.push(newMessage as Message);
      }
      
      return response;
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

  addMessage = (message: Message) => {
    this.messages.push(message);
  }

  clearMessages = () => {
    this.messages = [];
  }
}
