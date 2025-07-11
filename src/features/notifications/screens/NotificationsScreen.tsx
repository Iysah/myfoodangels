import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import { ArrowLeft } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import NotificationsList from '../components/NotificationsList'
import PageWrapper from '../../../components/wrapper'

const NotificationsScreen:FC<any> = ({ navigation }) => {
  return (
    <PageWrapper>
      <View style={styles.container}>
        <View  style={styles.row} >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
        </View>

        <NotificationsList />
      </View>
    </PageWrapper>
  )
}

export default NotificationsScreen

const styles = StyleSheet.create({
  wrapper: { 
    backgroundColor: theme.colors.background, 
    position: 'relative', 
    paddingTop: Constants.statusBarHeight,
  },
  container: {
    flex: 1,
    // paddingHorizontal: spacing.md
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: 15 
  },
  title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: 'bold',
      color: theme.colors.text.primary,
      // marginTop: 10,
  },
})