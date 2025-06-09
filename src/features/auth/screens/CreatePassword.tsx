import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft } from 'lucide-react-native'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import { theme } from '../../../config/theme'
import SolidButton from '../../../components/button/solidButton'
import CustomInput from '../../../components/CustomInput'
import { observer } from 'mobx-react-lite'
import { store } from '../../../store/root'

const CreatePassword:FC<any> = observer(({ navigation, route }) => {
  const { email } = route.params;
  const [password, setPassword] = useState('')

  const handleResetPassword = async () => {
    try {
      await store.auth.createPassword(email, password);
      navigation.navigate('Login')
    } catch (error) {
      console.error('Login failed:', error);
      console.log(error)
    }
  }

  return (
    <PageWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={'#333333'} />
        </TouchableOpacity>

        <Text style={styles.title}>Create new Password</Text>
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.subTitle}>Enter the new password you will like to use when logging in to your account</Text>
      </View>

      <CustomInput
        label="Password"
        placeholder="*********"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <SolidButton title='Continue' onPress={handleResetPassword} />
    </PageWrapper>
  )
})

export default CreatePassword

const styles = StyleSheet.create({
  header: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  textWrapper: {
    marginTop: 32,
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
})