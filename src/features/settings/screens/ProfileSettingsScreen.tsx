import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import SettingsHeader from '../../shared/components/SettingsHeader'
import Constants from 'expo-constants'
import { theme } from '../../../config/theme'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GLOBALSTYLES } from '../../../styles/globalStyles'

const ProfileSettingsScreen:FC<any> = ({ navigation }) => {
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <SettingsHeader navigation={navigation} title="Profile Settings" />


      </ScrollView>
    </SafeAreaProvider>
  )
}

export default ProfileSettingsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
},
})