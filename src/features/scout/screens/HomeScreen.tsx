import React, { FC, useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/root';
import { theme } from '../../../config/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { spacing } from '../../../config/spacing';
import { typography } from '../../../config/typography';
import { Bell } from 'lucide-react-native';
import AthleteList from '../components/AthleteList';
import SearchBar from '../../shared/components/SearchBar';
import { getFirstName } from '../../../utils/getFirtsName';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import { apiClient } from '../../../services/apiClient';
import AthleteCard from '../components/AthleteCard';
import AthletePost from '../components/AthletePost';
import ProfileCompletion from '../../shared/components/ProfileCompletion';

interface Athlete {
  _id: string;
  athlete: {
    name?: string;
    profileImg?: string;
  },
  visibility: string;
  description: string;
  image?: string[];
  tag?: string
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
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const { userData } = store.auth;
  const { unreadCount } = store.notifications;
  // console.log(store.auth.user)

  const fetchAthletes = async (pageNumber: number = 1, shouldRefresh: boolean = true) => {
    try {
      if (shouldRefresh) {
        setLoading(true);
      } else if (pageNumber === 1) {
        setLoading(true);
      }

      const response = await apiClient.get<any>(`/scout/athletes/activity?page=${pageNumber}&limit=40`);
      const newAthletes = response.data.performances;

      // console.log(newAthletes)

      // Check if we've reached the end of the data
      if (newAthletes.length === 0) {
        setHasMoreData(false);
      }

      // If refreshing or first page, replace the data
      // Otherwise append to existing data
      if (shouldRefresh || pageNumber === 1) {
        setAthletes(newAthletes);
        setPage(1);
      } else {
        setAthletes(prevAthletes => [...prevAthletes, ...newAthletes]);
      }
      setError(null);
    } catch (error: any) {
      console.error('Error fetching Athletes:', error);
      setError(error.message || 'Failed to fetch Athletes');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handlePostPress = useCallback((athleteId: string) => {
    navigation.navigate('PostDetails', { athleteId });
  }, [navigation]);

  const renderItem = useCallback(({ item }: { item: Athlete}) => {
    return (
      <View style={styles.cardContainer}>
        <AthletePost 
         athlete={{
          name: item?.athlete.name,
          profileImg: item.athlete.profileImg
         }}
         visibility={item?.visibility} 
         description={item?.description} 
         image={item?.image ? (Array.isArray(item.image) ? item.image : [item.image]) : undefined} 
         tag={item?.tag}
         onPress={() => handlePostPress(item?._id)}
        />
      </View>
    )
  }, [handlePostPress]);



  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !loading) {
      fetchAthletes(page + 1);
      setPage(prev => prev + 1);
    }
  }, [hasMoreData, loading, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    fetchAthletes(1, true);
  }, []);

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={GLOBALSTYLES.emptyContainer}>
        <Text style={GLOBALSTYLES.emptyText}>No activities yet. Start exploring events!</Text>
        <TouchableOpacity onPress={() => handleRefresh()} style={GLOBALSTYLES.refreshBtn}>
          <Text style={GLOBALSTYLES.retryText}>Discover Opportunities.</Text>
        </TouchableOpacity>
      </View>
    );
  };
  
  
  return ( 
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.profileWrapper}>
            <Image source={userData?.profileImg ? { uri: userData?.profileImg } : require('../../../../assets/profile-icon.png')} style={styles.profileImg} />
            <View>
              <Text style={styles.welcomeText}>
                Hi {getFirstName(userData?.fullName)}
              </Text>
              <Text style={styles.subtitle}>
                Discover athletes
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.iconWrapper} onPress={() => navigation.navigate('Notifications')}>
            <Bell size={20} color={'#000'} />
            <NotificationBadge count={unreadCount} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <FlatList 
            data={athletes}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={() => (
              <>
                <View >
                  <SearchBar onPress={() => navigation.navigate('SearchTalent')} placeholder='Search for athletes, filter results'  />
                </View>

                {/* Profile completion status */}
                {showProfileCompletion && (
                  <ProfileCompletion 
                    onClose={() => { setShowProfileCompletion(false) }} 
                    onPress={() => navigation.navigate('ProfileScreen')} 
                  />
                )}

                <Text style={styles.sectionTitle}>Featured Athletes</Text>
              </>
            )}
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
    padding: spacing.md,
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
  cardContainer: {
    marginBottom: spacing.md,
  },
  profileImg: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.xl
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.rounded,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  section: {
    padding: spacing.md,
    paddingBottom: 100

  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: spacing.md,
  },
  listContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 12,
    flexGrow: 1,
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
    paddingHorizontal: 5,
  },
  badgeText: {
    color: theme.colors.background,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
  },
});

export default HomeScreen; 