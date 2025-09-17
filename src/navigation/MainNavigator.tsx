import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { observer } from 'mobx-react-lite';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import ViewedScreen from '../screens/Viewed/ViewedScreen';
import TrackOrdersScreen from '../screens/TrackOrders/TrackOrdersScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { MainTabParamList } from './types';
import { Colors } from '../styles/globalStyles';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator = observer(() => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ color, fontSize: size }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Viewed"
        component={ViewedScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ color, fontSize: size }}>👁️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="TrackOrders"
        component={TrackOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ color, fontSize: size }}>📦</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Text style={{ color, fontSize: size }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
});

export default MainNavigator;