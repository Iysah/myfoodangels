import { StyleSheet, Text, View } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import CustomInput from '../../../components/CustomInput'
import { theme } from '../../../config/theme'
import { spacing } from '../../../config/spacing'
import { typography } from '../../../config/typography'
import SolidButton from '../../../components/button/solidButton'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import { store } from '../../../store/root'
import { useToast } from '../../../../components/ui/toast'

const ForgetPassword:FC<any> = ({ navigation }) => {
    const [email, setEmail] = useState('')
    const { toast } = useToast();
    
    const handleForgetPassword = async () => {
        try {
            await store.auth.forgetPassword
            navigation.navigate('VerifyEmail', { email })
            toast({
                title: 'Success',
                description: 'Verification code sent to your email',
                variant: 'success',
            });
        } catch (error) {
            console.error(error)
        }
    }

  return (
    <PageWrapper>
        <View style={styles.textWrapper}>
            <Text style={styles.title}>Forgot Password</Text>
            {/* <Text style={styles.subTitle}>Sign In to your account</Text> */}
        </View>
      
        
        <CustomInput
            label="Email address"
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
        />
        <Text style={[GLOBALSTYLES.label, styles.label]}>We’ll send a verification code to this email or phone number if it matches an existing Confleuxe account.</Text>

        <SolidButton title='Next' onPress={handleForgetPassword} />
        <Text style={styles.back} onPress={() => navigation.goBack()}>Back</Text>
    </PageWrapper>
  )
}

export default ForgetPassword

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    textWrapper: {
        marginBottom: spacing.xl,
        marginTop: spacing.xl
    },
      title: {
        fontSize: typography.fontSize.xxl,
        fontWeight: 'bold',
        color: theme.colors.text.primary,
        marginBottom: spacing.sm,
    },
    subTitle: {
        fontSize: typography.fontSize.md,
        fontWeight: '400',
        lineHeight: 23,
    },
    label: {
        marginBottom: spacing.xxl,
        color: theme.colors.text.secondary
    },
    back: {
        textAlign: 'center',
        marginTop: spacing.lg,
        color: theme.colors.text.secondary
    }
})