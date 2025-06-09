import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps, TouchableOpacity } from 'react-native';
import { theme } from '../config/theme';
import { typography } from '../config/typography';
import { Eye, EyeOff } from 'lucide-react-native';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  secureTextEntry?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  style,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.labelText}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            error ? styles.inputError : undefined,
            style,
          ]}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          {...props}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={togglePasswordVisibility}
          >
            {isPasswordVisible ? (
              <Eye size={20} color={theme.colors.text.secondary} />
            ) : (
              <EyeOff size={20} color={theme.colors.text.secondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  labelText: {
    fontSize: typography.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 48,
    backgroundColor: theme.colors.lightBg,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: typography.fontSize.md,
    borderColor: theme.colors.borderColor,
    borderWidth: 1,
  },
  inputError: {
    borderColor: theme.colors.error,
    borderWidth: 1,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: typography.fontSize.sm,
    marginTop: theme.spacing.xs,
  },
  eyeIcon: {
    position: 'absolute',
    right: theme.spacing.sm,
    top: '50%',
    transform: [{ translateY: -15 }],
    padding: 4,
  },
});

export default CustomInput; 