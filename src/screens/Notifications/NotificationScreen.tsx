import React, { useEffect, useState } from 'react'
import { StyleSheet, View, Text, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useStores } from '../../contexts/StoreContext'
import { Colors, Spacing, Typography } from '../../styles/globalStyles'
import { listenToDocument } from '../../services/firebase/firestore'
import { Timestamp } from 'firebase/firestore'

interface NotificationItem {
  message: string
  type: string
  date: Date
  read: boolean
  firstName?: string
  lastName?: string
  status?: string
  email?: string
}

interface NotificationsDoc {
  userId: string
  notifications?: Array<{
    message: string
    type: string
    date: Timestamp | Date | string
    read: boolean
    firstName?: string
    lastName?: string
    status?: string
    email?: string
  }>
}

const NotificationScreen = () => {
  const { authStore } = useStores()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const userId = authStore.user?.id
    if (!userId) {
      setLoading(false)
      setNotifications([])
      return
    }

    const unsubscribe = listenToDocument<NotificationsDoc>('notifications', userId, (doc) => {
      const items = (doc?.notifications || []).map((n) => {
        const rawDate = n.date as any
        const asDate = rawDate?.toDate ? rawDate.toDate() : new Date(rawDate)
        return {
          message: n.message,
          type: n.type,
          date: asDate,
          read: n.read,
          firstName: n.firstName,
          lastName: n.lastName,
          status: n.status,
          email: n.email,
        } as NotificationItem
      })
      // Most recent first
      items.sort((a, b) => b.date.getTime() - a.date.getTime())
      setNotifications(items)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [authStore.user?.id])

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const formattedDate = item.date.toLocaleString()
    return (
      <View style={styles.itemContainer}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{item.message}</Text>
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
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Notifications</Text>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>When there’s activity on your account, you’ll see it here.</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(_, index) => `notification-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  )
}

export default NotificationScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
    marginBottom: Spacing.md,
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
})