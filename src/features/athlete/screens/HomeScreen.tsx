import React, { FC, memo, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator } from 'react-native';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/root';
import { theme } from '../../../config/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { spacing } from '../../../config/spacing';
import { typography } from '../../../config/typography';
import { Bell, ChevronDown } from 'lucide-react-native';
import SearchBar from '../../shared/components/SearchBar';
import { getFirstName } from '../../../utils/getFirtsName';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import EventList from '../components/EventList';
import { apiClient } from '../../../services/apiClient';
import EventCard from '../components/EventCard';
import ProfileCompletion from '../../shared/components/ProfileCompletion';

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

interface SearchFilters {
  searchType?: string;
  name?: string;
  location?: string;
  type?: string;
  free?: boolean;
  eligibility?: string;
}

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

const HomeScreen:FC<any> = observer(({ navigation }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [profileCompletionPercent, setProfileCompletionPercent] = useState<number>(0);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    searchType: 'scout',
    name: '',
    location: '',
    type: '',
    free: false,
    eligibility: ''
  });
  const { userData } = store.auth;
  const { unreadCount } = store.notifications;

  const fetchProfileCompletion = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ data: number }>('/auth/profile-completed');
      const completionPercent = response.data;
      console.log(completionPercent, 'completionPercent')
      setProfileCompletionPercent(completionPercent);
      
      // Show profile completion component if percentage is below 100
      setShowProfileCompletion(completionPercent < 100);
    } catch (error: any) {
      console.error('Error fetching profile completion:', error);
      // Default to showing the component if there's an error
      setShowProfileCompletion(true);
    }
  };

  const fetchEvents = async (pageNumber: number = 1, shouldRefresh: boolean = true): Promise<void> => {
    try {
      if (shouldRefresh) {
        setLoading(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      const response = await apiClient.get<any>(`/athlete/trials?page=${pageNumber}&limit=40`);
      const newEvents = response.data.trials;

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
      console.error('Error fetching events:', error);
      setError(error.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchProfileCompletion();
  }, []);

  const handleEventPress = useCallback((eventId: string) => {
    navigation.navigate('EventDetails', { eventId });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !loading) {
      fetchEvents(page + 1);
      setPage(prev => prev + 1);
    }
  }, [hasMoreData, loading, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    fetchEvents(1, true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Event }) => {
    return (
      <View style={styles.cardContainer}>
        <MemoizedEventCard
          imageUrl={item.file || ''}
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileWrapper}>
            <Image source={userData ? {uri: userData?.profileImg} : require('../../../../assets/placeholder.png')} style={styles.profileImg} />
            <View>
              <Text style={styles.welcomeText}>
                Hi, {getFirstName(userData?.fullName)}
              </Text>
              <Text style={styles.subtitle}>
                Discover opportunities
              </Text>
            </View>
          </View>

          <TouchableOpacity style={GLOBALSTYLES.iconWrapper} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={20} color={'#000'} />
            <NotificationBadge count={unreadCount} />
          </TouchableOpacity>
        </View>



        <View style={styles.section}>
          <FlatList
            data={events}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <>
                <View style={styles.wrapper}>
                  <SearchBar onPress={() => navigation.navigate('SearchScout')} placeholder='Search for athletes, filter results'  />
                </View>

                {/* Profile completion status */}
                {showProfileCompletion && (
                  <ProfileCompletion 
                    onClose={() => { setShowProfileCompletion(false) }} 
                    onPress={() => navigation.navigate('ProfileScreen')} 
                  />
                )}

                <View style={GLOBALSTYLES.divider} />

                <View style={styles.headerWrapper}>
                  <Text style={styles.sectionTitle}>Discover</Text>
                </View>
              </>
            }
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

      </View>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomColor: '#EDEDED',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background
  },
  profileWrapper: {
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  welcomeText: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.secondary,
    opacity: 0.8,
    marginTop: theme.spacing.xs,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl
  },
  iconWrapper: {
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wrapper: {
    paddingHorizontal: spacing.md
  },
  section: {
    flex: 1,
    // paddingVertical: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: spacing.md,
  },
  headerWrapper: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: spacing.md
  },
  trialsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 