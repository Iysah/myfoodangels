import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { FC } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import SettingsHeader from '../../shared/components/SettingsHeader'
import { theme } from '../../../config/theme'

const PerformanceDetailsScreen:FC<any> = ({navigation }) => {
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <SettingsHeader title='Performance Media' navigation={navigation} />
      </ScrollView>
    </SafeAreaProvider>
  )
}

export default PerformanceDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  }
})