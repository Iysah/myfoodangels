import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { FC, useEffect, useState, useCallback, memo } from 'react'
import { spacing } from '../../../config/spacing'
import EventCard from './EventCard'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { store } from '../../../store/root'
import { theme } from '../../../config/theme'
import { Event } from '../../../store/slices/event'
import { observer } from 'mobx-react-lite'

type RootStackParamList = {
  EventDetails: { eventId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EventListProps {
  fetchFunction?: (pageNumber?: number, shouldRefresh?: boolean) => Promise<void>;
  events?: Event[];
  loading?: boolean;
  loadingMore?: boolean;
  refreshing?: boolean;
  hasMoreData?: boolean;
  onLoadMore?: () => void;
  onRefresh?: () => void;
}

const MemoizedEventCard = memo(EventCard);

const EventList: FC<EventListProps> = observer(({ 
  fetchFunction,
  events = store.events.events,
  loading = store.events.loading,
  loadingMore = store.events.loadingMore,
  refreshing = store.events.refreshing,
  hasMoreData = store.events.hasMoreData,
  onLoadMore,
  onRefresh
}) => {
  const navigation = useNavigation<NavigationProp>();
  
  // Initial data load
  useEffect(() => {
    if (fetchFunction) {
      fetchFunction();
    } else {
      store.events.fetchEvents();
    }
  }, [fetchFunction]);

  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Event }) => {
    return (
      <View style={styles.cardContainer}>
        <MemoizedEventCard
          imageUrl={item.file}
          title={item.name}
          description={item.description}
          location={item.location}
          date={item.trialDate}
          playerType={item.eligibility}
          onPress={() => handleEventPress(item._id)}
        />
      </View>
    );
  }, [handleEventPress]);

  // Render footer (loading indicator when loading more data)
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
        <Text style={styles.loadingMoreText}>Loading more events...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      );
    }

    if (!events || events.length === 0) {
      return (
        <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No activities yet. Start exploring events!</Text>
        <TouchableOpacity onPress={onRefresh || (() => fetchFunction?.(1, true))} style={styles.refreshBtn}>
          <Text style={styles.retryText}>Discover Opportunities.</Text>
        </TouchableOpacity>
      </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No activities yet. Start exploring events!</Text>
        <TouchableOpacity onPress={onRefresh || (() => fetchFunction?.(1, true))} style={styles.refreshBtn}>
          <Text style={styles.retryText}>Discover Opportunities.</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const handleLoadMore = useCallback(() => {
    if (onLoadMore) {
      onLoadMore();
    } else if (fetchFunction) {
      const nextPage = store.events.page + 1;
      store.events.page = nextPage;
      fetchFunction(nextPage);
    } else {
      store.events.loadMore();
    }
  }, [onLoadMore, fetchFunction]);

  const handleRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    } else if (fetchFunction) {
      store.events.page = 1;
      store.events.hasMoreData = true;
      fetchFunction(1, true);
    } else {
      store.events.refresh();
    }
  }, [onRefresh, fetchFunction]);

  return (
    <FlatList
      data={events}
      renderItem={renderItem}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContainer}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      initialNumToRender={10}
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

export default EventList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: spacing.md,
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    flexGrow: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 10,
  },
  refreshBtn: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.rounded,

    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: theme.colors.primary
  },
  retryText: {
    fontSize: 14,
    color: '#fff'
  }
});