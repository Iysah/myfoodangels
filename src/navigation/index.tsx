import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { observer } from 'mobx-react-lite';
import { store } from '../store/root';
import { UserRole } from '../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Platform, Text, TouchableOpacity } from 'react-native';
import { MessageSquareText, Plus } from 'lucide-react-native';

// Onboarding Screens
import OnboardingWelcomeScreen from '../features/onboarding/screens/OnboardingWelcomeScreen';
import OnboardingRoleScreen from '../features/onboarding/screens/OnboardingRoleScreen';

// Auth Screens
import LoginScreen from '../features/auth/screens/LoginScreen';
import SignupScreen from '../features/auth/screens/SignupScreen';
import RoleSelectionScreen from '../features/auth/screens/RoleSelectionScreen';

// Athlete Screens
import AthleteHomeScreen from '../features/athlete/screens/HomeScreen';
import AthleteProfileScreen from '../features/athlete/screens/ProfileScreen';
import AthleteStatsScreen from '../features/athlete/screens/StatsScreen';
import AthleteVideosScreen from '../features/athlete/screens/VideosScreen';

// Scout Screens
import ScoutHomeScreen from '../features/scout/screens/HomeScreen';
import ScoutProfileScreen from '../features/scout/screens/ProfileScreen';
import EventCreationScreen from '../features/scout/screens/EventCreationScreen';
import TalentSearchScreen from '../features/scout/screens/TalentSearchScreen';

// Shared Screens
import ChatListScreen from '../features/chat/screens/ChatListScreen';
import ChatDetailScreen from '../features/chat/screens/ChatDetailScreen';
import NotificationsScreen from '../features/notifications/screens/NotificationsScreen';
import { Calendar, House, MessageSquare, Search, User } from 'lucide-react-native';
import { theme } from '../config/theme';
import CreateTrial from '../features/scout/screens/CreateTrial';

import ForgetPassword from '../features/auth/screens/ForgetPassword';
import VerifyEmail from '../features/auth/screens/VerifyEmail';
import CreatePassword from '../features/auth/screens/CreatePassword';

import TalentDetailsScreen from '../features/scout/screens/TalentDetailsScreen';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import ProfileSettingsScreen from '../features/settings/screens/ProfileSettingsScreen';
import AccountSettingScreen from '../features/settings/screens/AccountSettingScreen';
import PrivacyScreen from '../features/settings/screens/PrivacyScreen';
import TermsScreen from '../features/settings/screens/TermsScreen';
import HelpScreen from '../features/settings/screens/HelpScreen';

import { spacing } from '../config/spacing';
import VerifyOtp from '../features/auth/screens/VerifyOtp';
import { ScoutSearchScreen, PerformanceDetailsScreen, EventDetailsScreen, RegisterScreen, EditAboutScreen, AddAchievementScreen, AchievementsScreen, AddExperienceScreen, ExperiencesScreen, AddEducationScreen, EducationsScreen, AddStatisticsScreen, ProfileUpdateScreen } from '../features/athlete/screens';

import LookingForScreen from '../features/scout/screens/LookingForScreen';
import SportsScreen from '../features/scout/screens/SportsScreen';
import PostDetails from '../features/scout/screens/PostDetails';
import EditBioScreen from '../features/shared/screens/EditBioScreen';
import RequestsScreen from '../features/scout/screens/RequestsScreen';

// API imports for unread messages
import { fetchUnreadMessagesCount as fetchScoutUnreadCount } from '../features/scout/api';
import { fetchUnreadMessagesCount as fetchAthleteUnreadCount } from '../features/athlete/services/api';

// Types for unread messages response
interface UnreadMessagesResponse {
  data: {
    totalUnseen: number;
  };
  code: number;
  status: boolean;
}


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const OnboardingStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Onboarding navigator component
const OnboardingNavigator = () => {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="Welcome" component={OnboardingWelcomeScreen} />
      <OnboardingStack.Screen name="SelectRole" component={OnboardingRoleScreen} />
      <OnboardingStack.Screen name="Signup" component={SignupScreen} />
      <OnboardingStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name='ForgetPassword' component={ForgetPassword} />
      <AuthStack.Screen name='VerifyEmail' component={VerifyEmail} />
      <AuthStack.Screen name='VerifyOtp' component={VerifyOtp} />
      <AuthStack.Screen name='CreatePassword' component={CreatePassword} />
      <OnboardingStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    </OnboardingStack.Navigator>
  );
};

// Auth navigator component
const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="RoleSelection" component={RoleSelectionScreen} />
    </AuthStack.Navigator>
  );
};

// Custom Tab Bar Component with Badge
const CustomTabBar = ({ state, descriptors, navigation, userRole }: any) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const apiFunction = userRole === 'scout' ? fetchScoutUnreadCount : fetchAthleteUnreadCount;
        const response = await apiFunction() as UnreadMessagesResponse;
        setUnreadCount(response.data.totalUnseen || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [userRole]);

  return (
    <View style={{
      flexDirection: 'row',
      height: Platform.select({
        ios: userRole === 'scout' ? 90 : 85,
        android: userRole === 'scout' ? 85 : 85,
      }),
      backgroundColor: '#fff',
      borderTopWidth: 1,
      borderTopColor: '#E1E1E1',
      paddingBottom: Platform.select({
        android: spacing.md,
        ios: userRole === 'scout' ? spacing.lg : spacing.md
      })
    }}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined ? options.tabBarLabel : options.title !== undefined ? options.title : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        // Special handling for Messages tab with badge
        if (route.name === 'Messages') {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{ alignItems: 'center' }}
              >
                <View style={{ position: 'relative' }}>
                  <MessageSquareText 
                    size={24} 
                    color={isFocused ? theme.colors.primary : theme.colors.text.secondary} 
                  />
                  {unreadCount > 0 && (
                    <View style={{
                      position: 'absolute',
                      top: -5,
                      right: -8,
                      backgroundColor:  theme.colors.primary,
                      borderRadius: 10,
                      minWidth: 20,
                      height: 20,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 2,
                      borderColor: '#fff',
                    }}>
                      <Text style={{
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 'bold',
                      }}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={{
                  color: isFocused ? theme.colors.primary : theme.colors.text.secondary,
                  fontSize: 12,
                  marginTop: 4,
                }}>
                  {label}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }

        // Special handling for CreateTrial tab (scout only)
        if (route.name === 'CreateTrial') {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 28,
                  backgroundColor: theme.colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Plus size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }

        // Special handling for Videos tab (athlete only)
        if (route.name === 'Videos') {
          return (
            <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 28,
                  backgroundColor: theme.colors.primary,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: -24,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Plus size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          );
        }

        // Default tab rendering
        return (
          <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={{ alignItems: 'center' }}
            >
              {options.tabBarIcon({ color: isFocused ? theme.colors.primary : theme.colors.text.secondary })}
              <Text style={{
                color: isFocused ? theme.colors.primary : theme.colors.text.secondary,
                fontSize: 12,
                marginTop: 4,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const AthleteTabs = () => (
  <Tab.Navigator 
    screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
    }}
    tabBar={(props) => <CustomTabBar {...props} userRole="athlete" />}
  >
    <Tab.Screen 
      name="Home" 
      component={AthleteHomeScreen} 
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <House size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Activities" 
      component={AthleteStatsScreen} 
      options={{
        title: 'Activities',
        tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Videos" 
      component={AthleteVideosScreen} 
      options={{
        tabBarLabel: () => null,
      }} 
    />
    <Tab.Screen 
      name="Messages" 
      component={ChatListScreen} 
      options={{
        title: 'Messages',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={AthleteProfileScreen} 
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <User size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const ScoutTabs = () => (
  <Tab.Navigator 
    screenOptions={{ 
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.text.secondary,
    }}
    tabBar={(props) => <CustomTabBar {...props} userRole="scout" />}
  >
    <Tab.Screen 
      name="Home" 
      component={ScoutHomeScreen} 
      options={{
        title: 'Home',
        tabBarIcon: ({ color }) => <House size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="Activities" 
      component={EventCreationScreen} 
      options={{
        title: 'Activities',
        tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
      }}
    />
    <Tab.Screen 
      name="CreateTrial" 
      component={CreateTrial}
      options={{
        tabBarLabel: () => null,
      }} 
    />
    <Tab.Screen 
      name="Messages" 
      component={ChatListScreen} 
      options={{
        title: 'Messages',
      }}
    />
    <Tab.Screen 
      name="Profile" 
      component={ScoutProfileScreen} 
      options={{
        title: 'Profile',
        tabBarIcon: ({ color }) => <User size={24} color={color} />,
      }}
    />
  </Tab.Navigator>
);

const Navigation = observer(() => {
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has completed onboarding
    const checkOnboardingStatus = async () => {
      try {
        const onboardingCompleted = await AsyncStorage.getItem('onboardingCompleted');
        setHasOnboarded(onboardingCompleted === 'true');
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setHasOnboarded(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Show a loading screen while checking status
  if (isLoading) {
    return null; // Or return a loading component
  }
  console.log('Auth Role:', store.auth.role);

  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
          <>
            {!hasOnboarded ? (
              // Onboarding flow for first-time users
              <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
            ) : null}
            <Stack.Screen name="Auth" component={AuthNavigator} />
            <Stack.Screen name="AthleteTabs" component={AthleteTabs} />
            <Stack.Screen name="ScoutTabs" component={ScoutTabs} />
            <Stack.Screen name="SearchScout" component={ScoutSearchScreen} />

            {/* Athletes */}
            <Stack.Screen name="SearchTalent" component={TalentSearchScreen} />
            <Stack.Screen name='Register' component={RegisterScreen} options={{ animation: 'slide_from_right'}} />
            <Stack.Screen name='PerformanceDetails' component={PerformanceDetailsScreen} />
            <Stack.Screen name='EditBio' component={EditBioScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='EditAbout' component={EditAboutScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='AddAchievement' component={AddAchievementScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='Achievements' component={AchievementsScreen} />
            <Stack.Screen name='AddExperience' component={AddExperienceScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='Experiences' component={ExperiencesScreen} />
            <Stack.Screen name='AddEducation' component={AddEducationScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='Educations' component={EducationsScreen} />
            <Stack.Screen name='AddStatistics' component={AddStatisticsScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='ProfileUpdate' component={ProfileUpdateScreen} />

            {/* Scout */}
            <Stack.Screen name='TalentDetails' component={TalentDetailsScreen} options={{ animation: 'simple_push' }} />
            <Stack.Screen name='LookingFor' component={LookingForScreen} options={{ animation: 'slide_from_bottom'}}/>
            <Stack.Screen name='Sports' component={SportsScreen} options={{ animation: 'slide_from_bottom'}} />
            <Stack.Screen name='PostDetails' component={PostDetails} options={{ animation: 'simple_push' }} />
            <Stack.Screen name='Requests' component={RequestsScreen} options={{ animation: 'simple_push' }} />


            {/* General */}
            <Stack.Screen name="Chats" component={ChatListScreen} />
            <Stack.Screen name='ChatDetail' component={ChatDetailScreen} />
            <Stack.Screen name='EventDetails' component={EventDetailsScreen} options={{ animation: 'simple_push'}} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ animation: 'simple_push'}} />

            {/* Settings */}
            <Stack.Screen name='Settings' component={SettingsScreen}  options={{ animation: 'simple_push'}} />
            <Stack.Screen name='ProfileSettings' component={ProfileSettingsScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name='AccountSettings' component={AccountSettingScreen} options={{ animation: 'slide_from_right'}} />
            <Stack.Screen name='PrivacyPolicy' component={PrivacyScreen} options={{ animation: 'slide_from_right' }} />
            <Stack.Screen name='Terms' component={TermsScreen} options={{ animation: 'slide_from_right'}} />
            <Stack.Screen name='Help' component={HelpScreen} options={{ animation: 'slide_from_right'}} />
          </>

      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default Navigation; 