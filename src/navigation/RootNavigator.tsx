import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import CartScreen from '../screens/Cart/CartScreen';
import CheckoutScreen from '../screens/Checkout/CheckoutScreen';
import { useStores } from '../contexts/StoreContext';

import { RootStackParamList } from './types';

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator = observer(() => {
  const { authStore } = useStores();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthState = async () => {
      try {
        await authStore.checkAuthState();
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuthState();
  }, []);

  // Show loading screen while checking auth state
  if (isInitializing) {
    return null; // Or a loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Main app is always accessible for guest browsing */}
        <Stack.Screen name="Main" component={MainNavigator} />
        
        {/* Auth screens presented as modal when needed */}
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        {/* Other screens that are not part of the tab navigator */}
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        {/* 
        <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
        <Stack.Screen name="OrderConfirmation" component={OrderConfirmationScreen} />
        <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="AddCard" component={AddCardScreen} />
        <Stack.Screen name="TopUp" component={TopUpScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Reviews" component={ReviewsScreen} />
        <Stack.Screen name="MakeOffer" component={MakeOfferScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
});

export default RootNavigator;