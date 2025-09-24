import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import AuthPrompt from '../../components/AuthPrompt';
import Constants from 'expo-constants';
import UserIcon from '../../../assets/icons/user';
import WalletsIcon from '../../../assets/icons/wallets';
import FaqsIcon from '../../../assets/icons/faqs';
import ReferIcon from '../../../assets/icons/refer';
import { Ticket, Tickets } from 'lucide-react-native'
import CouponIcon from '../../../assets/icons/coupons';

const ProfileScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore } = useStores();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleSignOut = async () => {
    try {
      await authStore.logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const profileMenuItems = [
    {
      id: 'edit-profile',
      title: 'Edit Profile',
      icon: UserIcon,
      onPress: () => navigation.navigate('EditProfile'),
    },
    {
      id: 'wallet',
      title: 'Wallet & Cards',
      icon: WalletsIcon,
      onPress: () => navigation.navigate('Wallet'),
    },
    {
      id: 'refer',
      title: 'Refer and Earn',
      icon: ReferIcon,
      onPress: () => navigation.navigate('Refer'),
    },
    {
      id: 'coupons',
      title: 'Coupons',
      icon: CouponIcon,
      onPress: () => navigation.navigate('Coupons'),
    },
    {
      id: 'faqs',
      title: 'FAQs',
      icon: FaqsIcon,
      onPress: () => navigation.navigate('Faqs'),
    }, 
  ];

  const renderMenuItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuItemLeft}>
        <item.icon style={styles.menuIcon} />
        <Text style={styles.menuTitle}>{item.title}</Text>
      </View>

      <Text> - </Text>
    </TouchableOpacity>
  );

  if (authStore.requiresAuthentication()) {
    return (
      <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        
        <View style={styles.authRequiredContainer}>
          <Text style={styles.authRequiredIcon}>👤</Text>
          <Text style={styles.authRequiredTitle}>Sign In Required</Text>
          <Text style={styles.authRequiredMessage}>
            Sign in to access your profile, manage your wallet, view settings, and more.
          </Text>
          <TouchableOpacity
            style={[GlobalStyles.primaryButton, styles.signInButton]}
            onPress={() => setShowAuthPrompt(true)}
          >
            <Text style={GlobalStyles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[GlobalStyles.secondaryButton, styles.createAccountButton]}
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
          >
            <Text style={GlobalStyles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.browseAsGuestButton}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          >
            <Text style={styles.browseAsGuestText}>Continue Browsing</Text>
          </TouchableOpacity>
        </View>

        <AuthPrompt
          visible={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          returnTo={{ screen: 'Profile' }}
          feature="your profile"
          message="Sign in to access your profile, manage settings, and view your account information."
        />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container]}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {authStore.user?.photoURL ? (
                <Image source={{ uri: authStore.user.photoURL }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>
                    {authStore.user?.displayName?.charAt(0) || authStore.user?.email?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.userName}>
              {authStore.user?.displayName || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {authStore.user?.email || authStore.user?.phoneNumber || ''}
            </Text>
          </View>

          <View style={styles.menuSection}>
            {profileMenuItems.map(renderMenuItem)}
          </View>

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>


          <View style={styles.versionCode}>
            <Text style={styles.versionCodeText}> Version 1.2.32</Text>
          </View>
        </ScrollView>
      </SafeAreaProvider>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.md,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize['2xl'],
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  userName: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  menuSection: {
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,

    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,

    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
  },
  menuTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  signOutButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  versionCode: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    // backgroundColor: Colors.background,
    alignItems: 'center',
  },
  versionCodeText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
    textAlign: 'center'
  },
  signOutText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.error,
  },
  authRequiredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  authRequiredIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  authRequiredTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  authRequiredMessage: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  signInButton: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    width: '80%',
  },
  createAccountButton: {
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
    width: '80%',
  },
  browseAsGuestButton: {
    paddingVertical: Spacing.sm,
  },
  browseAsGuestText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
});

export default ProfileScreen;