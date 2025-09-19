import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import walletStore from '../../stores/WalletStore';
import authStore from '../../stores/AuthStore';
import { GlobalStyles, Colors } from '../../styles/globalStyles';

interface AddCardScreenProps {}

const AddCardScreen: React.FC<AddCardScreenProps> = observer(() => {
  const navigation = useNavigation();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const formatCardNumber = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiryDate = (text: string) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardBrand = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'Mastercard';
    if (cleaned.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Card number validation
    const cleanedCardNumber = cardNumber.replace(/\s/g, '');
    if (!cleanedCardNumber) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanedCardNumber.length < 13 || cleanedCardNumber.length > 19) {
      newErrors.cardNumber = 'Invalid card number';
    }

    // Expiry date validation
    if (!expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry date format (MM/YY)';
    } else {
      const [month, year] = expiryDate.split('/');
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear() % 100;
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiryDate = 'Invalid month';
      } else if (parseInt(year) < currentYear || 
                (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    // CVV validation
    if (!cvv) {
      newErrors.cvv = 'CVV is required';
    } else if (cvv.length < 3 || cvv.length > 4) {
      newErrors.cvv = 'Invalid CVV';
    }

    // Cardholder name validation
    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    } else if (cardholderName.trim().length < 2) {
      newErrors.cardholderName = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCard = async () => {
    if (!validateForm()) {
      return;
    }

    if (!authStore.user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsLoading(true);

    try {
      const [month, year] = expiryDate.split('/');
      const cleanedCardNumber = cardNumber.replace(/\s/g, '');
      
      const newCard = {
        userId: authStore.user.id,
        cardholderName: cardholderName.trim(),
        cardBrand: getCardBrand(cleanedCardNumber),
        lastFourDigits: cleanedCardNumber.slice(-4),
        expiryMonth: month,
        expiryYear: `20${year}`,
        isDefault: walletStore.cards.length === 0, // First card becomes default
      };

      await walletStore.addPaymentCard(newCard);

      Alert.alert(
        'Success',
        'Payment card added successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add payment card');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.gray.medium,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: Colors.label,
    },
    backButton: {
      padding: 5,
    },
    backButtonText: {
      fontSize: 16,
      color: Colors.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    cardPreview: {
      backgroundColor: Colors.primary,
      borderRadius: 12,
      padding: 20,
      marginBottom: 30,
      minHeight: 180,
      justifyContent: 'space-between' as const,
    },
    cardBrand: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: 'bold' as const,
      textAlign: 'right' as const,
    },
    cardNumberPreview: {
      color: Colors.white,
      fontSize: 18,
      fontWeight: 'bold' as const,
      letterSpacing: 2,
      marginVertical: 20,
    },
    cardBottom: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-end' as const,
    },
    cardName: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '500' as const,
      textTransform: 'uppercase' as const,
    },
    cardExpiry: {
      color: Colors.white,
      fontSize: 14,
      fontWeight: '500' as const,
    },
    formSection: {
      marginBottom: 20,
    },
    inputContainer: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.label,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: Colors.gray.medium,
      borderRadius: 8,
      padding: 15,
      fontSize: 16,
      color: Colors.label,
      backgroundColor: Colors.white,
    },
    inputError: {
      borderColor: Colors.error,
    },
    errorText: {
      color: Colors.error,
      fontSize: 12,
      marginTop: 5,
    },
    rowInputs: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
    },
    halfInput: {
      flex: 0.48,
    },
    addButton: {
      backgroundColor: Colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center' as const,
      marginTop: 20,
    },
    addButtonDisabled: {
      backgroundColor: Colors.gray.medium,
    },
    addButtonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    securityNote: {
      backgroundColor: Colors.gray.light,
      padding: 15,
      borderRadius: 8,
      marginTop: 20,
    },
    securityNoteText: {
      fontSize: 12,
      color: Colors.textSecondary,
      textAlign: 'center' as const,
      lineHeight: 18,
    },
  };

  const isFormValid = cardNumber && expiryDate && cvv && cardholderName && Object.keys(errors).length === 0;

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Payment Card</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Card Preview */}
        <View style={styles.cardPreview}>
          <Text style={styles.cardBrand}>
            {getCardBrand(cardNumber)}
          </Text>
          
          <Text style={styles.cardNumberPreview}>
            {cardNumber || '•••• •••• •••• ••••'}
          </Text>
          
          <View style={styles.cardBottom}>
            <Text style={styles.cardName}>
              {cardholderName.toUpperCase() || 'CARDHOLDER NAME'}
            </Text>
            <Text style={styles.cardExpiry}>
              {expiryDate || 'MM/YY'}
            </Text>
          </View>
        </View>

        {/* Form */}
        <View style={styles.formSection}>
          {/* Card Number */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Card Number</Text>
            <TextInput
              style={[styles.input, errors.cardNumber && styles.inputError]}
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              placeholder="1234 5678 9012 3456"
              keyboardType="numeric"
              maxLength={19}
            />
            {errors.cardNumber && <Text style={styles.errorText}>{errors.cardNumber}</Text>}
          </View>

          {/* Expiry Date and CVV */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>Expiry Date</Text>
              <TextInput
                style={[styles.input, errors.expiryDate && styles.inputError]}
                value={expiryDate}
                onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                placeholder="MM/YY"
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.expiryDate && <Text style={styles.errorText}>{errors.expiryDate}</Text>}
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <Text style={styles.inputLabel}>CVV</Text>
              <TextInput
                style={[styles.input, errors.cvv && styles.inputError]}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
                secureTextEntry
              />
              {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
            </View>
          </View>

          {/* Cardholder Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Cardholder Name</Text>
            <TextInput
              style={[styles.input, errors.cardholderName && styles.inputError]}
              value={cardholderName}
              onChangeText={setCardholderName}
              placeholder="John Doe"
              autoCapitalize="words"
            />
            {errors.cardholderName && <Text style={styles.errorText}>{errors.cardholderName}</Text>}
          </View>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[styles.addButton, (!isFormValid || isLoading) && styles.addButtonDisabled]}
          onPress={handleAddCard}
          disabled={!isFormValid || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.addButtonText}>Add Card</Text>
          )}
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Text style={styles.securityNoteText}>
            🔒 Your card information is encrypted and securely stored. We use industry-standard security measures to protect your data.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default AddCardScreen;