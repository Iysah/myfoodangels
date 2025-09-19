import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography, BorderRadius } from '../styles/globalStyles';

interface AuthPromptProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
  returnTo?: {
    screen: string;
    params?: any;
  };
}

const AuthPrompt: React.FC<AuthPromptProps> = ({
  visible,
  onClose,
  title = 'Sign In Required',
  message,
  feature = 'this feature',
  returnTo,
}) => {
  const navigation = useNavigation();

  const defaultMessage = `Please sign in to access ${feature}. You can create an account or sign in with your existing credentials.`;

  const handleSignIn = () => {
    onClose();
    navigation.navigate('Auth', { 
      screen: 'Login',
      params: returnTo ? { returnTo } : undefined
    });
  };

  const handleSignUp = () => {
    onClose();
    navigation.navigate('Auth', { 
      screen: 'Register',
      params: returnTo ? { returnTo } : undefined
    });
  };

  const handleContinueAsGuest = () => {
    onClose();
    // This will be handled by the calling component
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message || defaultMessage}</Text>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[GlobalStyles.primaryButton, styles.button]}
                onPress={handleSignIn}
              >
                <Text style={GlobalStyles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[GlobalStyles.secondaryButton, styles.button]}
                onPress={handleSignUp}
              >
                <Text style={GlobalStyles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    margin: Spacing.lg,
    maxWidth: 350,
    width: '90%',
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    width: '100%',
  },
  cancelButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
});

export default AuthPrompt;