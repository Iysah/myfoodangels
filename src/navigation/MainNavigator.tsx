import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { observer } from 'mobx-react-lite';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import WishListScreen from '../screens/Wishlist/WishlistScreen'
import TrackOrdersScreen from '../screens/TrackOrders/TrackOrdersScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import { MainTabParamList } from './types';
import { Colors } from '../styles/globalStyles';
import { Eye, Heart, House, Truck, UserRound } from 'lucide-react-native';

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
          height: 90,
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
            <House size={22} color={color}/>
          ),
        }}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishListScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Heart size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TrackOrders"
        component={TrackOrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Truck size={22} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <UserRound size={22} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
});

export default MainNavigator;