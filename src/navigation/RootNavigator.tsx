import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import CategoriesScreen from '../screens/Categories/CategoriesScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import ProductsScreen from '../screens/Products/ProductsScreen';
import ProductDetailsScreen from '../screens/Products/ProductDetailsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationScreen';

import { useStores } from '../contexts/StoreContext';

import { RootStackParamList } from './types';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import LikesScreen from '../screens/Likes/LikesScreen';
import AboutScreen from '../screens/Profile/AboutScreen';
import ReferScreen from '../screens/Profile/ReferScreen';
import FaqsScreen from '../screens/Profile/FaqsScreen';
import WalletScreen from '../screens/Wallet/WalletScreen';
import TopUpScreen from '../screens/Wallet/TopUpScreen';
import AddCardScreen from '../screens/Wallet/AddCardScreen';
import CouponsScreen from '../screens/Profile/CouponsScreen';
import { PaystackProvider } from "react-native-paystack-webview";

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = observer(() => {
  const { authStore, onboardingStore } = useStores();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check auth state and onboarding status
    const checkInitialState = async () => {
      try {
        await authStore.checkAuthState();
        await onboardingStore.loadOnboardingState();
      } finally {
        setIsInitializing(false);
      }
    };

    checkInitialState();
  }, []);

  // Show loading screen while checking auth state
  if (isInitializing) {
    return null; // Or a loading spinner
  }

  const paymentKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_TEST_KEY;

  return (
    <NavigationContainer>
      <PaystackProvider
          publicKey={`${paymentKey}`}
          debug
          currency={'NGN'}
          defaultChannels={['card', 'bank', 'bank_transfer']}
        >
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}
          initialRouteName={onboardingStore.hasSeenOnboarding === false ? "Auth" : "Main"}
        >
          {/* Main app is always accessible for guest browsing */}
          <Stack.Screen name="Main" component={MainNavigator} />
          
          {/* Auth screens presented as modal when needed */}
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{
              presentation: onboardingStore.hasSeenOnboarding === false ? 'card' : 'modal',
              headerShown: false,
            }}
          />
          {/* Other screens that are not part of the tab navigator */}
          <Stack.Screen name="Categories" component={CategoriesScreen} />
          <Stack.Screen name="Search" component={SearchScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="Cart" component={CartScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Likes" component={LikesScreen} />
          <Stack.Screen name="Refer" component={ReferScreen} />
          <Stack.Screen name="Faqs" component={FaqsScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Coupons" component={CouponsScreen} />
          <Stack.Screen name="AddCard" component={AddCardScreen} />
          <Stack.Screen name="TopUp" component={TopUpScreen} />
          {/* 
          <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
          <Stack.Screen name="About" component={AboutScreen} />
          <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="Reviews" component={ReviewsScreen} />
          <Stack.Screen name="MakeOffer" component={MakeOfferScreen} />
          */}
        </Stack.Navigator>
      </PaystackProvider>
    </NavigationContainer>
  );
});

export default RootNavigator;