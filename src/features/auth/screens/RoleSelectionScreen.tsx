import React, { FC, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { observer } from 'mobx-react-lite';
import { store } from '../../../store/root';
import { UserRole } from '../../../types/user';
import { theme } from '../../../config/theme';
import PageWrapper from '../../../components/wrapper';
import SolidButton from '../../../components/button/solidButton';
import { typography } from '../../../config/typography';
import { Check } from 'lucide-react-native';
import { GLOBALSTYLES } from '../../../styles/globalStyles';
import { spacing } from '../../../config/spacing';
import Constants from 'expo-constants';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const RoleSelectionScreen:FC<any> = observer(({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    store.auth.role = role;
    setError(null);
  };
  
  const handleSelectedRole = () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }
    navigation.navigate('SelectRole');
  }

  return (
    <LinearGradient
      // Button Linear Gradient
      colors={['#FFFFFF', '#EEEEFF']}
      style={{
          flex: 1,
      }}
    >
      <SafeAreaProvider style={{ backgroundColor: 'transparent', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <StatusBar backgroundColor={'#fff'} barStyle={'dark-content'} />
        <View style={GLOBALSTYLES.wrapper}>
          <Text style={styles.title}>Who Are You?</Text>
          
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === UserRole.ATHLETE && styles.selectedRoleButton
            ]}
            onPress={() => handleRoleSelection(UserRole.ATHLETE)}
          >
            <Text style={[
              styles.roleButtonText,
              selectedRole === UserRole.ATHLETE && styles.selectedRoleButtonText
            ]}>I'm an Athlete</Text>
            <Text style={[
              styles.roleDescription,
              selectedRole === UserRole.ATHLETE && styles.selectedRoleButtonText
            ]}>
              Showcase your skills, stats, and achievements to scouts
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.roleButton,
              selectedRole === UserRole.SCOUT && styles.selectedRoleButton
            ]}
            onPress={() => handleRoleSelection(UserRole.SCOUT)}
          >
            <Text style={[
              styles.roleButtonText,
              selectedRole === UserRole.SCOUT && styles.selectedRoleButtonText
            ]}>I'm a Scout</Text>
            <Text style={[
              styles.roleDescription,
              selectedRole === UserRole.SCOUT && styles.selectedRoleButtonText
            ]}>
              Discover talent, post events, and connect with athletes
            </Text>
          </TouchableOpacity>

          {error && <Text style={styles.error}>{error}</Text>}

          <SolidButton 
            title={selectedRole ? 'Next' : 'Select a Role'} 
            onPress={handleSelectedRole}
          />
          
          <View style={styles.authText}>
            <Text style={styles.terms}>Already on Confluexe?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text  style={GLOBALSTYLES.linkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaProvider>
    </LinearGradient>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
  },
  roleButton: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#B8C6E0',
  },
  selectedRoleButton: {
    backgroundColor: theme.colors.primary,
  },
  roleButtonText: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  selectedRoleButtonText: {
    color: theme.colors.surface,
  },
  roleDescription: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.secondary,
  },
  error: {
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  cardText: {
    fontSize: typography.fontSize.md,
    color: theme.colors.text.primary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.lightBg,
    marginVertical: theme.spacing.sm,
  },
  authText: {
    marginTop: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  terms: {
    fontSize: typography.fontSize.sm,
    color: theme.colors.text.secondary,
  },
});

export default RoleSelectionScreen; 