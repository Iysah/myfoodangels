import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator, ScrollView } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { useRoute } from '@react-navigation/native'
import { fetchTrialApplicants, acceptApplicant, rejectApplicant } from '../api'
import { spacing } from '../../../config/spacing'
import { useVideoPlayer, VideoView } from 'expo-video'

// Types for API response
interface Trial {
  _id: string;
  name: string;
  // add other fields as needed
}
interface Athlete {
  _id: string;
  name: string;
  position?: string;
  profileImg?: string;
}
interface Applicant {
  _id: string;
  athlete: Athlete;
  document?: string;
  status: string;
}
interface ApplicantsResponse {
  data: {
    trial: Trial;
    Applicants: Applicant[];
  };
}

const RequestsScreen:FC<any> = ({ navigation }) => {
  const route = useRoute()
  const { eventId } = route.params as { eventId: string }

  const [loading, setLoading] = useState(false)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [trial, setTrial] = useState<Trial | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true)
      try {
        const res = await fetchTrialApplicants(eventId) as ApplicantsResponse
        console.log('Applicants', res.data.Applicants)
        setApplicants(res.data.Applicants || [])
        setTrial(res.data.trial)
      } catch (e) {
        // handle error
      } finally {
        setLoading(false)
      }
    }
    fetchApplicants()
  }, [eventId])

  const mediaUrl = applicants[0]?.document; 
  const isVideo = typeof mediaUrl === 'string' && mediaUrl.endsWith('.mp4');
  const player = useVideoPlayer({
    uri: isVideo ? mediaUrl : undefined
  });

  const handleAction = async (applicantId: string, action: 'accept' | 'reject') => {
    setActionLoading(applicantId + action)
    try {
      if (action === 'accept') await acceptApplicant(applicantId)
      else await rejectApplicant(applicantId)
      // Refresh list after action
      const res = await fetchTrialApplicants(eventId) as ApplicantsResponse
      setApplicants(res.data.Applicants || [])
    } catch (e) {
      // handle error
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <PageWrapper>
      <View style={GLOBALSTYLES.header}>
        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>{trial?.name || 'Requests'}</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.header} onPress={() => navigation.navigate('EventDetails', { eventId })}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' }}>{trial?.name || 'Requests'}</Text>
          <ChevronRight color={theme.colors.text.primary} />
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 40 }} />
        ) : (
          applicants.map((item) => (
            <View key={item._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity onPress={() => navigation.navigate('TalentDetailsScreen', { athleteId: item.athlete._id })}>
                  <Image source={{ uri: item.athlete.profileImg }} style={styles.profileImg} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: 'bold' }}>{item.athlete.name}</Text>
                  <Text style={{ fontSize: 12, color: theme.colors.text.secondary, textTransform: 'capitalize' }}>{item.athlete.position}</Text>
                  {/* Stats can go here */}
                </View>
              </View>
              <View style={styles.mediaWrapper}>
                <VideoView
                  style={styles.video}
                  player={player}
                  // shouldPlay={true}
                  // isLooping={true}
                  // resizeMode="contain"
                />
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Actions */}
              {item.status?.toLowerCase() === 'pending' ? (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleAction(item._id, 'reject')}
                    disabled={actionLoading === item._id + 'reject'}
                    style={styles.rejectBtn}
                  >
                    <Text style={{ color: '#DD0101', fontWeight: 'bold' }}>
                      {actionLoading === item._id + 'reject' ? 'Declining...' : 'Decline'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleAction(item._id, 'accept')}
                    disabled={actionLoading === item._id + 'accept'}
                  >
                    <Text style={{ color: theme.colors.primary }}>
                      {actionLoading === item._id + 'accept' ? 'Approving...' : 'Approve'}{' '}
                    </Text>
                    <Check color={theme.colors.primary} size={16} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardActions}>
                  <Text
                    style={{
                      color: item.status?.toLowerCase() === 'approved' ? theme.colors.primary : '#DD0101',
                      fontWeight: 'bold',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item.status}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}

        {applicants.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applicants found.</Text>
          </View>
        )}
      </ScrollView>

    </PageWrapper>
  )
}

export default RequestsScreen

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: 12,
    margin: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    color: theme.colors.text.primary,
    marginLeft: 12,
  },
  requestContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    margin: 12,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  profileImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  mediaWrapper: {
    marginTop: spacing.sm
},
  video: {
    width: '100%',
    // height: 120,
    aspectRatio: 16/9,
    borderRadius: 12,
    marginTop: 6,
    backgroundColor: '#eee',
  },
  videoPlaceholder: {
    width: 80,
    height: 60,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    // marginTop: 8,
  },
  approveBtn: {
    borderWidth: 1,
    borderColor: '#00008040',
    borderRadius: 16,
    backgroundColor: '#ECECFF',
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },  
  rejectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderColor,
    marginVertical: 16,
  },
})