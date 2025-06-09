import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { ArrowLeft, Calendar, ClockFading, MapPin, MessageSquareText, Tickets, UsersRound } from 'lucide-react-native'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import SolidButton from '../../../components/button/solidButton'
import { formatDate, formatRelativeTime, formatTime } from '../../../utils/dateFormat'
import { store } from '../../../store/root'
import { observer } from 'mobx-react-lite'

interface Event {
  _id: string;
  trialDate: string;
  // ... other event properties
}

// Rename the functions to be more specific
const formatEventDate = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

const formatEventTime = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '';
  }
};

const EventDetailsScreen: FC<any> = observer(({ navigation }) => {
    const route = useRoute()
    const { eventId } = route.params as { eventId: string }
    const { events } = store;
  
    useEffect(() => {
      events.fetchSingleEvent(eventId);
    }, [eventId]);

    const event = events.currentEvent;
    // console.log

    if (events.loading) {
      return (
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading event details...</Text>
          </View>
        </SafeAreaProvider>
      );
    }

    if (!event) {
      return (
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Event not found</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => events.fetchSingleEvent(eventId)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaProvider>
      );
    }

    return (
      <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative' }}>
        <StatusBar backgroundColor={'transparent'} barStyle={'light-content'} />
        <ScrollView showsVerticalScrollIndicator={false}>
            {/* Event Image Placeholder */}
            <Image source={event?.file ? { uri: event.file } : require('../../../../assets/placeholder.png')} style={styles.image} />
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.tag}>
                <ArrowLeft size={24} color={'#fff'} />
            </TouchableOpacity>

            <View style={styles.wrapper}>
                {/* Event Title & Tags */}
                <Text style={styles.title}>{event?.name}</Text>

                {/* Event Info Card */}
                <View style={styles.section}>
                    <View style={styles.row}>
                        <Calendar color={theme.colors.primary} size={18} />
                        <View>
                            <Text style={styles.label}>Date & Time</Text>
                            <Text style={styles.value}>
                                {event?.trialDate ? `${formatEventDate(event.trialDate)} - ${formatEventTime(event.trialDate)}` : 'Date not available'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <MapPin size={18} color={theme.colors.primary} />

                        <View>
                            <Text style={styles.label}>Location</Text>
                            <Text style={styles.value}>{event?.location}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <UsersRound size={18} color={theme.colors.primary} />

                        <View>
                            <Text style={styles.label}>Attendees</Text>
                            <Text style={styles.value}>0/50 spots</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <Tickets size={18} color={theme.colors.primary} />

                        <View>
                            <Text style={styles.label}>Fee</Text>
                            <Text style={styles.value}>{event?.free ? "Free" : `$${event?.trialFees}`}</Text>
                        </View>
                    </View>

                    <View style={styles.row}>
                        <ClockFading size={18} color={theme.colors.primary}  />

                        <View>
                            <Text style={styles.label}>Application closes</Text>
                            <Text style={styles.value}>{formatDate(event?.registrationDeadline)}</Text>
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={styles.value}>Description</Text>
                    <Text style={styles.label}>{event?.description}</Text>
                </View>

                {/* Requirements */}
                <View style={styles.section}>
                    <Text style={styles.value}>Requirement</Text>
                    <View style={[styles.label, { marginBottom: spacing.sm}]}>
                        <Text style={{ fontSize: 14 }}>Documents</Text>
                        {event?.documentRequirement.map((item) => (
                            <Text style={styles.requirements}>• {item}</Text>
                        ))}
                    </View>

                    <View style={[styles.label, { marginBottom: spacing.sm}]}>
                        <Text style={{ fontSize: 14 }}>Equipment</Text>
                        {event?.equipmentNeeded.map((item) => (
                            <Text style={styles.requirements}>• {item}</Text>
                        ))}
                    </View>
                </View>

                {/* Organizer */}
                <View style={styles.section}>
                    <Text style={styles.value}>Organizer</Text>

                    <View style={styles.profileWrapper}>
                        {/* Organizer Image Placeholder */}
                        <Image source={{ uri: event?.file }} style={styles.contactImg} />
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: 'bold' }}>{event?.organizerName}</Text>
                            <Text style={{ fontSize: 12 }}>Head Talent Scout</Text>
                            <Text style={{ fontSize: 12, color: '#888' }}>Abuja, Nigeria</Text>
                        </View>
                    </View>

                    {/* Contact Organizer Button */}
                    <TouchableOpacity style={styles.contactBtn}>
                        <MessageSquareText size={typography.fontSize.lg} color={theme.colors.primary} />
                        <Text style={styles.btnText}>Contact Organizer</Text>
                    </TouchableOpacity>
                </View>

                {/* Organizer message */}
                <View style={styles.section}>
                    <Text style={styles.value}>Organizer's Message</Text>
                    <Text style={styles.label}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</Text>
                </View>

                <SolidButton title='Register' onPress={() => navigation.navigate('Register', { eventId })}/>
            </View>
        </ScrollView>
    </SafeAreaProvider>
  )
});

export default EventDetailsScreen;

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: 270,
    },
    tag: {
        position: 'absolute',
        top: 30,
        left: 10,
        backgroundColor: '#222',
        borderRadius: theme.borderRadius.rounded,
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    wrapper: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xl,
        borderTopRightRadius: theme.borderRadius.lg,
        borderTopLeftRadius: theme.borderRadius.lg,
    },
    section: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: theme.borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold', 
        marginBottom: spacing.lg,
        textTransform: 'capitalize'
    },
    label: {
        fontWeight: '400',
        fontSize: typography.fontSize.sm,
        marginBottom: spacing.xs
    },
    value: {
        fontSize: typography.fontSize.md,
        fontWeight: '600',
        marginBottom: spacing.md
    },
    contactImg: {
        width: 48, height: 48, borderRadius: 24, marginRight: 12 
    },
    profileWrapper: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center'
    },
    contactBtn: {
        borderColor: theme.colors.primary,
        borderWidth: 1,
        borderRadius: 8, 
        padding: 14, 

        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        justifyContent: 'center',

        marginTop: spacing.md
    },
    btnText: {
        fontSize: typography.fontSize.md,
        color: theme.colors.primary,
    },
    requirements: {
        textTransform: 'capitalize'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.colors.text.primary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    errorText: {
        fontSize: typography.fontSize.lg,
        color: theme.colors.text.primary,
        marginBottom: spacing.md,
    },
    retryButton: {
        padding: spacing.md,
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.md,
    },
    retryText: {
        color: '#fff',
        fontSize: typography.fontSize.md,
        fontWeight: '600',
    }
});