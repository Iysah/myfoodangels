import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { theme } from '../../config/theme';
// import LoadingSpinner from './LoadingSpinner';

interface ThemeButtonProps {
  onPress: () => void;
  title: string;
  isLoading?: boolean; // Optional loading state
  loadingText?: string; // Optional text to show when loading
}

const SolidButton = ({
  onPress,
  title,
  isLoading = false, // Default to false
  loadingText = 'Processing...' // Default loading text
}: ThemeButtonProps) => {
  return (
    <TouchableOpacity
      style={[styles.buttonContainer, isLoading && styles.loadingButton]} // Add style for loading state
      onPress={onPress}
      disabled={isLoading} // Disable button when loading
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#fff" />
          {/* <Text style={[styles.buttonText, styles.loadingText]}>{loadingText}</Text> */}
        </View>
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    // fontFamily: 'Averta-Bold',
  },
  loadingButton: {
    opacity: 0.7, // Slightly dim the button when loading
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8, // Add some space between indicator and text
  }
});

export default SolidButton;