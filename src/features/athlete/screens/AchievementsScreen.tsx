import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React, { FC } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft, Award, Pencil, Plus } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import { spacing } from '../../../config/spacing'
import { store } from '../../../store/root'
import { formatDate } from '../../../utils/dateFormat'
import { observer } from 'mobx-react-lite'

const AchievementsScreen:FC<any>  = observer(({ navigation }) => {
    const { userData } = store.auth
  return (
    <PageWrapper>
        <View style={styles.row}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={24} color={theme.colors.text.primary}/>
            </TouchableOpacity>

            <Text style={styles.title}>Achievement</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AddAchievement')}>
                <Plus size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            {userData?.achievements.map(ach => (
                <View key={ach._id} style={styles.achievementCard}>
                    <View style={styles.achievementItem}>
                        <Pencil size={16} color={theme.colors.text.primary}/>
                        <View>
                            <Text style={styles.achievementTitle}>{ach.title}</Text>
                            <Text style={styles.achievementDate}>{formatDate(ach.date)}</Text>
                            <Text style={styles.achievementDesc}>{ach.description}</Text>
                        </View>
                    </View>
                </View>
            ))}
        </View>
    </PageWrapper>
  )
});

export default AchievementsScreen

const styles = StyleSheet.create({
    row: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row'
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        // marginBottom: spacing.xl,
    },
    section: { 
        // flex: 1,
        // backgroundColor: '#fff', 
        borderRadius: 12, 
        paddingVertical: 14, 
        marginBottom: 16,
        marginTop: spacing.lg,
    },
    achievementCard: { 
        marginBottom: 12,
        borderBottomColor: theme.colors.borderColor,
        borderBottomWidth: 1
    },
    achievementItem: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: 'row-reverse',
        gap: spacing.md,
        marginBottom: spacing.sm
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
})