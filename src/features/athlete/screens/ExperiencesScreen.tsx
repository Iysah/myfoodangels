import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft, Briefcase, Pencil, Plus } from 'lucide-react-native'
import { theme } from '../../../config/theme'
import { store } from '../../../store/root'
import { spacing } from '../../../config/spacing'
import { formatDate } from '../../../utils/dateFormat'
import { observer } from 'mobx-react-lite'

const ExperiencesScreen:FC<any> = observer(({ navigation }) => {
    const { userData } = store.auth
    
  return (
    <PageWrapper>
        <View style={styles.row}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <ArrowLeft size={24} color={theme.colors.text.primary}/>
            </TouchableOpacity>

            <Text style={styles.title}>Experience</Text>

            <TouchableOpacity onPress={() => navigation.navigate('AddExperience')}>
                <Plus size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            {userData?.experience.map(ach => (
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
})

export default ExperiencesScreen

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
        flex: 1,
        // backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 14, 
        marginBottom: 16,
        marginTop: spacing.lg,
        // borderColor: theme.colors.borderColor,
        // borderWidth: 1
    },
    achievementCard: { 
        marginBottom: 12,
        borderBottomColor: theme.colors.borderColor,
        borderBottomWidth: 1,
        marginHorizontal: 15
    },
    achievementItem: {
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexDirection: 'row-reverse',
        gap: spacing.md,
        paddingBottom: spacing.sm
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