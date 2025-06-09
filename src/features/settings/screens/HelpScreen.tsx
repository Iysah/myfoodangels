import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { theme } from '../../../config/theme'
import Constants from 'expo-constants'
import SettingsHeader from '../../shared/components/SettingsHeader'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { spacing } from '../../../config/spacing'
import { ChevronRight, Facebook, InfoIcon, Instagram, Linkedin, Twitter } from 'lucide-react-native'
import { HelpIcon, LegalIcon, PrivacyIcon } from '../../../../assets/icons/settings'

const HelpScreen:FC<any> = ({ navigation }) => {
  return (
    <SafeAreaProvider style={{ backgroundColor: theme.colors.background, position: 'relative', paddingTop: Constants.statusBarHeight }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <SettingsHeader title='Help & Support' navigation={navigation} />
          
          <View style={GLOBALSTYLES.wrapper}>
            <View style={styles.settings}>
              {/* FaceBook */}
              <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('AccountSettings')}>
                <View style={styles.row}>
                  <Facebook size={18} color={theme.colors.text.primary} />
                  <Text>Facebook</Text>
                </View>

                <ChevronRight size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('Terms')} >
                <View style={styles.row}>
                  <Linkedin size={18} color={theme.colors.text.primary} />
                  <Text>LinkedIn</Text>
                </View>

                <ChevronRight size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('PrivacyPolicy')}>
                <View style={styles.row}>
                  <Twitter size={18} color={theme.colors.text.primary} />
                  <Text>Twitter</Text>
                </View>

                <ChevronRight size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.row, styles.settingsItem]} onPress={() => navigation.navigate('Help')} >
                <View style={styles.row}>
                  <Instagram size={18} color={theme.colors.text.primary} />
                  <Text>Instagram</Text>
                </View>

                <ChevronRight size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.row, styles.settingsItem]}>
                <View style={styles.row}>
                  <LegalIcon />
                  <Text>YouTube</Text>
                </View>

                <ChevronRight size={18} color={theme.colors.text.primary} />
              </TouchableOpacity>
                  
            </View>
          </View>
      </ScrollView>
    </SafeAreaProvider>
  )
}

export default HelpScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  settings: {
    backgroundColor: '#fff', 
    borderRadius: 12, 
    borderColor: theme.colors.borderColor,
    borderWidth: 1
  },
  settingsItem: {
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomColor: '#FFECEB',
    borderBottomWidth: 1
  }, 
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
},
})