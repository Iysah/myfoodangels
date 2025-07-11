import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { spacing } from '../../../config/spacing';
import { theme } from '../../../config/theme';
import { LoaderCircle, MessageSquareText, UserRound, Volume2 } from 'lucide-react-native';
import { typography } from '../../../config/typography';
import { formatRelativeTime } from '../../../utils/dateFormat';

interface NotificationItemProps {
    text: string;
    title: string;
    type: 'seen' | 'unseen';
    date?: string;
}

const NotificationItem = ({ text, title, type, date }: NotificationItemProps) => {
  const renderIcon = () => {
    if (title.toLowerCase().includes('applied')) {
      return <UserRound size={18} color={theme.colors.text.primary}/>;
    } else if (title.toLowerCase().includes('pending')) {
      return <LoaderCircle size={18} color={theme.colors.text.primary} />;
    } else if (title.toLowerCase().includes('message')) {
      return <MessageSquareText size={18} color={theme.colors.text.primary} />;
    } else {
      return <Volume2 size={18} color={theme.colors.text.primary} />;
    }
  };

  return (
    <View style={[styles.itemWrapper, type === 'unseen' && styles.unseenItem]}>
        <View style={styles.iconWrapper}>
            {renderIcon()}
        </View>
        <View style={styles.textWrapper}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{text}</Text>
            {date && <Text style={styles.date}>{formatRelativeTime(date)}</Text>}
        </View>
    </View>
  )
}

export default NotificationItem

const styles = StyleSheet.create({
    itemWrapper: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'row',
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomColor: '#DDDDDD',
        borderBottomWidth: .8,
    },
    unseenItem: {
        backgroundColor: '#F5F5F5',
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.rounded,
        backgroundColor: '#E1E1E1',
        justifyContent: 'center',
        alignItems: 'center'
    },
    textWrapper: {
        flex: 1,
        justifyContent: 'flex-start',
        flexDirection: 'column',
        gap: spacing.xs,
    },
    title: {
        fontSize: typography.fontSize.md,
        fontWeight: '500',
        color: theme.colors.text.primary,
    },
    description: {
        fontSize: typography.fontSize.sm,
        color: theme.colors.text.secondary,
    },
    date: {
        fontSize: typography.fontSize.sm,
        fontWeight: '400',
        color: theme.colors.text.secondary,
        marginTop: spacing.xs,
    }
});