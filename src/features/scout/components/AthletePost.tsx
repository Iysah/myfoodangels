import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useVideoPlayer, VideoView } from 'expo-video'
import { theme } from '../../../config/theme'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'

interface postProps {
    athlete: {
      name?: string;
      profileImg?: string;
    },
    visibility: string;
    description: string;
    image?: string[];
    tag?: string;
    onPress: () => void;
}

const AthletePost = ({ athlete, visibility, description, tag, image, onPress } : postProps) => {
  const mediaUrl = image?.[0]; // Get the first media item
  const isVideo = typeof mediaUrl === 'string' && mediaUrl.endsWith('.mp4');
  const player = useVideoPlayer({
    uri: isVideo ? mediaUrl : undefined
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.profileWrapper}>
            <Image source={athlete?.profileImg ? {uri: athlete?.profileImg} : require('../../../../assets/profile-icon.png')} style={styles.profileImg} />
            <View style={styles.textWrapper}>
                <Text style={styles.name}>{athlete?.name}</Text>

                {visibility && tag && (
                    <View style={styles.tagsRow}>
                        <View style={[styles.tag, { backgroundColor: '#ECECFF' }]}>
                            <Text>{visibility}</Text>
                        </View>
                        <View style={styles.tag}>
                        <Text>{tag}</Text>
                    </View>
                    </View>
                )}
            </View>
        </View>
        <Text style={styles.descText}>{description}</Text>
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
    </TouchableOpacity>
  )
}

export default AthletePost

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: theme.borderRadius.lg,

        padding: spacing.md,
        marginBottom: spacing.md
    },
    profileImg: {
        width: 60,
        height: 60,
        borderRadius: theme.borderRadius.rounded
    },
    textWrapper: {
        // gap: spacing.sm
    },
    name: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    },
    tagsRow: { 
        flexDirection: 'row', 
        gap: 8, 
        marginVertical: spacing.sm
      },
      tag: { 
        // backgroundColor: '#eee', 
        color: '#333', 
        borderRadius: 12, 
        borderColor: '#DBDBDB',
        borderWidth: .8,
        paddingHorizontal: 10, 
        paddingVertical: 2, 
        fontSize: 12, 
        marginRight: 6 
      },
    address: {
        fontSize: typography.fontSize.md,
        fontWeight: '400',
        color: theme.colors.text.secondary,

        justifyContent: "flex-start",
        alignItems: 'center',
        flexDirection: 'row',
        gap: spacing.sm

    },
    profileWrapper: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md
    },
    descText: {
        marginVertical: spacing.sm,
        fontSize: typography.fontSize.sm,
        fontWeight: '400',
        lineHeight: 19,
        color: theme.colors.text.secondary
    },
    mediaWrapper: {
        marginTop: spacing.sm
    },
    mediaImg: {
        borderRadius: theme.borderRadius.md,
        width: '100%',
        aspectRatio: 16 / 9,
        // height: 120
    }
})