import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { theme } from '../../../config/theme'
import { ArrowLeft } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import NotificationsList from '../components/NotificationsList'
import PageWrapper from '../../../components/wrapper'
import { observer } from 'mobx-react-lite'
import { store } from '../../../store/root'
import { GLOBALSTYLES } from '../../../styles/globalStyles'

const NotificationBadge = ({ count }: { count: number }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

const NotificationsScreen:FC<any> = observer(({ navigation }) => {
  const { unreadCount } = store.notifications;
  
  return (
    <PageWrapper>
      <View style={styles.container}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={GLOBALSTYLES.iconWrapper}>
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Notifications</Text>
          <NotificationBadge count={unreadCount} />
        </View>

        <NotificationsList />
      </View>
    </PageWrapper>
  )
})

export default NotificationsScreen

const styles = StyleSheet.create({

  container: {
    flex: 1,
    // paddingHorizontal: spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: 15 
  },
  title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      // marginTop: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.xl,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
})