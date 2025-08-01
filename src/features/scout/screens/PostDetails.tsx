import { StyleSheet, Text, TouchableOpacity, View, Image, ActivityIndicator } from 'react-native'
import React, { FC, useCallback, useEffect, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft, Heart, MessageCircle, MessageSquare } from 'lucide-react-native'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { useRoute } from '@react-navigation/native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { spacing } from '../../../config/spacing'
import { apiClient } from '../../../services/apiClient'
import { theme } from '../../../config/theme'
import { useToast } from '../../../../components/ui/toast'

interface PostData {
    athlete: {
        _id: string;
        name?: string;
        profileImg?: string;
    },
    visibility: string;
    description: string;
    image?: string[];
    tag?: string;
}

interface PostDetailsProps {
    navigation: any;
}

const PostDetails: FC<PostDetailsProps> = ({ navigation }) => {
    const route = useRoute()
    const { athleteId } = route.params as { athleteId: string }
    const { toast } = useToast();
    // console.log(athleteId)

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null)
    const [post, setPost] = useState<PostData | null>(null)

    useEffect(() => {
        fetchSingleActivity(athleteId);
    }, []);

    const fetchSingleActivity = async (athleteId: string ) => {
        try {
          setIsLoading(true);
          setError(null);
          
          const response = await apiClient.get<any>(`/scout/athlete/activity/${athleteId}`);
          setPost(response?.data);
        //   console.log(response?.data)
        } catch (error: any) {
          setError(error.response?.error?.message || 'Failed to fetch athlete details');
          console.log(error?.response.error.message)
          throw error;
        } finally {
          setIsLoading(false);
        }
    }

    const mediaUrl = post?.image?.[0]; // Get the first media item
    const isVideo = typeof mediaUrl === 'string' && mediaUrl.endsWith('.mp4');
    const player = useVideoPlayer({
      uri: isVideo ? mediaUrl : undefined
    });

    const handleProfilePress = useCallback(() => {
        navigation.navigate('TalentDetails', { athleteId: post?.athlete?._id });
    }, [navigation, post?.athlete?._id]);

    const handleLike = () => {
        // Implement like functionality
        console.log('Like pressed');
        toast({
          title: 'Success',
          description: 'Liked successfully',
          variant: 'success',
        });
    };

    const handleGoToChat = () => {
      navigation.navigate('ChatDetail', { chatId: post?.athlete?._id, receiverName: post?.athlete?.name, receiverImage: post?.athlete?.profileImg });
    };

  return (
    <PageWrapper>
        <TouchableOpacity onPress={() => navigation.goBack()} style={GLOBALSTYLES.iconWrapper}>
            <ArrowLeft size={24} color={'#000'} />
        </TouchableOpacity>

        {isLoading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size={'large'} color={theme.colors.primary} />
            </View>
        ) : post ? (
            <View style={styles.card}>
                {/* Header */}
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={handleProfilePress}>
                        <Image source={post?.athlete?.profileImg ? { uri: post?.athlete?.profileImg } : require('../../../../assets/profile-icon.png')} style={styles.profileImg} />
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.name}>{post?.athlete?.name}</Text>

                        {post?.tag && post?.visibility && (
                            <View style={styles.tagsRow}>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{post?.tag}</Text>
                                </View>
                                <View style={styles.tag}>
                                    <Text style={styles.tagText}>{post?.visibility}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                    <View style={styles.iconRow}>
                        <TouchableOpacity onPress={handleLike} style={GLOBALSTYLES.iconWrapper}>
                            <Heart size={22} color="#888" style={styles.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleGoToChat} style={GLOBALSTYLES.iconWrapper}>
                            <MessageSquare size={22} color="#888" style={styles.icon} />
                        </TouchableOpacity>
                    </View>
                </View>
            
                {/* Description */}
                <Text style={styles.description}>{post?.description}</Text>
            
                {/* Media */}
                <View style={styles.mediaWrapper}>
                    {mediaUrl && (
                    isVideo ? (
                        <VideoView
                        player={player}
                        style={styles.mediaImg}
                        />
                    ) : (
                        <Image source={{uri: mediaUrl}} style={styles.mediaImg} />
                    )
                    )}
                </View>
            </View>
        ) : error ? (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        ) : null}
    </PageWrapper>
  )
}

export default PostDetails;



const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
    },
    card: {
      backgroundColor: '#fff',
      margin: 12,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    profileImg: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: '#eee',
    },
    name: {
      fontWeight: 'bold',
      fontSize: 18,
      color: '#222',
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 2,
    },
    locationText: {
      marginLeft: 4,
      color: '#888',
      fontSize: 13,
    },
    tagsRow: {
      flexDirection: 'row',
      marginTop: 6,
      gap: 6,
    },
    tag: {
      backgroundColor: '#ECECFF',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 2,
      marginRight: 6,
    },
    tagText: {
      fontSize: 12,
      color: '#333',
    },
    iconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
      gap: 8
    },
    icon: {
    //   marginLeft: 8,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 6,
    },
    statsText: {
      fontSize: 13,
      color: '#888',
      marginLeft: 4,
    },
    description: {
      fontSize: 14,
      color: '#444',
      marginVertical: 10,
    //   marginTop: spacing.md,
    },
    mediaWrapper: {
        marginTop: spacing.sm
    },
    mediaImg: {
      width: '100%',
      // height: 120,
      aspectRatio: 16/9,
      borderRadius: 12,
      marginTop: 6,
      backgroundColor: '#eee',
    },
  });