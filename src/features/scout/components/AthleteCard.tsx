import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { theme } from '../../../config/theme'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'
import { MapPin } from 'lucide-react-native'
import { GLOBALSTYLES } from '../../../styles/globalStyles'

interface cardProps {
    fullName: string;
    location: { city: string, country: string },
    sport: string;
    position: string;
    description: string;
    expCount?: number;
    achievementCount?: number;
    imageUrl?: string;
    onPress: () => void;
}

const AthleteCard = ({ fullName, location, sport, position, description, achievementCount, expCount, imageUrl, onPress } : cardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
        <View style={styles.profileWrapper}>
            <Image source={imageUrl ? {uri: imageUrl} : require('../../../../assets/profile-icon.png')} style={styles.profileImg} />
            <View style={styles.textWrapper}>
                <Text style={styles.name}>{fullName}</Text>
                {location?.city && location?.country && (
                <View style={styles.address}>
                    <MapPin color={theme.colors.text.primary} size={18} />
                    <Text>{location?.city}, {location.country}</Text>
                </View>
                )}

                {sport && position && (
                <View style={styles.tagsRow}>
                    <View style={[styles.tag, { backgroundColor: '#ECECFF' }]}>
                        <Text>{sport}</Text>
                    </View>
                    <View style={styles.tag}>
                        <Text>{position}</Text>
                    </View>
                </View>
                )}
            </View>
        </View>
      <Text style={styles.descText}>{description}</Text>
      {/* <View style={GLOBALSTYLES.row}>
        <Text>{achievementCount} achievement</Text>
        <Text>{expCount} experience</Text>
      </View> */}
      <View style={styles.mediaWrapper}>
        <Image source={imageUrl ? {uri: imageUrl} : require('../../../../assets/placeholder.png')} style={styles.mediaImg} />
      </View>
    </TouchableOpacity>
  )
}

export default AthleteCard

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
        height: 120
    }
})