import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';

const PhoneLoginScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore } = useStores();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const handleSendCode = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      // Format phone number to include country code if not already present
      const formattedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+1${phoneNumber}`; // Assuming US as default

      const verificationId = await authStore.sendPhoneVerificationCode(formattedPhoneNumber);
      setVerificationId(verificationId);
      setCodeSent(true);
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    try {
      await authStore.verifyPhoneCode(verificationId, verificationCode);
      // Navigation will be handled by the root navigator based on auth state
    } catch (error) {
      Alert.alert('Verification Failed', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const formattedPhoneNumber = phoneNumber.startsWith('+')
        ? phoneNumber
        : `+1${phoneNumber}`;

      const newVerificationId = await authStore.sendPhoneVerificationCode(formattedPhoneNumber);
      setVerificationId(newVerificationId);
      Alert.alert('Success', 'Verification code resent');
    } catch (error) {
      Alert.alert('Resend Failed', error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollView, GlobalStyles.screenPadding]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {codeSent ? 'Verify Code' : 'Phone Login'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          {!codeSent ? (
            <>
              <Text style={styles.subtitle}>
                Enter your phone number to receive a verification code
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSendCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Send Verification Code</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>
                Enter the 6-digit verification code sent to {phoneNumber}
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.actionButtonText}>Verify Code</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendButton}
                onPress={handleResendCode}
                disabled={isLoading}
              >
                <Text style={styles.resendButtonText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backButtonText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.label,
  },
  headerTitle: {
    ...GlobalStyles.h2,
  },
  placeholder: {
    width: 40,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    ...GlobalStyles.inputLabel,
  },
  input: {
    ...GlobalStyles.input,
  },
  actionButton: {
    ...GlobalStyles.primaryButton,
    marginBottom: Spacing.lg,
  },
  actionButtonText: {
    ...GlobalStyles.primaryButtonText,
  },
  resendButton: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resendButtonText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
  },
});

export default PhoneLoginScreen;