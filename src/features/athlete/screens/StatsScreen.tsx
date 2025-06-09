import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC, memo, useCallback, useEffect, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import EventList from '../components/EventList'
import { Bell } from 'lucide-react-native'
import { typography } from '../../../config/typography'
import { theme } from '../../../config/theme'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { store } from '../../../store/root'
import EventCard from '../components/EventCard'
import { spacing } from '../../../config/spacing'
import { apiClient } from '../../../services/apiClient'
import { observer } from 'mobx-react-lite'

interface Event {
  _id: string;
  name: string;
  description: string;
  location: string;
  trialDate: string;
  eligibility: string;
  file?: string;
}

const MemoizedEventCard = memo(EventCard);

const StatsScreen: FC<any> = observer(({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const fetchMyEvents = async (pageNumber: number = 1, shouldRefresh: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<any>(`/athlete/trials/activity?page=${pageNumber}&limit=50`);
      const newEvents = response.data.trials;

      console.log("My events:", newEvents);
      
      if (newEvents.length === 0) {
        setHasMoreData(false);
      }

      if (shouldRefresh || pageNumber === 1) {
        setEvents(newEvents);
        setPage(1);
      } else {
        setEvents(prevEvents => [...prevEvents, ...newEvents]);
      }
    } catch (error: any) {
      if (error.response?.data?.error?.[0]?.message) {
        setError(error.response.data.error[0].message);
      } else if (error.error?.[0]?.message) {
        setError(error.error[0].message);
      } else {
        setError('An unexpected error occurred');
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !loading) {
      fetchMyEvents(page + 1);
      setPage(prev => prev + 1);
    }
  }, [hasMoreData, loading, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    fetchMyEvents(1, true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Event }) => {
    return (
      <View style={styles.cardContainer}>
        <MemoizedEventCard
          imageUrl={item.file || ''}
          title={item.name || ''}
          description={item.description || ''}
          location={item.location}
          date={item.trialDate}
          playerType={item.eligibility}
          onPress={() => handleEventPress(item._id)}
        />
      </View>
    );
  }, [handleEventPress]);

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
        <TouchableOpacity onPress={() => handleRefresh()} style={styles.refreshBtn}>
          <Text style={styles.retryText}>Discover Opportunities.</Text>
        </TouchableOpacity>
      </View>
      );
    }
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No activities yet. Start exploring events!</Text>
        <TouchableOpacity onPress={() => handleRefresh()} style={styles.refreshBtn}>
          <Text style={styles.retryText}>Discover Opportunities.</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <View style={GLOBALSTYLES.header}>
        <Text style={GLOBALSTYLES.title}>My Activities</Text>

        <TouchableOpacity style={GLOBALSTYLES.iconWrapper} onPress={() => navigation.navigate('Notifications')}>
          <Bell size={20} color={'#000'} />
        </TouchableOpacity>
      </View>

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
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />
    </SafeAreaProvider>
  )
})

export default StatsScreen

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
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
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})