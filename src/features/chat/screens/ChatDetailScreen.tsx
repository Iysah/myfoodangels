import React, { FC, useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import { theme } from '../../../config/theme';
import Constants from 'expo-constants';
import { ArrowLeft, EllipsisVertical, Send, Paperclip, Image as ImageIcon, Video, FileText, MessagesSquare } from 'lucide-react-native';
import { useRoute } from '@react-navigation/native';
import { typography } from '../../../config/typography';
import { spacing } from '../../../config/spacing';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/root';
import { socketService } from '../../../services/socketService';
import { formatTime } from '../../../utils/dateFormat';
import { Message } from '../../../types/chat';
import { useToast } from '../../../../components/ui/toast';

interface ChatDetailScreenProps {
  navigation: any;
}

const ChatDetailScreen: FC<ChatDetailScreenProps> = observer(({ navigation }) => {
  const route = useRoute();
  const { toast } = useToast();
  const { chatId, receiverName, receiverImage } = route.params as { 
    chatId: string; 
    receiverName?: string; 
    receiverImage?: string;
  };
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  // const { userData } = store.auth;
  const { userData } = store.auth;
  // console.log('userData', userData?.userID);

  useEffect(() => {
    // Connect to socket when component mounts
    socketService.connect();
    
    // Fetch chat history
    fetchChatHistory();
    
    // Cleanup on unmount
    return () => {
      // Don't disconnect socket here as it might be used by other screens
    };
  }, [chatId]);

  // Scroll to bottom when a new message arrives
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [store.chat.messages.length]);

  // Early return if userData is not available
  if (!userData) {
    return (
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background, paddingTop: Constants.statusBarHeight }}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  // console.log('userData', userData);

  const fetchChatHistory = async () => {
    try {
      await store.chat.fetchChatHistory(chatId);
    } catch (error) {
      console.error('Failed to fetch chat history:', error);

      toast({
        title: 'Error',
        description: 'Failed to load chat history',
        variant: 'error',
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    const messageData = {
      sender: userData.userID,
      receiver: chatId,
      content: newMessage.trim(),
      fileUrl: '',
      fileName: '',
      fileType: '',
      messageType: 'text' as const
    };

    await sendMessage(messageData);
  };

  const handleSendFile = async (messageType: 'image' | 'video' | 'document') => {
    if (uploading) return;

    setUploading(true);
    try {
      const fileData = await socketService.pickAndUploadFile(messageType);
      
      if (fileData) {
        const messageData = {
          sender: userData.userID,
          receiver: chatId,
          content: `Sent a ${messageType}`,
          fileUrl: fileData.fileUrl,
          fileName: fileData.fileName,
          fileType: fileData.fileType,
          messageType: messageType
        };

        await sendMessage(messageData);
      }
    } catch (error) {
      console.error('Error sending file:', error);
      Alert.alert('Error', 'Failed to send file. Please try again.');
    } finally {
      setUploading(false);
      setShowFileOptions(false);
    }
  };

  const sendMessage = async (messageData: any) => {
    setSending(true);
    try {
      // Send via socket only, matching the documented payload
      const sent = socketService.sendMessage(messageData);
      if (sent) {
        // Add message to local state immediately for optimistic UI
        const tempMessage = {
          id: Date.now().toString(),
          sender: messageData.sender, // userID string
          receiver: messageData.receiver, // userID string
          content: messageData.content,
          fileUrl: messageData.fileUrl,
          fileName: messageData.fileName,
          fileType: messageData.fileType,
          messageType: messageData.messageType,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        store.chat.addMessage(tempMessage as unknown as Message);
        setNewMessage('');
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        Alert.alert('Error', 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    // Support both string and object sender types
    const senderId = typeof item.sender === 'string' ? item.sender : item.sender?._id;
    // console.log('senderId', senderId);
    const isOwnMessage = senderId === userData.userID;
    // console.log('Is own message:', isOwnMessage);
    
    const renderMessageContent = () => {
      if (item.messageType === 'image' && item.fileUrl) {
        return (
          <View style={styles.fileContainer}>
            <Image source={{ uri: item.fileUrl }} style={styles.fileImage} />
            <Text style={styles.fileName}>{item.fileName}</Text>
          </View>
        );
      } else if (item.messageType === 'video' && item.fileUrl) {
        return (
          <View style={styles.fileContainer}>
            <View style={styles.videoPlaceholder}>
              <Video size={24} color={isOwnMessage ? '#fff' : theme.colors.text.primary} />
              <Text style={[styles.fileName, { color: isOwnMessage ? '#fff' : theme.colors.text.primary }]}> 
                {item.fileName}
              </Text>
            </View>
          </View>
        );
      } else if (item.messageType === 'document' && item.fileUrl) {
        return (
          <View style={styles.fileContainer}>
            <View style={styles.documentPlaceholder}>
              <FileText size={24} color={isOwnMessage ? '#fff' : theme.colors.text.primary} />
              <Text style={[styles.fileName, { color: isOwnMessage ? '#fff' : theme.colors.text.primary }]}> 
                {item.fileName}
              </Text>
            </View>
          </View>
        );
      } else {
        return (
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
        );
      }
    };
    
    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        {/* Show sender name for other messages */}
        {item.sender._id !== userData.userID && item.sender?.name && (
          <Text style={styles.senderName}>{item.sender.name}</Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownBubble : styles.otherBubble
        ]}>
          {renderMessageContent()}
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <View style={GLOBALSTYLES.row}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.profileWrapper}>
          <Image 
            source={receiverImage ? { uri: receiverImage } : require('../../../../assets/profile.png')} 
            style={styles.avatar} 
          />
          <View style={styles.textWrapper}>
            <Text style={styles.profileName}>{receiverName || 'Chat'}</Text>
            <Text style={styles.status}>
              {socketService.isSocketConnected() ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
      </View>

      <EllipsisVertical size={24} color={theme.colors.text.primary} />
    </View>
  );

  const renderInput = () => (
    <View style={styles.inputContainer}>
      <TouchableOpacity 
        style={styles.attachButton}
        onPress={() => setShowFileOptions(!showFileOptions)}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={theme.colors.text.secondary} />
        ) : (
          <Paperclip size={20} color={theme.colors.text.secondary} />
        )}
      </TouchableOpacity>
      
      <TextInput
        style={styles.textInput}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message..."
        placeholderTextColor={theme.colors.text.secondary}
        multiline
        maxLength={1000}
      />
      
      <TouchableOpacity 
        style={[
          styles.sendButton,
          (!newMessage.trim() || sending) && styles.sendButtonDisabled
        ]}
        onPress={handleSendMessage}
        disabled={!newMessage.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Send size={20} color="#fff" />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderFileOptions = () => {
    if (!showFileOptions) return null;

    return (
      <View style={styles.fileOptionsContainer}>
        <TouchableOpacity 
          style={styles.fileOption}
          onPress={() => handleSendFile('image')}
          disabled={uploading}
        >
          <ImageIcon size={24} color={theme.colors.primary} />
          <Text style={styles.fileOptionText}>Image</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fileOption}
          onPress={() => handleSendFile('video')}
          disabled={uploading}
        >
          <Video size={24} color={theme.colors.primary} />
          <Text style={styles.fileOptionText}>Video</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fileOption}
          onPress={() => handleSendFile('document')}
          disabled={uploading}
        >
          <FileText size={24} color={theme.colors.primary} />
          <Text style={styles.fileOptionText}>Document</Text>
        </TouchableOpacity>
      </View>
    );
  };



  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, paddingTop: Constants.statusBarHeight }}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {renderHeader()}

        {store.chat.isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading chat...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={store.chat.messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            style={styles.messagesList}
            contentContainerStyle={styles.messagesContainer}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MessagesSquare size={24} color={theme.colors.text.primary} />
                <Text style={styles.emptyText}>Say hello to start the conversation!</Text>
              </View>
            }
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
        
        
        {renderFileOptions()}
        {renderInput()}
      </KeyboardAvoidingView>
    </SafeAreaProvider>
  );
});

export default ChatDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  headerWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: spacing.sm,
  },
  textWrapper: {
    flexDirection: 'column',
  },
  profileName: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  status: {
    fontSize: typography.fontSize.xs,
    color: theme.colors.text.secondary,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#E8E8E8',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: typography.fontSize.sm,
    lineHeight: 20,
  },
  ownMessageText: {
    color: '#fff',
  },
  otherMessageText: {
    color: theme.colors.text.primary,
  },
  messageTime: {
    fontSize: typography.fontSize.xs,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: theme.colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: spacing.xl,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  attachButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.lg,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,

    maxHeight: 100,
    marginBottom: spacing.lg,
    fontSize: typography.fontSize.sm,
    color: theme.colors.text.primary,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    padding: spacing.sm,
    marginLeft: spacing.sm,
    marginBottom: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  fileContainer: {
    marginBottom: 8,
  },
  fileImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 4,
  },
  fileName: {
    fontSize: typography.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  videoPlaceholder: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    minWidth: 150,
  },
  documentPlaceholder: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    minWidth: 150,
  },
  fileOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  fileOption: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
  },
  fileOptionText: {
    fontSize: typography.fontSize.xs,
    color: theme.colors.text.primary,
    marginTop: 4,
  },
  senderName: {
    fontSize: typography.fontSize.xs,
    color: theme.colors.text.secondary,
    marginBottom: 2,
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: spacing.sm,
  },
});