import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import ToastService from '../../utils/Toast';
import { AuthStackParamList } from '../../navigation/types';
<<<<<<< HEAD
import { Eye, EyeClosed } from 'lucide-react-native';
=======
>>>>>>> d72154d2ef68080001207d733f6189a7000d9fdd

type LoginScreenRouteProp = RouteProp<AuthStackParamList, 'Login'>;

const LoginScreen = observer(() => {
  const { authStore } = useStores();
  const navigation = useNavigation();
  const route = useRoute<LoginScreenRouteProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const returnTo = route.params?.returnTo;

  const handleLogin = async () => {
    if (!email || !password) {
      ToastService.error('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await authStore.loginWithEmail(email, password);
      ToastService.success('Welcome back!', 'You have successfully logged in');
      
      // Navigate back if returnTo is provided, otherwise let root navigator handle it
      if (returnTo) {
        // Use setTimeout to ensure auth state is updated first
        setTimeout(() => {
          navigation.goBack();
        }, 100);
      }
      // Otherwise, navigation will be handled by the root navigator based on auth state
    } catch (error: any) {
      ToastService.error('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('Auth', { screen: 'ForgotPassword' });
  };

  const handleRegister = () => {
    navigation.navigate('Auth', { screen: 'Register' });
  };

  const handlePhoneLogin = () => {
    navigation.navigate('Auth', { screen: 'PhoneLogin' });
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await authStore.loginWithGoogle();
      // Navigation will be handled by the root navigator based on auth state
    } catch (error: any ) {
      Alert.alert('Google Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await authStore.loginWithApple();
      // Navigation will be handled by the root navigator based on auth state
    } catch (error: any) {
      Alert.alert('Apple Login Failed', error.message);
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
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {/* <View style={styles.logoContainer}>
            <Text style={styles.logoText}>MyFoodAngels</Text>
            <Image source={require('../../../assets/mfa-icon.png')} style={styles.logo} />
          </View> */}

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue shopping with us</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <Eye size={18} /> : <EyeClosed size={18} />}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotPasswordButton}
            onPress={handleForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity
            style={styles.phoneLoginButton}
            onPress={handlePhoneLogin}
          >
            <Text style={styles.phoneLoginText}>Login with Phone Number</Text>
          </TouchableOpacity> */}

          <View style={styles.orContainer}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.orLine} />
          </View>

          <View style={styles.socialButtonsContainer}>
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.socialButtonText}>G</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleAppleLogin}
            >
              <Text style={styles.socialButtonText}>A</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleRegister}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
          </View>
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
    padding: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: Typography.fontSize.xxl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  title: {
    ...GlobalStyles.h1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.label,
    marginBottom: Spacing.xs,
    fontFamily: Typography.fontFamily.medium,
  },
  input: {
    ...GlobalStyles.input,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    backgroundColor: Colors.inputBackground,
  },
  passwordInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
  },
  eyeIcon: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
  },
  forgotPasswordText: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
  },
  loginButton: {
    ...GlobalStyles.primaryButton,
    marginBottom: Spacing.md,
  },
  loginButtonText: {
    ...GlobalStyles.primaryButtonText,
  },
  phoneLoginButton: {
    ...GlobalStyles.secondaryButton,
    marginBottom: Spacing.lg,
  },
  phoneLoginText: {
    ...GlobalStyles.secondaryButtonText,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  orText: {
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.sm,
    fontSize: Typography.fontSize.sm,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
  },
  socialButtonText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  registerLink: {
    color: Colors.primary,
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
  },
});

export default LoginScreen;