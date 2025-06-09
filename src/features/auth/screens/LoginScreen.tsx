import React, { FC, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/root';
import { theme } from '../../../config/theme';
import PageWrapper from '../../../components/wrapper';
import { typography } from '../../../config/typography';
import CustomInput from '../../../components/CustomInput';
import { spacing } from '../../../config/spacing';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import SolidButton from '../../../components/button/solidButton';

const LoginScreen:FC<any> = observer(({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await store.auth.login(email, password);
      // navigation.navigate('')
      {store.auth.role?.toLowerCase() === "athlete" ? (
        navigation.navigate('AthleteTabs') 
      ) : store.auth.role?.toLowerCase() === "scout" ? (
        navigation.navigate('ScoutTabs') 
      ) : (
        navigation.navigation('Auth')
      )}
    } catch (error) {
      console.error('Login failed:', error);
      console.log(error)
    }
  };

  return (
    <PageWrapper>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subTitle}>Sign In to your account</Text>
      </View>
      
        
      <CustomInput
        label="Email address"
        placeholder="example@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        placeholderTextColor="gray"
        autoCapitalize="none"
      />

      <CustomInput
        label="Password"
        placeholder="*********"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="gray"
        secureTextEntry
        style={styles.passwordInput}
      />

      <Text style={[GLOBALSTYLES.label, styles.label]} onPress={() => navigation.navigate('ForgetPassword')}>Forgot Password?</Text>

      <SolidButton title={'Login'} onPress={handleLogin} isLoading={store.auth.isLoading} />

      {store.auth.error && (
        <Text style={styles.error}>{store.auth.error}</Text>
      )}

      <View style={styles.signupWrapper}>
        <Text style={GLOBALSTYLES.textCenter}>New to Confluexe? <Text style={GLOBALSTYLES.linkText} onPress={() => navigation.navigate('Signup')}>Sign up</Text></Text>
      </View>
    </PageWrapper>
  );
});

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
    marginBottom: spacing.lg,
    alignSelf: 'flex-end'
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.fontSize.md,
  },
  passwordInput: {
    color: theme.colors.text.primary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: {
    color: 'white',
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
  },
  error: {
    color: theme.colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  signupWrapper: {
    marginTop: 32
  }
});

export default LoginScreen; 