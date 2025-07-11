import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { theme } from '../../../config/theme'
import { spacing } from '../../../config/spacing'
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import { Calendar, Clock } from 'lucide-react-native';
import { typography } from '../../../config/typography';
import { formatDate } from '../../../utils/dateFormat';

interface cardProps {
    title: string;
    date: string;
    location: string;
    tag: string;
    requests: number;
    onPress: () => void;
}

const TrialCard = ({ title, date, location, tag, requests, onPress } : cardProps) => {
  return (
    <TouchableOpacity style={styles.card}>
        <View style={[styles.textWrapper, styles.bottomSpace]}>
            <Text style={styles.title}>{title}</Text>
            <View style={styles.tagWrapper}>
                <Text style={styles.tag}>{tag}</Text>
            </View>
        </View>
        <View style={[GLOBALSTYLES.row, styles.bottomSpace]}>
            <Calendar size={18} color={theme.colors.text.primary}/>
            <Text>{formatDate(date)}</Text>
        </View>
        <View style={[GLOBALSTYLES.row]}>
            <Clock size={18} color={theme.colors.text.primary} />
            <Text>{location}</Text>
        </View>

        <View style={GLOBALSTYLES.divider} />

        <View style={styles.textWrapper}>
            <View style={[GLOBALSTYLES.row]}>
                <View style={styles.requestWrapper}>
                    <Text style={styles.requestsCount}>{requests}</Text>
                </View>
                <Text>Pending Requests</Text>
            </View>

            <TouchableOpacity style={styles.outlineBtn} onPress={onPress}>
                <Text>View Details</Text>
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
  )
}

export default TrialCard

const styles = StyleSheet.create({
    card: {
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: theme.borderRadius.lg,

        padding: spacing.md
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: '600',
        textTransform: 'capitalize'
    },
    tagWrapper: {
        backgroundColor: theme.colors.lightBg,
        paddingHorizontal: 10,
        borderRadius: 30,
        paddingVertical: 4
    },
    tag: {
        fontSize: typography.fontSize.sm,
        
    },
    textWrapper: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',

    },
    bottomSpace: {
        marginBottom: spacing.md
    },
    requestWrapper: {
        backgroundColor: theme.colors.primary,
        padding: spacing.xs,
        borderRadius: theme.borderRadius.rounded,
        width: 25,
        height: 25, 
        alignItems: 'center',
        justifyContent: 'center',

    },
    requestsCount: {
        color: '#fff',
        fontSize: 10
    },
    outlineBtn: {
        borderColor: '#BBBBBB',
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 30,
    }
})