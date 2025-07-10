import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import TrialList from '../components/TrialList'
import { store } from '../../../store/root'
import { apiClient } from '../../../services/apiClient'
import { spacing } from '../../../config/spacing'
import TrialCard from '../components/TrialCard'

interface Trial {
  _id: string;
  name: string;
  description: string;
  location: string;
  trialDate: string;
  eligibility: string;
  trialType: string;
  file?: string;
  trialFees: number;
}

const EventCreationScreen:FC<any> = ({ navigation }) => {
  const [events, setEvents] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const { userData } = store.auth;

  useEffect(() => {
    fetchActivities(1, false);
  }, []);

  const fetchActivities = async (pageNumber: number = 1, shouldRefresh: boolean = true) => {
    try {
      if (shouldRefresh) {
        setLoading(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }
  
      const response = await apiClient.get<any>(`/scout/trials?page=${pageNumber}&limit=100`);
      const newEvents = response.data.trials;
      console.log('newEvents', newEvents);
  
      // Check if we've reached the end of the data
      if (newEvents.length === 0) {
        setHasMoreData(false);
      }
  
      // If refreshing or first page, replace the data
      // Otherwise append to existing data
      if (shouldRefresh || pageNumber === 1) {
        setEvents(newEvents);
        setPage(1);
      } else {
        setEvents(prevEvents => [...prevEvents, ...newEvents]);
      }
      setError(null);
    } catch (error: any) {
      if (error.response?.data?.error?.[0]?.message) {
        setError(error.response.data.error[0].message);
        console.log(error.response.data.error[0].message)
      } else if (error.error?.[0]?.message) {
        setError(error.error[0].message);
        console.log(error.error[0].message)
      } else {
        setError('An unexpected error occurred') ;
      }
      console.error(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }
  
  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  }, [navigation]);

  const trialItem = useCallback(({ item }: { item: Trial }) => {
    console.log('trial id', item._id);
    return (
      <View style={styles.cardContainer}>
        <TrialCard
          title={item?.name}
          location={item?.location}
          requests={0}
          date={item?.trialDate}
          tag={item?.trialType}
          onPress={() => handleEventPress(item._id)}
        />
      </View>
    )
  }, [handleEventPress]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !loading) {
      fetchActivities(page + 1);
      setPage(prev => prev + 1);
    }
  }, [hasMoreData, loading, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    fetchActivities(1, true);
  }, []);

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No activities yet. Start exploring events!</Text>
        <TouchableOpacity onPress={() => handleRefresh()} style={styles.refreshBtn}>
          <Text style={styles.retryText}>Discover Opportunities.</Text>
        </TouchableOpacity>
      </View>
    );
  };

  
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <View style={GLOBALSTYLES.wrapper}>
        <Text style={[GLOBALSTYLES.title, { marginBottom: 20}]}>Activities</Text>

        <FlatList
          data={events}
          renderItem={trialItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          // ListFooterComponent={renderFooter}
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
      </View>
    </SafeAreaProvider>
  )
}

export default EventCreationScreen

const styles = StyleSheet.create({
  cardContainer: {
    marginBottom: spacing.md,
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
  listContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    flexGrow: 1,
  },
})




