import React, { FC } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../config/theme'; // Assuming theme is accessible here
import { typography } from '../config/typography';
import { spacing } from '../config/spacing';

interface CustomModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomModal: FC<CustomModalProps> = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
              <Text style={[styles.modalButtonText, styles.confirmButtonText]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    width: '80%', // Adjust width as needed
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: theme.colors.text.secondary, // Using secondary text color for message
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: spacing.xs,
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
  },
  cancelButton: {
    borderColor: theme.colors.borderColor, // Using a border color
    backgroundColor: 'transparent',
  },
  cancelButtonText: {
    color: theme.colors.text.primary, // Using primary text color
  },
  confirmButton: {
    borderColor: theme.colors.error, // Assuming you have a danger color in theme
    backgroundColor: theme.colors.error, // Using danger color for confirmation (logout)
  },
  confirmButtonText: {
    color: '#fff', // White text for the danger button
  },
});

export default CustomModal; 