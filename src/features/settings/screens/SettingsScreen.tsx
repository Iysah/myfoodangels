import { ScrollView, Image, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native'
import React, { FC, useEffect, useState } from 'react'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import Constants from 'expo-constants'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import { typography } from '../../../config/typography'
import { ArrowLeft, Bell, ChevronRight, PenLine } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { store } from '../../../store/root'
import { AccountIcon, HelpIcon, InfoIcon, LegalIcon, LockIcon, LogoutIcon, PrivacyIcon } from '../../../../assets/icons/settings'
import SettingsHeader from '../../shared/components/SettingsHeader'
import { observer } from 'mobx-react-lite'
import { CommonActions } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useNavigation } from '@react-navigation/native'
import CustomModal from '../../../components/CustomModal'

const SettingsScreen:FC<any> = observer(() => {
    const { userData } = store.auth;
    const navigation:any = useNavigation();
    const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

    const handleLogout = async () => {
        try {
            await store.auth.logout();
            // Navigate to Auth screen
            navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
            });
        } catch (error: any) {
            Alert.alert(
                'Error',
                error.message || 'Failed to logout. Please try again.',
                [{ text: 'OK' }]
            );
        } 
    }

    const handleLogoutButtonPress = () => {
        setIsLogoutModalVisible(true);
    }

    const hideLogoutModal = () => {
        setIsLogoutModalVisible(false);
    }

    const isScout = userData?.role === 'Scout';
    
    return (
        <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <SettingsHeader navigation={navigation} title="Settings" />

                <View style={GLOBALSTYLES.wrapper}>
                    {isScout && (
                        <View style={styles.section}>
                            <View style={[styles.row, { justifyContent: 'space-between'}]}>
                                <View style={styles.profileWrapper}>
                                    <Image source={{
                                        uri: userData?.profileImg || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80'
                                    }} style={styles.profileImg} />
                                    <View>
                                        <Text style={styles.welcomeText}>
                                            {userData?.fullName}
                                        </Text>
                                        <Text style={styles.subtitle}>
                                            {userData?.email}
                                        </Text>
                                    </View>
                                </View>

                                {/* <TouchableOpacity onPress={() => navigation.navigate('ProfileSettings')}>
                                    <PenLine size={20} color={theme.colors.primary} />
                                </TouchableOpacity> */}
                            </View>
                        </View>
                    )}

                    <View style={styles.settings}>
                        <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('AccountSettings')}>
                            <View style={styles.row}>
                                <AccountIcon />
                                <Text>Account</Text>
                            </View>

                            <ChevronRight size={18} color={theme.colors.text.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('Terms')} >
                            <View style={styles.row}>
                                <InfoIcon />
                                <Text>Terms & Conditions</Text>
                            </View>

                            <ChevronRight size={18} color={theme.colors.text.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('PrivacyPolicy')}>
                            <View style={styles.row}>
                                <PrivacyIcon />
                                <Text>Privacy Policy</Text>
                            </View>

                            <ChevronRight size={18} color={theme.colors.text.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('Help')} >
                            <View style={styles.row}>
                                <HelpIcon />
                                <Text>Help and Support</Text>
                            </View>

                            <ChevronRight size={18} color={theme.colors.text.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.row, styles.settingsItem]}>
                            <View style={styles.row}>
                                <LegalIcon />
                                <Text>Legal</Text>
                            </View>

                            <ChevronRight size={18} color={theme.colors.text.primary} />
                        </TouchableOpacity>

                    <TouchableOpacity style={[styles.row, styles.settingsItem, { borderBottomWidth: 0 }]} onPress={handleLogoutButtonPress}>
                        <View style={styles.row}>
                            <LogoutIcon />
                            <Text style={styles.logout}>Log Out</Text>
                        </View>

                    </TouchableOpacity>
                    
                    </View>

                    <Text style={styles.version}>V 1.0.0</Text>
                </View>
            </ScrollView>
            <CustomModal
                isVisible={isLogoutModalVisible}
                title="Logout"
                message="Are you sure you want to logout?"
                onConfirm={() => {
                    handleLogout();
                    hideLogoutModal();
                }}
                onCancel={hideLogoutModal}
                confirmText="Logout"
                cancelText="Cancel"
            />
        </SafeAreaProvider>
  )
})

export default SettingsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: { 
        alignItems: 'center', 
        marginBottom: 16 ,

    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
    },
    profileWrapper: {
        justifyContent: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
      },
      welcomeText: {
        fontSize: typography.fontSize.xl,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
      },
      subtitle: {
        fontSize: typography.fontSize.md,
        color: theme.colors.text.secondary,
        opacity: 0.8,
        marginTop: theme.spacing.xs,
      },
      profileImg: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.xl
      },
    section: { 
        backgroundColor: '#fff', 
        borderRadius: 12, 
        padding: 14, 
        marginBottom: 16,
        borderColor: theme.colors.borderColor,
        borderWidth: 1
    },
    settings: {
        backgroundColor: '#fff', 
        borderRadius: 12, 
        borderColor: theme.colors.borderColor,
        borderWidth: 1
    },
    settingsItem: {
        justifyContent: 'space-between',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
        borderBottomColor: '#FFECEB',
        borderBottomWidth: 1
    }, 
    logout: {
        color: theme.colors.error,
        
    },
    version: {
        fontSize: typography.fontSize.sm,
        color: theme.colors.text.secondary,
        textAlign: 'center',

        marginTop: spacing.xxl
    }
})