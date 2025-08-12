import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { FC, useState } from 'react'
import PageWrapper from '../../../components/wrapper'
import { ArrowLeft } from 'lucide-react-native'
import { GLOBALSTYLES } from '../../../styles/globalStyles'
import ThemeOTPInput from '../components/OtpInput'
import { store } from '../../../store/root'
import SolidButton from '../../../components/button/solidButton'
import { theme } from '../../../config/theme'
import { typography } from '../../../config/typography'
import { spacing } from '../../../config/spacing'
import { useToast } from '../../../../components/ui/toast'

const VerifyEmail:FC<any> = ({ navigation, route }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleVerify = async () => {
    try {
      setIsLoading(true);
      const otpString = otp.join('');
      await store.auth.verifyEmail(email, otpString);
      toast({
        title: 'Success',
        description: 'Account verified successfully',
        variant: 'success',
      });
      navigation.navigate('Login');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setIsLoading(true);
      await store.auth.resendVerificationEmail(email);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Resend failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color={'#333333'} />
        </TouchableOpacity>

        <Text style={styles.title}>Account Verification</Text>
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.subTitle}>Enter the 4-digit code sent to {email}</Text>
        <Text style={styles.subTitle}>Code expires in 15 minutes </Text>
      </View>

      <ThemeOTPInput otp={otp} setOtp={setOtp} error={!!error} />

      {error && (
        <Text style={styles.error}>{error}</Text>
      )}

      <SolidButton 
        title={'Verify Email'}
        onPress={handleVerify}
        isLoading={store.auth.isLoading}
      />

      <Text style={styles.resendText}>Didn't get the code? <Text style={GLOBALSTYLES.linkText} onPress={handleResend}>Click here to resend</Text></Text>
    </PageWrapper>
  )
}

export default VerifyEmail

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
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  resendText: {
    textAlign: 'center',
    marginTop: spacing.md,
  }
})