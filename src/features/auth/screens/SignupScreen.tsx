import React, { FC, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/root';
import { theme } from '../../../config/theme';
import { UserRole } from '../../../types/user';
import PageWrapper from '../../../components/wrapper';
import CustomInput from '../../../components/CustomInput';
import { typography } from '../../../config/typography';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import { signup } from '../services/api';
import SolidButton from '../../../components/button/solidButton';
import { Dropdown } from 'react-native-element-dropdown';
import { spacing } from '../../../config/spacing';

const SignupScreen:FC<any> = observer(({ navigation }) => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roleData = [
    { label: 'Athlete', value: UserRole.ATHLETE },
    { label: 'Scout', value: UserRole.SCOUT },
  ];

  const handleSignup = async () => {
    setSelectedRole(store.auth.role)
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Kindly fill all required input');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Error', 'Please select your role before signing up.');
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      store.auth.role = selectedRole;
      console.log(email, fullName, password, store.auth.role)
      await store.auth.register({
        email,
        password,
        name: fullName,
        accountType: selectedRole as UserRole,
      });
      setIsLoading(false);
      navigation.navigate('VerifyEmail', { email });
    } catch (error: any) {
      setIsLoading(false);
      console.log(error)
      console.error('Signup failed:', error);
    }
  };

  return (
    <PageWrapper>
      <View style={styles.container}>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>Ready to Dive In?</Text>
          <Text style={styles.subTitle}>Create your account to start showcasing or discovering talent!</Text>
        </View>

        <CustomInput
          label="Full name"
          placeholder="Adeola Adewale"
          value={fullName}
          onChangeText={setFullName}
          keyboardType="default"
          placeholderTextColor="gray"
          autoCapitalize="none"
          style={styles.nameInput}
        />
        
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

        {store.auth.role && (
          <View style={{ marginBottom: theme.spacing.md }}>
            <Text style={styles.roleText}>Selected Role: {store.auth.role}</Text>
          </View>
        )}

        {!store.auth.role && (
          <View style={styles.rolePickerContainer}>
            <Text style={styles.roleLabel}>Select your role</Text>
            <Dropdown
              data={roleData}
              labelField="label"
              valueField="value"
              placeholder="Select a role"
              value={selectedRole}
              onChange={(item) => {
                setSelectedRole(item.value);
                store.auth.role = item.value;
              }}
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              containerStyle={styles.dropdownContainer}
            />
          </View>
        )}

        <View>
          <Text style={styles.terms}>By selecting I agree, I have reviewed and agree to the <Text style={GLOBALSTYLES.linkText}>Terms of Use</Text> and acknowledge the <Text style={GLOBALSTYLES.linkText}>Privacy Policy</Text></Text>
        </View>
        
        <SolidButton 
          title={isLoading ? 'Joining....' : 'Agree & Join'} 
          onPress={handleSignup}
          isLoading={isLoading}
        />

        {error && (
          <Text style={styles.error}>{error}</Text>
        )}

        <Text style={styles.terms}>Already on Confluexe? <Text style={GLOBALSTYLES.linkText} onPress={() => navigation.navigate('Login')}>Login</Text></Text>
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
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
  },
  subTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '400',
    lineHeight: 23,
  },
  nameInput: {
    textTransform: 'capitalize'
  },
  passwordInput: {
    color: theme.colors.text.primary,
  },
  terms: {
    fontSize: typography.fontSize.sm,
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
    textAlign: 'center'
  },
  error: {
    color: theme.colors.error,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  roleText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  rolePickerContainer: {
    marginBottom: theme.spacing.md,
  },
  roleLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  dropdown: {
    height: 50,
    borderWidth: 1,
    borderColor: theme.colors.borderColor,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.lightBg,
  },
  placeholderStyle: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  selectedTextStyle: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.primary,
  },
  dropdownContainer: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
  },
});

export default SignupScreen; 