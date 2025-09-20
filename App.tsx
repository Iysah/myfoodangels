import { StatusBar } from 'expo-status-bar';
import { Provider } from 'mobx-react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { Colors, Spacing } from './src/styles/globalStyles';
import { StoreProvider } from './src/contexts/StoreContext';


export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [fontsLoaded, setFontsLoaded] = useState(false);

  // useEffect(() => {
  //   async function loadFonts() {
  //     try {
  //       await Font.loadAsync({
  //         'Poppins-Regular': Poppins_400Regular,
  //         'Poppins-Medium': Poppins_500Medium,
  //         'Poppins-SemiBold': Poppins_600SemiBold,
  //         'Poppins-Bold': Poppins_700Bold,
  //       });
  //       setFontsLoaded(true);
  //     } catch (error) {
  //       console.error('Error loading fonts:', error);
  //       setFontsLoaded(true); // Continue even if fonts fail to load
  //     }
  //   }

  //   loadFonts();
  // }, []);

  // if (!fontsLoaded) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
  //       <ActivityIndicator size="large" color={Colors.primary} />
  //     </View>
  //   );
  // }


  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="auto" />
        <RootNavigator />
        <Toast />
      </StoreProvider>
    </SafeAreaProvider>
  );
}