import React, { useEffect } from 'react'
import { StyleSheet, View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { useStores } from '../../contexts/StoreContext'
import { Colors, Spacing, Typography } from '../../styles/globalStyles'
import { NotificationModel } from '../../stores/NotificationStore'
import { Timestamp } from 'firebase/firestore'

const NotificationScreen = observer(() => {
  const { authStore, notificationStore } = useStores()
  
  useEffect(() => {
    if (authStore.user?.id) {
      notificationStore.setupRealtimeListener(authStore.user.id)
    }
  }, [authStore.user?.id])

  const handleMarkAllRead = () => {
    notificationStore.markAllAsRead()
  }

  const handleNotificationPress = (item: NotificationModel) => {
    if (!item.read) {
      notificationStore.markAsRead(item)
    }
  }

  const formatDate = (date: Date | Timestamp | string) => {
    if (date instanceof Timestamp) return date.toDate().toLocaleString()
    if (date instanceof Date) return date.toLocaleString()
    return new Date(date).toLocaleString()
  }

  const renderItem = ({ item }: { item: NotificationModel }) => {
    const formattedDate = formatDate(item.date)
    
    return (
      <TouchableOpacity 
        style={[styles.itemContainer, !item.read && styles.itemUnread]} 
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemHeader}>
          <Text style={[styles.itemTitle, !item.read && styles.itemTitleUnread]}>
            {item.message}
          </Text>
          <View style={[styles.statusBadge, item.status === 'success' ? styles.statusSuccess : styles.statusDefault]}>
            <Text style={styles.statusText}>{item.status || 'info'}</Text>
          </View>
        </View>
        <Text style={styles.itemMeta}>
          {formattedDate}
        </Text>
        <View style={styles.itemFooter}>
          <Text style={styles.itemMetaSmall}>{item.type}</Text>
          {item.email ? <Text style={styles.itemMetaSmall}>{item.email}</Text> : null}
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {notificationStore.unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead} style={styles.markReadButton}>
            <Text style={styles.markReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notificationStore.isLoading && notificationStore.notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : notificationStore.notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>When there’s activity on your account, you’ll see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={notificationStore.notifications}
          keyExtractor={(_, index) => `notification-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
})

export default NotificationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
  },
  markReadButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  markReadText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontFamily: Typography.fontFamily.medium,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: Spacing.lg,
  },
  itemContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
  },
  itemUnread: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary + '40', // Slight highlight for unread
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  itemTitle: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginRight: Spacing.sm,
  },
  itemTitleUnread: {
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
  },
  itemMeta: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  itemFooter: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemMetaSmall: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label + '80',
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: Colors.inputBackground,
  },
  statusSuccess: {
    backgroundColor: Colors.primary + '20',
  },
  statusDefault: {
    backgroundColor: Colors.inputBackground,
  },
  statusText: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    display: 'none', // We use borderLeft for unread indication now, but keeping this just in case
  },
})