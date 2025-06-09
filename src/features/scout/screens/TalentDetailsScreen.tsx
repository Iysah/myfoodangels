import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import React, { FC, useEffect } from 'react'
import { useRoute } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import { ArrowLeft, Award, Briefcase, GraduationCap, MapPin } from 'lucide-react-native'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'
import { featuredAthletes } from '../../../data/atheletes'
import Constants from 'expo-constants'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { store } from '../../../store/root'
import { observer } from 'mobx-react-lite'
import { formatDate } from '../../../utils/dateFormat'
// import Video from 'react-native-video'


interface subParams {
    label: string;
    sub: any;
  }

const TalentDetailsScreen:FC<any> = observer(({ navigation }) => {
    const route = useRoute()
    const { athleteId } = route.params as { athleteId: string }
    const { scout } = store;

    useEffect(() => {
        scout.fetchSingleAthlete(athleteId);
      }, [athleteId]);

    const item = scout.singleAthlete;
    // console.log('Athlete Details', item)

    if (scout.isLoading) {
        return (
            <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
                <View style={GLOBALSTYLES.loaderContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={GLOBALSTYLES.loadingText}>Loading athlete details...</Text>
                </View>
            </SafeAreaProvider>
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
        <ScrollView showsVerticalScrollIndicator={false} style={styles.wrapper}>
            <View style={styles.headerSection}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <ArrowLeft color={'#333333'} />
                </TouchableOpacity>

                <Text style={styles.title}>{item?.name}</Text>
            </View>

            <View style={styles.profileWrapper}>
                {/* Header */}
                <View style={styles.header}>
                    <Image source={require('../../../../assets/profile-icon.png')} style={styles.avatar} />
                    <Text style={styles.name}>{item?.name}</Text>
                    <View style={styles.tagsRow}>
                        <View style={styles.tag}>
                            <Text>{item?.skill}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text>{item?.position}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <MapPin size={16} color="#888" />
                        <Text style={styles.location}>{item?.location?.city}, {item?.location?.country}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.messageBtn}>
                        <Text style={styles.messageBtnText}>Message</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shortlistBtn}>
                        <Text style={styles.shortlistBtnText}>Shortlist</Text>
                    </TouchableOpacity>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.sectionText}>
                    {item?.about}
                    </Text>
                </View>

                {/* Videos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Videos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {/* {item?.videos.map(video => (
                        <View key={video.id} style={styles.videoCard}>
                        <Video source={{uri: video.thumbnail}} style={styles.videoThumb}   controls resizeMode="cover" repeat paused={true} />
                        <Text style={styles.videoTitle}>{video.title}</Text>
                        <Text style={styles.videoDate}>{video.date}</Text>
                        </View>
                    ))} */}
                    </ScrollView>
                </View>

                {/* Statistics */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Statistics</Text>
                    <View style={styles.statsRow}>
                        <StatBox label='Height (ft)' sub={item?.statistic?.height} />
                        <StatBox label='Weight (kg)' sub={item?.statistic?.weight} />
                        <StatBox label='Body Fat %' sub={item?.statistic?.bodyFat} />
                        <StatBox label='BMI' sub={item?.statistic?.bmi} />
                        <StatBox label='Max Heart Rate' sub={item?.statistic?.maxHeart} />
                        <StatBox label='VO2 Max' sub={item?.statistic?.v02max} />
                        <StatBox label='Sprint Speed' sub={item?.statistic?.sprint} />
                        <StatBox label='Vertical Jump' sub={item?.statistic?.vertical} />
                        <StatBox label='Agility' sub={item?.statistic?.agility} />
                    </View>
                </View>

                {/* Achievements */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Achievements</Text>
                    {item?.achievement?.map(ach => (
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
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Experience</Text>
                    {item?.experience?.map(ach => (
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
                </View>

                {/* Education */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Education</Text>
                    {item?.education?.map(ach => (
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

                </View>
            </View>
        </ScrollView>
    </SafeAreaProvider>
  )
})

export default TalentDetailsScreen

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        paddingHorizontal: 18,
    },
    headerSection: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.md
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    container: { 
        flex: 1, 
        backgroundColor: '#fafbfc', 
        padding: 16 
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 16 
    },
    profileWrapper: {
        marginVertical: spacing.lg
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
        backgroundColor: '#eee', color: '#333', borderRadius: 12, 
        paddingHorizontal: 10, 
        paddingVertical: 2, fontSize: 12, 
        marginRight: 6 
    },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    location: { color: '#888', fontSize: 13 },
    actionsRow: { 
        flexDirection: 'row', 
        gap: 12, 
        marginVertical: spacing.md 
    },
    messageBtn: { 
        flex: 1, 
        backgroundColor: theme.colors.primary, 
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg, 
        borderRadius: 8, 
        alignItems: 'center'
    },
    messageBtnText: { 
        color: '#fff', 
        fontWeight: 'bold' 
    },
    shortlistBtn: { 
        flex: 1, borderWidth: 1,
        borderColor: theme.colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg, 
        borderRadius: 8, 
        alignItems: 'center'
     },
    shortlistBtnText: { 
        color: theme.colors.primary, 
        fontWeight: 'bold' 
    },
    section: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 14, 
        marginBottom: 16,
        borderColor: theme.colors.borderColor,
        borderWidth: 1
    },
    sectionTitle: { 
        fontWeight: 'bold', 
        fontSize: 16, 
        marginBottom: 8 
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
      achievementItem: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: spacing.md
      },
    achievementCard: { 
        marginBottom: 12 
    },
    achievementTitle: { 
        fontWeight: 'bold', 
        fontSize: 14,
        textTransform: 'capitalize',
    },
    achievementDate: { 
        marginBottom: spacing.sm,
        color: '#888', 
        fontSize: 12, 
     },
    achievementDesc: { color: '#444', fontSize: 13 },
})