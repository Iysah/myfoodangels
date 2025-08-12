import { io, Socket } from 'socket.io-client';
import env from '../config/env';
import { store } from '../store/root';
import { cloudinaryService } from './cloudinaryService';
import { filePickerService, FileInfo } from './filePickerService';
import { Message } from '../types/chat';

interface MessageData {
  sender: string;
  receiver: string;
  content: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  messageType: 'text' | 'image' | 'video' | 'document';
}

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket) return;

    const token = store.auth.token;
    if (!token) {
      console.error('No authentication token available');
      return;
    }

    this.socket = io(env.socketUrl, {
      transports: ['websocket'],
      forceNew: true,
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
    });

    this.socket.on('receive_message', (data: MessageData) => {
      console.log('Received message:', data);
      this.handleIncomingMessage(data);
    });

    this.socket.on('bad-request', (data: any) => {
      console.error('Bad request error:', data.message);
      // You might want to show this error to the user
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
    });

    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  sendMessage(messageData: MessageData) {
    if (!this.socket || !this.socket.connected) {
      console.error('Socket.IO not connected');
      return false;
    }
    
    console.log('Sending message:', messageData);
    this.socket.emit('send_message', messageData);
    return true;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isSocketConnected() {
    return this.socket?.connected ?? false;
  }

  private handleIncomingMessage(messageData: MessageData) {
    // Add the new message to the chat store
    const newMessage = {
      id: Date.now().toString(), // Generate temporary ID
      conversationId: messageData.sender, // Use sender as conversation ID
      senderId: messageData.sender,
      content: messageData.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messageType: messageData.messageType,
      fileUrl: messageData.fileUrl,
      fileName: messageData.fileName,
      fileType: messageData.fileType,
      sender: {
        id: messageData.sender,
        name: '',
        email: '',
        profileImg: '',
        role: '',
      },
      receiver: {
        id: messageData.receiver,
        name: '',
        email: '',
        profileImg: '',
        role: '',
      }
    };
    store.chat.addMessage(newMessage as unknown as Message);
  }

  // Method to handle file uploads
  async uploadFile(file: FileInfo, messageType: 'image' | 'video' | 'document') {
    try {
      // Validate file size (10MB max)
      if (!filePickerService.validateFileSize(file.size, 10)) {
        throw new Error('File size too large. Maximum size is 10MB.');
      }

      // Upload to Cloudinary
      const uploadOptions = {
        fileType: messageType,
        quality: messageType === 'image' ? 80 : undefined,
        maxWidth: messageType === 'image' ? 1200 : undefined,
        maxHeight: messageType === 'image' ? 1200 : undefined,
      };

      const result = await cloudinaryService.uploadFile(file.uri, uploadOptions);

      return {
        fileUrl: result.secure_url,
        fileName: file.name,
        fileType: result.format || file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  // Method to pick and upload a file
  async pickAndUploadFile(messageType: 'image' | 'video' | 'document'): Promise<{
    fileUrl: string;
    fileName: string;
    fileType: string;
  } | null> {
    try {
      let fileInfo: FileInfo | null = null;

      // Pick file based on type
      switch (messageType) {
        case 'image':
          fileInfo = await filePickerService.pickImage('library');
          break;
        case 'video':
          fileInfo = await filePickerService.pickVideo('library');
          break;
        case 'document':
          fileInfo = await filePickerService.pickDocument();
          break;
      }

      if (!fileInfo) {
        return null;
      }

      // Upload the file
      return await this.uploadFile(fileInfo, messageType);
    } catch (error) {
      console.error('Pick and upload error:', error);
      throw error;
    }
  }
}

export const socketService = new SocketService(); 