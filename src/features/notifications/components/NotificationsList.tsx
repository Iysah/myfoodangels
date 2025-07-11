import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { notifications, loading, refreshing, loadingMore, error } = store.notifications;

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = useCallback(async (shouldRefresh = false) => {
    try {
      const pageToLoad = shouldRefresh ? 1 : page;
      console.log('Loading notifications page:', pageToLoad, 'shouldRefresh:', shouldRefresh);
      
      await store.notifications.fetchNotifications(pageToLoad, shouldRefresh);
      
      // Check if we have more data (assuming API returns empty array when no more data)
      const currentNotifications = store.notifications.notifications;
      if (currentNotifications.length === 0 || currentNotifications.length < pageToLoad * 10) {
        setHasMoreData(false);
      }
      
      if (!shouldRefresh) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    loadNotifications(true);
  }, [loadNotifications]);

  const handleLoadMore = useCallback(async () => {
    console.log('handleLoadMore called - hasMoreData:', hasMoreData, 'isLoadingMore:', isLoadingMore, 'loadingMore:', loadingMore, 'refreshing:', refreshing, 'loading:', loading);
    
    // Prevent multiple simultaneous calls
    if (isLoadingMore || loadingMore || refreshing || loading || !hasMoreData) {
      console.log('Preventing load more - conditions not met');
      return;
    }
    
    console.log('Starting load more for page:', page);
    setIsLoadingMore(true);
    try {
      await loadNotifications();
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMoreData, isLoadingMore, loadingMore, refreshing, loading, page, loadNotifications]);

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
    if (!isLoadingMore && !loadingMore) return null;
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
      onEndReachedThreshold={0.1}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={10}
      removeClippedSubviews={true}
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