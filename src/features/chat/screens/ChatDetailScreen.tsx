import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React, { FC, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { ArrowLeft, EllipsisVertical } from 'lucide-react-native'
import { useRoute } from '@react-navigation/native'
import { chatData } from '../../../data/chatData'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'

const ChatDetailScreen:FC<any> = ({ navigation }) => {
  const route = useRoute()

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  
  const { chatId } = route.params as { chatId: string }

  const item = chatData.find(chat => chat.id === chatId)

  if (!item) {
    return <Text>Chat not found</Text>
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <View style={GLOBALSTYLES.wrapper}>
        <View style={styles.headerWrapper}>
          <View style={GLOBALSTYLES.row}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <ArrowLeft size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>

            <View style={styles.profileWrapper}>
              {/* <Image source={item?.fileUrl ? { uri: item.fileUrl} : require('../../../../assets/profile.png')} style={styles.avatar} /> */}
              {/* {item.isOnline && <View style={GLOBALSTYLES.onlineDot} />} */}
              <View style={styles.textWrapper}>
                <Text style={styles.profileName}>{item.name}</Text>
                {/* {item.isOnline ? ( <Text style={styles.status}>Online</Text>) : (<Text style={styles.status}>Offline</Text>)  } */}
              </View>
            </View>
          </View>

          <EllipsisVertical size={24} color={theme.colors.text.primary} />
        </View>
      </View>
    </SafeAreaProvider>
  )
}

export default ChatDetailScreen

const styles = StyleSheet.create({
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  headerWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row'
  },
  profileWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md
  },
  textWrapper: {
    flexDirection: 'column',
    gap: spacing.xs
  },
  profileName: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: '600'
  },
  status: {
    fontSize: typography.fontSize.xs,
    color: theme.colors.text.secondary,
    textTransform: 'capitalize'
  }
})