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
import walletStore from '../../stores/WalletStore';
import authStore from '../../stores/AuthStore';
import { GlobalStyles, Colors } from '../../styles/globalStyles';
import { PaymentCard } from '../../types';

interface TopUpScreenProps {}

interface RouteParams {
  suggestedAmount?: number;
}

const TopUpScreen: React.FC<TopUpScreenProps> = observer(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { suggestedAmount } = (route.params as RouteParams) || {};

  const [amount, setAmount] = useState(suggestedAmount?.toString() || '');
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [showPaystack, setShowPaystack] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const quickAmounts = [1000, 2000, 5000, 10000, 20000, 50000];

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
    if (!topUpAmount || topUpAmount < 1) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₦1.00)');
      return;
    }

    if (!selectedCard) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsLoading(true);
    setShowPaystack(true);
  };

  const handlePaystackSuccess = async (response: any) => {
    try {
      setShowPaystack(false);
      setIsLoading(true);

      if (!walletStore.wallet) {
        throw new Error('Wallet not found');
      }

      const topUpRequest = {
        walletId: walletStore.wallet.id,
        amount: parseFloat(amount),
        paymentMethod: 'card' as const,
        cardId: selectedCard?.id,
        currency: walletStore.wallet.currency,
      };

      await walletStore.completeTopUp(topUpRequest, response.reference);
      
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
      Alert.alert('Error', error.message || 'Failed to complete top-up');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaystackCancel = () => {
    setShowPaystack(false);
    setIsLoading(false);
  };

  const handlePaystackError = (error: any) => {
    setShowPaystack(false);
    setIsLoading(false);
    Alert.alert('Payment Error', error.message || 'Payment failed');
  };

  const navigateToAddCard = () => {
    navigation.navigate('AddCard' as never);
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

  const isValidAmount = parseFloat(amount) >= 1;
  const canTopUp = isValidAmount && selectedCard && !isLoading;

  if (showPaystack && authStore.user) {
    // Placeholder for PaystackWebView - would be implemented with actual Paystack integration
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 20, color: Colors.label }}>Processing Payment...</Text>
        <TouchableOpacity 
          style={{ marginTop: 20, padding: 10 }}
          onPress={handlePaystackCancel}
        >
          <Text style={{ color: Colors.primary }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{ width: 50 }} />
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

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          
          {walletStore.cards.length === 0 ? (
            <TouchableOpacity style={styles.addCardButton} onPress={navigateToAddCard}>
              <Text style={styles.addCardText}>+ Add Payment Card</Text>
            </TouchableOpacity>
          ) : (
            <>
              {walletStore.cards.map((card: PaymentCard) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.cardItem,
                    selectedCard?.id === card.id && styles.cardItemSelected,
                  ]}
                  onPress={() => setSelectedCard(card)}
                >
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardBrand}>{card.cardBrand}</Text>
                    <Text style={styles.cardNumber}>**** **** **** {card.lastFourDigits}</Text>
                    <Text style={styles.cardExpiry}>
                      Expires {card.expiryMonth}/{card.expiryYear}
                    </Text>
                  </View>
                  {card.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
              
              <TouchableOpacity style={styles.addCardButton} onPress={navigateToAddCard}>
                <Text style={styles.addCardText}>+ Add Another Card</Text>
              </TouchableOpacity>
            </>
          )}
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
    </View>
  );
});

export default TopUpScreen;