import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { CartItem } from '../../stores/CartStore';
import { PaymentCard } from '../../types/Wallet';
import { useStores } from '../../contexts/StoreContext';

const CheckoutScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, cartStore, walletStore, orderStore } = useStores();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redirect to auth if not authenticated
    if (authStore.requiresAuthentication()) {
      Alert.alert(
        'Authentication Required',
        'You must be signed in to proceed with checkout.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Auth', { screen: 'Login' }),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }

    // Load user's payment methods and wallet
    if (walletStore && authStore.user) {
      walletStore.fetchWallet(authStore.user.uid);
      walletStore.fetchPaymentCards(authStore.user.uid);
    }
  }, [authStore.isAuthenticated]);

  const handlePlaceOrder = async () => {
    if (authStore.requiresAuthentication()) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    if (cartStore.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty.');
      return;
    }

    setIsProcessing(true);

    try {
      // Validate payment method
      if (selectedPaymentMethod === 'wallet') {
        if (!walletStore.wallet || walletStore.wallet.balance < cartStore.total) {
          Alert.alert(
            'Insufficient Balance',
            'Your wallet balance is insufficient. Please top up your wallet or choose a different payment method.',
            [
              {
                text: 'Top Up Wallet',
                onPress: () => navigation.navigate('TopUp'),
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ]
          );
          setIsProcessing(false);
          return;
        }
      }

      // Create order
      const orderData = {
        userId: authStore.user.uid,
        items: cartStore.items.map((item: CartItem) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0] || '',
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price,
          totalPrice: (item.product.salePrice || item.product.price) * item.quantity,
          options: item.selectedOptions,
        })),
        subtotal: cartStore.total,
        tax: cartStore.total * 0.1, // 10% tax
        shippingCost: cartStore.total > 50 ? 0 : 5.99, // Free shipping over $50
        discount: 0,
        total: cartStore.total + (cartStore.total * 0.1) + (cartStore.total > 50 ? 0 : 5.99),
        paymentMethod: {
          type: selectedPaymentMethod,
          walletId: selectedPaymentMethod === 'wallet' ? walletStore.wallet?.id : undefined,
        },
        shippingAddress: {
          name: authStore.user.displayName || 'User',
          line1: '123 Main St', // In a real app, this would come from user profile
          city: 'City',
          state: 'State',
          postalCode: '12345',
          country: 'US',
          phoneNumber: authStore.user.phoneNumber || '',
        },
        status: 'pending',
      };

      const orderId = await orderStore.createOrder(orderData);

      // Process payment
      if (selectedPaymentMethod === 'wallet') {
        // Deduct from wallet
        const newBalance = walletStore.wallet.balance - orderData.total;
        await walletStore.updateWalletBalance(walletStore.wallet.id, newBalance);
      }

      // Clear cart
      cartStore.clearCart();

      // Navigate to order confirmation
      navigation.navigate('OrderConfirmation', { orderId });

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethods = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method</Text>
      
      {walletStore.wallet && (
        <TouchableOpacity
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === 'wallet' && styles.selectedPaymentMethod,
          ]}
          onPress={() => setSelectedPaymentMethod('wallet')}
        >
          <View style={styles.paymentMethodLeft}>
            <Text style={styles.paymentMethodIcon}>💳</Text>
            <View>
              <Text style={styles.paymentMethodTitle}>MyFoodAngels Wallet</Text>
              <Text style={styles.paymentMethodSubtitle}>
                Balance: ${walletStore.wallet.balance.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === 'wallet' && styles.radioButtonSelected,
          ]} />
        </TouchableOpacity>
      )}

      {walletStore.cards.map((card: PaymentCard) => (
        <TouchableOpacity
          key={card.id}
          style={[
            styles.paymentMethod,
            selectedPaymentMethod === card.id && styles.selectedPaymentMethod,
          ]}
          onPress={() => setSelectedPaymentMethod(card.id)}
        >
          <View style={styles.paymentMethodLeft}>
            <Text style={styles.paymentMethodIcon}>💳</Text>
            <View>
              <Text style={styles.paymentMethodTitle}>
                {card.cardBrand} •••• {card.lastFourDigits}
              </Text>
              <Text style={styles.paymentMethodSubtitle}>
                {card.cardholderName}
              </Text>
            </View>
          </View>
          <View style={[
            styles.radioButton,
            selectedPaymentMethod === card.id && styles.radioButtonSelected,
          ]} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={styles.addPaymentButton}
        onPress={() => navigation.navigate('AddCard')}
      >
        <Text style={styles.addPaymentText}>+ Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderSummary = () => {
    const subtotal = cartStore.total;
    const tax = subtotal * 0.1;
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + tax + shipping;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({cartStore.itemCount} items)</Text>
          <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${tax.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>
            {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
          </Text>
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  // Redirect if not authenticated
  if (authStore.requiresAuthentication()) {
    return null;
  }

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderPaymentMethods()}
        {renderOrderSummary()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            GlobalStyles.primaryButton,
            styles.placeOrderButton,
            isProcessing && styles.disabledButton,
          ]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          <Text style={GlobalStyles.primaryButtonText}>
            {isProcessing ? 'Processing...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});

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
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  section: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    marginBottom: Spacing.md,
  },
  paymentMethod: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.sm,
  },
  selectedPaymentMethod: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  paymentMethodTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  paymentMethodSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  addPaymentButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  addPaymentText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  summaryLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
  },
  summaryValue: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
  },
  totalValue: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    padding: Spacing.md,
  },
  placeOrderButton: {
    marginBottom: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
});

export default CheckoutScreen;