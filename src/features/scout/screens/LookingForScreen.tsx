import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { theme } from '../../../config/theme'
import { X } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import CustomInput from '../../../components/CustomInput'
import { store } from '../../../store/root'

const LookingForScreen:FC<any> = ({ navigation }) => {
  const { userData } = store.auth
  const [athletes, setAthletes] = useState<any>(userData?.fullName)

  return (
    <PageWrapper>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <X size={32} color={theme.colors.text.primary} style={styles.backBtn} />
      </TouchableOpacity>
      <Text style={styles.title}>Looking For</Text>

      <Text style={styles.subTitle}>Write about yourself to easily discover opportunities, also Scout can reach you faster.</Text>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <CustomInput
          label="Athletes"
          placeholder=""
          value={athletes}
          onChangeText={setAthletes}
          keyboardType="default"
          autoCapitalize="none"
        />
      </ScrollView>

    </PageWrapper>
  )
}

export default LookingForScreen

const styles = StyleSheet.create({
  container: {
      paddingBottom: 100
  },
  backBtn: {
      marginBottom: spacing.lg
  },
  title: {
      fontSize: 24,
      fontWeight: '700',
      marginBottom: spacing.xl,
  },
  subTitle: {
    marginBottom: spacing.lg,
    fontSize: typography.fontSize.md,
    fontWeight: '400',
    color: '#515151'
  },
})