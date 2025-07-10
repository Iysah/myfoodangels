import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, FlatList, RefreshControl } from 'react-native'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import PageWrapper from '../../../components/wrapper'
import { ArrowRight, Award, Briefcase, GraduationCap, MapPin, MoveRight, Pencil, Plus, Settings } from 'lucide-react-native'
import { typography } from '../../../config/typography'
import SolidButton from '../../../components/button/solidButton'
import { store } from '../../../store/root'
import { spacing } from '../../../config/spacing'
import { observer } from 'mobx-react-lite'
import AthleteCard from '../../scout/components/AthleteCard'
import { formatDate } from '../../../utils/dateFormat'
import { apiClient } from '../../../services/apiClient'

interface Performance {
  _id: string;
  athlete?: string;
  description: string;
  visibility: string;
  image: string;
  updatedAt: string;
  createdAt?: string;
  __v?: number;
}
interface subParams {
  label: string;
  sub: any;
}

const ProfileScreen:FC<any> = observer(({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'bio' | 'media'>('bio');
  const [videos, setVideos] = useState<Performance[]>([])
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  const { userData } = store.auth;

  console.log('userData', userData);
  
  const fetchPerfomance = async (pageNumber: number = 1, shouldRefresh: boolean = false) => {
    try {
      const pageToLoad = shouldRefresh ? 1 : page;
      const response = await apiClient.get<any>(`/athlete/performance/ur?page=${pageNumber}&limit=10`);
      
      // Safely access performances, defaulting to an empty array if data.data or performances is missing
      const newVideos = response.data?.performances || [];

      // Check if we've reached the end of the data
      if (newVideos.length === 0) {
        setHasMoreData(false);
      }
      // If refreshing or first page, replace the data
      // Otherwise append to existing data
      if (shouldRefresh || pageNumber === 1) {
        setVideos(newVideos);
        setPage(1);
      } else {
        setVideos(prevVideos => [...prevVideos, ...newVideos]);
      }
      setLoading(false);
      setError(null);
    } catch (error: any) {
      setError(error.message);
      console.error('Error fetching perfomance videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfomance()
  }, [])

  const handleEventPress = useCallback((videoId: string) => {
    navigation.navigate('PerformanceDetails', { videoId });
  }, [navigation]);

  const handleLoadMore = useCallback(() => {
    if (hasMoreData && !loading) {
      fetchPerfomance(page + 1);
      setPage(prev => prev + 1);
    }
  }, [hasMoreData, loading, page]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    setHasMoreData(true);
    fetchPerfomance(1, true);
  }, []);
  
  const renderVideoItem = ({ item } : { item: Performance}) => {
    return (
      <AthleteCard
        imageUrl={userData?.profileImg}
        fullName={userData?.fullName || ''}
        location={{
          city: userData?.city || '',
          country: userData?.country || ''
        }}
        sport={userData?.skill || ''}
        position={userData?.position || ''}
        description={item?.description}
        onPress={() => handleEventPress(item?._id)}
      />
    )
  }

  const renderEmpty = () => {
    if (loading) return null;
    
    return (
      <View style={GLOBALSTYLES.emptyContainer}>
        <Text style={GLOBALSTYLES.emptyText}>You have no videos at the moment. When you do they will appear here</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Videos')} style={GLOBALSTYLES.refreshBtn}>
          <Text style={GLOBALSTYLES.retryText}>Post Perfomance</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const StatBox = ({ label, sub} : subParams ) => {
    return (
      <View style={styles.statBox}>
        <Text style={styles.statValue}>{label}</Text>
        <Text style={styles.statSub}>{sub}</Text>
      </View>
    )
  }

  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
       <ScrollView style={styles.container} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={GLOBALSTYLES.header}>
          <Text style={GLOBALSTYLES.title}>Profile</Text>

          <TouchableOpacity style={GLOBALSTYLES.iconWrapper} onPress={() => navigation.navigate('Settings')}>
            <Settings size={18} color={theme.colors.text.primary}/>
          </TouchableOpacity>
        </View>

        <View style={styles.profileWrapper}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.navigate('EditBio')} style={styles.editBio}>
              <Pencil size={18} color={theme.colors.text.primary}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('ProfileUpdate')}>
              <Image source={userData ? {uri: userData?.profileImg} : require('../../../../assets/profile.png') } style={styles.avatar} />
            </TouchableOpacity>
            <Text style={styles.name}>{userData?.fullName}</Text>
            {userData?.skill && (
              <View style={styles.tagsRow}>
                  <View style={[styles.tag, { backgroundColor: '#ECECFF' }]}>
                      <Text>{userData?.skill}</Text>
                  </View>
                  <View style={styles.tag}>
                      <Text>{userData?.position}</Text>
                  </View>
              </View>
            )}

            {userData?.city && (
              <View style={styles.locationRow}>
                  <MapPin size={16} color="#888" />
                  <Text style={styles.location}>{userData?.city}, {userData?.country}</Text>
              </View>
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'bio' && styles.activeTab]}
              onPress={() => setActiveTab('bio')}
            >
              <Text style={[styles.tabText, activeTab === 'bio' && styles.activeTabText]}>Bio</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'media' && styles.activeTab]}
              onPress={() => setActiveTab('media')}
            >
              <Text style={[styles.tabText, activeTab === 'media' && styles.activeTabText]}>Media</Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'bio' ? (
            <>
              {/* About */}
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>About</Text>
          
                  <TouchableOpacity onPress={() => navigation.navigate('EditAbout')}>
                    <Pencil size={18} color={theme.colors.text.primary}/>
                  </TouchableOpacity>
          
                </View>
                <Text style={styles.sectionText}>
                  {userData?.about}
                </Text>
              </View>
          
              {/* Statistics */}
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Statistics</Text>
          
                  <TouchableOpacity onPress={() => navigation.navigate('AddStatistics')}>
                    <Pencil size={18} color={theme.colors.text.primary}/>
                  </TouchableOpacity>
                </View>
                <View style={styles.statsRow}>
                  <StatBox label='Height (ft)' sub={userData?.height} />
                  <StatBox label='Weight (kg)' sub={userData?.weight} />
                  <StatBox label='Body Fat %' sub={userData?.bodyFat} />
                  <StatBox label='BMI' sub={userData?.bmi} />
                  <StatBox label='Max Heart Rate' sub={userData?.maxHeart} />
                  <StatBox label='VO2 Max' sub={userData?.v02max} />
                  <StatBox label='Sprint Speed' sub={userData?.sprint} />
                  <StatBox label='Vertical Jump' sub={userData?.vertical} />
                  <StatBox label='Agility' sub={userData?.agility} />
                </View>
              </View>
          
              {/* Achievements */}
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Achievements</Text>
          
                  <View style={GLOBALSTYLES.row}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddAchievement')}>
                      <Plus size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
          
                    <TouchableOpacity onPress={() => navigation.navigate('Achievements')}>
                      <Pencil size={18} color={theme.colors.text.primary}/>
                    </TouchableOpacity>
                  </View>
                </View>
                {userData?.achievements.map(ach => (
                  <View key={ach._id} style={styles.achievementCard}>
                    <View style={styles.achievementItem}>
                      <Award size={16} color={theme.colors.text.primary}/>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.achievementTitle}>{ach.title}</Text>
                        <Text style={styles.achievementDate}>{formatDate(ach.date)}</Text>
                        <Text style={styles.achievementDesc}>{ach.description}</Text>
                      </View>
                    </View>
                  </View>
                ))}

                {userData?.achievements && userData?.achievements.length > 3 && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Achievements')}
                    style={styles.showMoreButton}
                  >
                    <Text style={styles.showMoreText}>Show all Achievements</Text>
                  </TouchableOpacity>
                )}
              </View>
          
              {/* Experience */}
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Experience</Text>
                  
                  <View style={GLOBALSTYLES.row}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddExperience')}>
                      <Plus size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
          
                    <TouchableOpacity onPress={() => navigation.navigate('Experiences')}>
                      <Pencil size={18} color={theme.colors.text.primary}/>
                    </TouchableOpacity>
                  </View>
                </View>
                {userData?.experience.map(ach => (
                  <View key={ach._id} style={styles.achievementCard}>
                    <View style={styles.achievementItem}>
                      <Briefcase size={16} color={theme.colors.text.primary}/>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.achievementTitle}>{ach.title}</Text>
                        <Text style={styles.achievementDate}>{formatDate(ach.date)}</Text>
                        <Text style={styles.achievementDesc}>{ach.description}</Text>
                      </View>
                    </View>
                  </View>
                ))}
                
                {userData?.experience && userData?.experience.length > 3 && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Experiences')}
                    style={styles.showMoreButton}
                  >
                    <Text style={styles.showMoreText}>Show all Experiences</Text>
                  </TouchableOpacity>
                )}
              </View>
          
              {/* Education */}
              <View style={styles.section}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionTitle}>Education</Text>
          
                  <View style={GLOBALSTYLES.row}>
                    <TouchableOpacity onPress={() => navigation.navigate('AddEducation')}>
                      <Plus size={24} color={theme.colors.text.primary} />
                    </TouchableOpacity>
          
                    <TouchableOpacity onPress={() => navigation.navigate('Educations')}>
                      <Pencil size={18} color={theme.colors.text.primary}/>
                    </TouchableOpacity>
                  </View>
                </View>
                {userData?.education.slice(0, 3).map(ach => (
                  <View key={ach._id} style={styles.achievementCard}>
                    <View style={styles.achievementItem}>
                      <GraduationCap size={16} color={theme.colors.text.primary}/>
                      <View>
                        <Text style={styles.achievementTitle}>{ach.school}</Text>
          
                        <View style={styles.locationRow}>
                          <Text style={styles.achievementDesc}>{ach.degree} in {ach.field} </Text>
                        </View>
          
                        <View style={styles.locationRow}>
                          <Text style={styles.achievementDate}>
                            {formatDate(ach.startDate)} - {ach.endDate === 'till date' ? 'Present' : formatDate(ach.endDate)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
                
                {userData?.education && userData.education.length > 3 && (
                  <TouchableOpacity 
                    onPress={() => navigation.navigate('Educations')}
                    style={styles.showMoreButton}
                  >
                    <Text style={styles.showMoreText}>Show all Educations</Text> 
                    {/* <ArrowRight color={theme.colors.primary} /> */}
                  </TouchableOpacity>
                )}
              </View>
          
            </> 
            ) : (
              <View style={{ flex: 1, height: 400 }}>
                <FlatList
                  data={videos} // Only provide data for media tab
                  renderItem={renderVideoItem} // Only render items for media tab
                  keyExtractor={(item) => item._id}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={renderEmpty} // Only show empty component for media tab
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
            )
          }
        </View>
      </ScrollView>
    </SafeAreaProvider>
  )
})

export default ProfileScreen

const styles = StyleSheet.create({
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 16 
  },
  editBio: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  profileWrapper: {
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.md
  },
  avatar: { 
      width: 80, height: 80, borderRadius: 40, marginBottom: 8, backgroundColor: '#eee' 
  },
  name: { 
      fontSize: 22, fontWeight: 'bold', color: '#222' 
  },
  tagsRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginVertical: spacing.sm
  },
  tag: { 
    backgroundColor: '#eee', 
    color: '#333', 
    borderRadius: 12, 
    borderColor: '#DBDBDB',
    borderWidth: .8,
    paddingHorizontal: 10, 
    paddingVertical: 2, 
    fontSize: 12, 
    marginRight: 6 
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  location: { color: '#888', fontSize: 13 },
  actionsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginVertical: spacing.md 
  },
  tabBar: {
    flexDirection: 'row',
    borderTopColor: '#f6f6f6',
    borderTopWidth: 1,
    // borderRadius: 8,
    marginBottom: 12,
    marginTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    backgroundColor: '#eef0ff',
    borderBottomColor: '#000080', // theme.colors.primary
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabText: {
    color: '#000080', // theme.colors.primary
  },
  section: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 16,
    borderColor: theme.colors.borderColor,
    borderWidth: 1
  },
  sectionRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md
  },
  sectionTitle: { 
    fontWeight: 'bold', 
    fontSize: 16, 
  },
sectionText: { 
    color: '#444', fontSize: 14 
},
videoCard: { 
    width: 160, marginRight: 12
 },
videoThumb: { width: '100%', height: 90, borderRadius: 8, backgroundColor: '#ddd' },
videoTitle: { fontWeight: 'bold', fontSize: 13, marginTop: 6 },
videoDate: { color: '#888', fontSize: 12 },
statsRow: { 
  flexDirection: 'row', 
  flexWrap: 'wrap',
  marginTop: 8,
  gap: 8
},
statBox: { 
  backgroundColor: '#eef0ff',
  borderRadius: 8,
  padding: 12,
  alignItems: 'center',
  width: '31%',
  aspectRatio: 1,
  justifyContent: 'center'
},
statValue: { 
  fontWeight: 'bold', 
  fontSize: 12,
  textAlign: 'center',
  marginBottom: 4
},
statSub: { 
  color: '#888', 
  fontSize: 13,
  textAlign: 'center'
},
achievementCard: { 
  marginBottom: 12 
},
achievementItem: {
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  flexDirection: 'row',
  gap: spacing.md
},
achievementTitle: { 
    fontWeight: 'bold', 
    fontSize: 14,
    textTransform: 'capitalize',
    marginBottom: spacing.sm
},
achievementDate: { 
    marginBottom: spacing.sm,
    color: '#888', 
    fontSize: 12, 
 },
achievementDesc: { color: '#444', fontSize: 13 },
listContainer: {
  // paddingHorizontal: spacing.sm,
  paddingVertical: 12,
  flexGrow: 1,
},
showMoreButton: {
  marginTop: spacing.sm,
  paddingVertical: spacing.sm,

  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: spacing.sm
},
showMoreText: {
  color: theme.colors.primary,
  fontSize: 14,
  fontWeight: '500',


},
})