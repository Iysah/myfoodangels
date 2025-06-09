import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import SettingsHeader from '../../shared/components/SettingsHeader'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { ChevronRight } from 'lucide-react-native'
import { LockIcon, NotifyIcon } from '../../../../assets/icons/settings'
import { spacing } from '../../../config/spacing'

const AccountSettingScreen:FC<any> = ({ navigation}) => {
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <SettingsHeader title='Account Settings' navigation={navigation} />

            <View style={GLOBALSTYLES.wrapper}>
                <View style={styles.settings}>
                    <TouchableOpacity style={[styles.row, styles.settingsItem]}>
                        <View style={styles.row}>
                            <LockIcon />
                            <Text>Password</Text>
                        </View>

                        <ChevronRight size={18} color={theme.colors.text.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, styles.settingsItem, { borderBottomWidth: 0 }]}>
                        <View style={styles.row}>
                            <NotifyIcon />
                            <Text>Notifications</Text>
                        </View>

                        <ChevronRight size={18} color={theme.colors.text.primary} />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
      
    </SafeAreaProvider>
  ) 
}

export default AccountSettingScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    settings: {
        backgroundColor: '#fff', 
        borderRadius: 12, 
        borderColor: theme.colors.borderColor,
        borderWidth: 1,

        marginTop: spacing.lg
    },
    settingsItem: {
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomColor: '#FFECEB',
        borderBottomWidth: 1
    }, 
})