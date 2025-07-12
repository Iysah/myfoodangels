import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../config/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import { chatData } from '../../../data/chatData';
import SearchBar from '../../shared/components/SearchBar';
import { apiClient } from '../../../services/apiClient';
import { formatDate, formatRelativeTime, formatTime } from '../../../utils/dateFormat';
import { spacing } from '../../../config/spacing';
import { store } from '../../../store/root';

interface Chat {
  _id: string;
  lastMessage: string,
  fileUrl: string,
  messageType: string,
  timestamp: string,
  userId: string,
  name: string,
  email: string,
  unseenCount: number
}

const ChatListScreen = () => {
  const navigation = useNavigation();

  const [conversations, setConversations] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<any>(`/general/message/athlete/chat-list`);
      console.log(response)
      setLoading(false)
      setConversations(response.data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchScoutConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<any>(`/general/message/scout/chat-list`);
      setLoading(false)
      console.log(response)
      setConversations(response.data);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
      setError("Failed to load chats. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store.auth.role?.toLowerCase() === 'athlete') {
      fetchConversations();
    } else if (store.auth.role?.toLowerCase() === 'scout') {
      fetchScoutConversations();
    }
  }, [store.auth.role]);

  const handleSearch = () => {

  }

  const renderItem = ({ item }: {item: Chat}) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => (navigation as any).navigate('ChatDetail', { 
        chatId: item?.userId,
        receiverName: item?.name,
        receiverImage: item?.fileUrl
      })}
      activeOpacity={0.7}
    >
      <View style={styles.avatarWrapper}>
        <Image source={item?.fileUrl ? { uri: item.fileUrl} : require('../../../../assets/profile.png')} style={styles.avatar} />
        {/* {item.isOnline && <View style={GLOBALSTYLES.onlineDot} />} */}
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.message} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.timeOrDate}>{formatRelativeTime(item?.timestamp)}</Text>
        {item?.unseenCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item?.unseenCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  // if (loading) {
  //   return (
  //       <View style={styles.centered}>
  //           <ActivityIndicator size="large" color="#007AFF" />
  //           <Text style={styles.loadingText}>Loading chats...</Text>
  //       </View>
  //   );
  // }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={fetchConversations} style={styles.buttonContainer}>
          <Text style={styles.buttonText}>Tap to Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={GLOBALSTYLES.title}>Messages</Text>
          <SearchBar placeholder='Search Messages' onPress={handleSearch} />
        </View>

          {loading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading chats...</Text>
            </View>
          ) :           
            <View style={styles.chatContainer}>
              <FlatList
                data={conversations}
                keyExtractor={item => item?._id}
                renderItem={renderItem}
                ItemSeparatorComponent={() => <View style={styles.divider} />}
                contentContainerStyle={{ paddingVertical: 8 }}
              />
            </View>
          }
      </View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },
  header: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: theme.colors.background,

  },
  chatContainer: {
    backgroundColor: '#EDEDED',
    paddingHorizontal: spacing.md

  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    // backgroundColor: '#fff',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  message: {
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  rightContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
  },
  timeOrDate: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  unreadBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 72,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
},
loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
},
errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
},
retryButton: {
    marginTop: 10,
    padding: 10,
},
retryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
},
buttonContainer: {
  width: 200,
  backgroundColor: theme.colors.primary,
  paddingVertical: 16,
  borderRadius: 8,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 20
},
buttonText: {
  color: '#fff',
  fontSize: 16,
  // fontFamily: 'Averta-Bold',
},
});

export default ChatListScreen;