import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePaystack } from 'react-native-paystack-webview';
import walletStore from '../../stores/WalletStore';
import authStore from '../../stores/AuthStore';
import PaystackService from '../../services/paystack/PaystackService';
import { GlobalStyles, Colors, Spacing } from '../../styles/globalStyles';
import { PaymentCard } from '../../types';
import { ArrowLeft } from 'lucide-react-native';
import Toast from '../../utils/Toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

interface TopUpScreenProps {}

interface RouteParams {
  suggestedAmount?: number;
}

const TopUpScreen: React.FC<TopUpScreenProps> = observer(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { suggestedAmount } = (route.params as RouteParams) || {};
  const { popup } = usePaystack();

  const [amount, setAmount] = useState(suggestedAmount?.toString() || '');
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 20000];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (authStore.user) {
        await walletStore.fetchPaymentCards(authStore.user.id);
        const defaultCard = walletStore.getDefaultCard();
        if (defaultCard) {
          setSelectedCard(defaultCard);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleanText = text.replace(/[^0-9.]/g, '');
    setAmount(cleanText);
  };

  const selectQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
  };

  const handleTopUp = async () => {
    if (!authStore.user || !walletStore.wallet) {
      Alert.alert('Error', 'User or wallet not found');
      return;
    }

    const topUpAmount = parseFloat(amount);
    
    if (!topUpAmount || topUpAmount < 5000) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₦5000.00)');
      return;
    }

    setIsLoading(true);

    const paystackService = PaystackService.getInstance();
    const reference = paystackService.generateReference();

    // Amount should be in kobo for Paystack (multiply naira by 100)
    popup.checkout({
      email: authStore.user.email || '',
      amount: topUpAmount * 100,
      reference: reference,
      onSuccess: handlePaystackSuccess,
      onCancel: handlePaystackCancel,
      onError: handlePaystackError,
    });
  };

  const handlePaystackSuccess = async (response: any) => {
    try {
      setIsLoading(true);

      if (!walletStore.wallet) {
        throw new Error('Wallet not found');
      }

      const topUpRequest = {
        walletId: walletStore.wallet.id || '',
        amount: parseFloat(amount),
        paymentMethod: 'card' as const,
        cardId: selectedCard?.id,
        currency: 'NGN',
      };

      // Pass payment status to match web app logic
      const paymentStatus = response.status || 'success';
      await walletStore.completeTopUp(topUpRequest, response.reference, paymentStatus);
      
      Alert.alert(
        'Success',
        `₦${amount} has been added to your wallet successfully!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Top-up completion error:', error);
      
      // Provide specific error messages based on error type
      let errorMessage = 'Failed to complete top-up';
      if (error.message.includes('Payment failed')) {
        errorMessage = 'Payment was not successful. Please try again.';
      } else if (error.message.includes('Wallet not found')) {
        errorMessage = 'Wallet not found. Please refresh and try again.';
      } else if (error.message.includes('network') || error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackCancel = () => {
    setIsLoading(false);
    Toast.info('Payment cancelled');
  };

  const handlePaystackError = (error: any) => {
    setIsLoading(false);
    console.error('Paystack error:', error);
    
    // Provide specific error messages for Paystack errors
    let errorMessage = 'Payment failed';
    if (error.message) {
      if (error.message.includes('network') || error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.message.includes('card') || error.message.includes('Card')) {
        errorMessage = 'Card error. Please check your card details and try again.';
      } else if (error.message.includes('insufficient') || error.message.includes('Insufficient')) {
        errorMessage = 'Insufficient funds. Please check your account balance.';
      } else {
        errorMessage = error.message;
      }
    }
    
    Alert.alert('Payment Error', errorMessage);
  };


  const isValidAmount = parseFloat(amount) >= 1;
  const canTopUp = isValidAmount && !isLoading;

  return (
    <View style={[styles.container]}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Fund Wallet</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Amount Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Enter Amount</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={handleAmountChange}
              placeholder="0.00"
              keyboardType="numeric"
              maxLength={10}
            />
            
            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsContainer}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    parseFloat(amount) === quickAmount && styles.quickAmountButtonActive,
                  ]}
                  onPress={() => selectQuickAmount(quickAmount)}
                >
                  <Text
                    style={[
                      styles.quickAmountText,
                      parseFloat(amount) === quickAmount && styles.quickAmountTextActive,
                    ]}
                  >
                    ₦{quickAmount.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Top Up Button */}
          <TouchableOpacity
            style={[styles.topUpButton, !canTopUp && styles.topUpButtonDisabled]}
            onPress={handleTopUp}
            disabled={!canTopUp}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.topUpButtonText}>
                Top Up ₦{amount || '0.00'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaProvider>
    </View>
  );
});

export default TopUpScreen;


  const styles = {
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.sm,
      backgroundColor: Colors.white,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    backButton: {
      padding: Spacing.xs,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: Colors.label,
    },
    placeholder: {
      width: 32,
    },
    backButtonText: {
      fontSize: 16,
      color: Colors.primary,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    section: {
      marginBottom: 30,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: Colors.label,
      marginBottom: 15,
    },
    amountInput: {
      borderWidth: 1,
      borderColor: Colors.gray.medium,
      borderRadius: 8,
      padding: 15,
      fontSize: 24,
      fontWeight: 'bold' as const,
      textAlign: 'center' as const,
      color: Colors.label,
      backgroundColor: Colors.white,
    },
    quickAmountsContainer: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      justifyContent: 'space-between' as const,
      marginTop: 15,
    },
    quickAmountButton: {
      backgroundColor: Colors.gray.light,
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderRadius: 20,
      marginBottom: 10,
      minWidth: '30%',
      alignItems: 'center' as const,
    },
    quickAmountButtonActive: {
      backgroundColor: Colors.primary,
    },
    quickAmountText: {
      color: Colors.label,
      fontWeight: '500' as const,
    },
    quickAmountTextActive: {
      color: Colors.white,
    },
    cardItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      backgroundColor: Colors.white,
      padding: 15,
      borderRadius: 8,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: Colors.gray.medium,
    },
    cardItemSelected: {
      borderColor: Colors.primary,
      backgroundColor: Colors.gray.light,
    },
    cardLeft: {
      flex: 1,
    },
    cardBrand: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: Colors.label,
      textTransform: 'uppercase' as const,
    },
    cardNumber: {
      fontSize: 16,
      color: Colors.label,
      marginTop: 2,
    },
    cardExpiry: {
      fontSize: 12,
      color: Colors.textSecondary,
      marginTop: 2,
    },
    defaultBadge: {
      backgroundColor: Colors.success,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 10,
      marginLeft: 10,
    },
    defaultBadgeText: {
      color: Colors.white,
      fontSize: 10,
      fontWeight: '600' as const,
    },
    addCardButton: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      backgroundColor: Colors.white,
      padding: 15,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Colors.primary,
      borderStyle: 'dashed' as const,
    },
    addCardText: {
      color: Colors.primary,
      fontWeight: '500' as const,
      marginLeft: 5,
    },
    topUpButton: {
      backgroundColor: Colors.primary,
      padding: 15,
      borderRadius: 8,
      alignItems: 'center' as const,
      marginTop: 30,
    },
    topUpButtonDisabled: {
      backgroundColor: Colors.gray.medium,
    },
    topUpButtonText: {
      color: Colors.white,
      fontSize: 16,
      fontWeight: '600' as const,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  };
