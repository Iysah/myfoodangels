import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import NotificationItem from './NotificationItem'
import { store } from '../../../store/root'
import { observer } from 'mobx-react-lite'
import { theme } from '../../../config/theme'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import { Notification } from '../../../types/notification'
import EmptyIcon from '../../../../assets/icons/states/empty'

const NotificationsList = observer(() => {
  const [page, setPage] = useState(1);
  const { notifications, loading, refreshing, loadingMore, error } = store.notifications;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (shouldRefresh = false) => {
    try {
      const pageToLoad = shouldRefresh ? 1 : page;
      await store.notifications.fetchNotifications(pageToLoad, shouldRefresh);
      if (!shouldRefresh) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const handleRefresh = () => {
    setPage(1);
    loadNotifications(true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && !refreshing) {
      loadNotifications();
    }
  };

  const renderItem = ({ item }: { item: Notification }) => (
    <NotificationItem 
      text={''}
      title={item.title}
      date={item.createdAt}
      type={item.isRead ? "seen" : "unseen"}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View>
        <EmptyIcon />
      </View>
      <Text style={styles.emptyText}>You don’t have any notification at the moment. When you do they will appear here</Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList<Notification>
      data={notifications}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[theme.colors.primary]}
        />
      }
    />
  );
});

export default NotificationsList;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: theme.colors.text.secondary,
    textAlign: 'center'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
});