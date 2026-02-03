import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Modal,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, X } from 'lucide-react-native'
import PaystackWebView from '../../components/payment/PaystackWebView'
import walletStore from '../../stores/WalletStore'
import { useStores } from '../../contexts/StoreContext'
import PaystackService from '../../services/paystack/PaystackService'
import { GlobalStyles, Colors, Spacing } from '../../styles/globalStyles'
import { PaymentCard } from '../../types'
import Toast from '../../utils/Toast';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

interface TopUpScreenProps {}

interface RouteParams {
  suggestedAmount?: number;
}

const TopUpScreen: React.FC<TopUpScreenProps> = observer(() => {
  const navigation = useNavigation();
  const route = useRoute();
  const { suggestedAmount } = (route.params as RouteParams) || {};
  const { authStore } = useStores();
  
  const [amount, setAmount] = useState<string>(suggestedAmount?.toString() || '');
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authorizationUrl, setAuthorizationUrl] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [paystackVisible, setPaystackVisible] = useState(false);
  
  const quickAmounts = [100, 500, 1000, 2000, 5000, 10000];

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
    
    if (!topUpAmount || topUpAmount < 100) {
      Alert.alert('Error', 'Please enter a valid amount (minimum ₦100.00)');
      return;
    }

    setIsLoading(true);

    try {
      const paystack = PaystackService.getInstance();
      const reference = paystack.generateReference();
      
      const paymentData = paystack.preparePaymentData(
        authStore.user.email || '',
        topUpAmount,
        'NGN',
        reference,
        {
          userId: authStore.user.id,
          walletId: walletStore.wallet.id
        }
      );

      const response = await paystack.initializeTransaction(paymentData);

      if (response.status && response.data?.authorization_url) {
        setPaymentReference(reference);
        setAuthorizationUrl(response.data.authorization_url);
        setPaystackVisible(true);
      } else {
        throw new Error(response.message || 'Failed to initialize payment');
      }
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      Alert.alert('Error', error.message || 'Failed to initiate payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onNavigationStateChange = (state: any) => {
    const { url } = state;
    if (!url) return;

    // Check for success/callback URL
    if (url.includes('https://standard.paystack.co/close') || url.includes('callback')) {
      const reference = paymentReference;
      setAuthorizationUrl(null);
      setPaymentReference(null);
      
      if (reference) {
        handlePaymentVerification(reference);
      }
    }
  };

  const handlePaymentVerification = async (reference: string) => {
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

      await walletStore.completeTopUp(topUpRequest, reference, 'success');
      
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
      console.error('Top-up verification error:', error);
      Alert.alert('Error', error.message || 'Failed to verify top-up');
    } finally {
      setIsLoading(false);
    }
  };

  const isValidAmount = parseFloat(amount) >= 100;
  const canTopUp = isValidAmount && !isLoading;

  return (
    <View style={styles.container}>
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

        <PaystackWebView
          visible={paystackVisible}
          authorizationUrl={authorizationUrl}
          onSuccess={(reference) => {
            setPaystackVisible(false);
            setAuthorizationUrl(null);
            handlePaymentVerification(reference || paymentReference || '');
          }}
          onCancel={() => {
            setPaystackVisible(false);
            setAuthorizationUrl(null);
            setIsLoading(false);
          }}
          onError={(error) => {
            setPaystackVisible(false);
            setAuthorizationUrl(null);
            setIsLoading(false);
            Alert.alert('Payment Error', error);
          }}
        />

      </SafeAreaProvider>
    </View>
  );
});

export default TopUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: 'bold',
    color: Colors.label,
  },
  placeholder: {
    width: 32,
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
    fontWeight: '600',
    color: Colors.label,
    marginBottom: 15,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: Colors.gray.medium,
    borderRadius: 8,
    padding: 15,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.label,
    backgroundColor: Colors.white,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  quickAmountButton: {
    backgroundColor: Colors.gray.light,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 10,
    minWidth: '30%',
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    backgroundColor: Colors.primary,
  },
  quickAmountText: {
    color: Colors.label,
    fontWeight: '500',
  },
  quickAmountTextActive: {
    color: Colors.white,
  },
  topUpButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  topUpButtonDisabled: {
    backgroundColor: Colors.gray.medium,
  },
  topUpButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.label,
  },
  webViewLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});

