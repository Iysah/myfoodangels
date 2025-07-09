import { store } from '../store/root';
import env from '../config/env';
import { cloudinaryService } from './cloudinaryService';
import { filePickerService, FileInfo } from './filePickerService';

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
  private socket: WebSocket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    try {
      this.socket = new WebSocket(env.socketUrl);
      
      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.socket.onclose = () => {
        console.log('WebSocket disconnected');
        this.isConnected = false;
        this.handleReconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.isConnected = false;
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  private handleMessage(data: any) {
    console.log('Received message:', data);
    
    if (data.event === 'bad-request') {
      console.error('Bad request error:', data.message);
      // Handle bad request error
    } else if (data.event === 'receiver_message') {
      // Handle incoming message
      this.handleIncomingMessage(data.data);
    }
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
        name: '', // Will be populated from user data if available
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

    // Update the chat store with the new message
    store.chat.addMessage(newMessage);
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

  sendMessage(messageData: MessageData) {
    if (!this.socket || !this.isConnected) {
      console.error('WebSocket not connected');
      return false;
    }

    try {
      this.socket.send(JSON.stringify({
        event: 'send_message',
        data: messageData
      }));
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected() {
    return this.isConnected;
  }
}

export const socketService = new SocketService(); 