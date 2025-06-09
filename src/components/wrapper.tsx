import React from 'react';
import { View, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { GLOBALSTYLES } from '../styles/globalStyles'


const PageWrapper = ({ children, headerShown = false, statusBarColor = '#fff', statusBarStyle = 'dark-content' }: { children: React.ReactNode, headerShown?: boolean, statusBarColor?: string, statusBarStyle?: 'default' | 'light-content' | 'dark-content' }) => {
  return (
    <View style={[GLOBALSTYLES.container]}>
      <SafeAreaProvider style={{ backgroundColor: 'transparent', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <StatusBar backgroundColor={statusBarColor} barStyle={statusBarStyle} />
        <View style={[GLOBALSTYLES.wrapper]}>
          {children}
        </View>
      </SafeAreaProvider>
    </View>
  );
};

export default PageWrapper;