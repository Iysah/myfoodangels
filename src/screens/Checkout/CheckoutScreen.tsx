import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { CartItem } from '../../stores/CartStore';
import { PaymentCard } from '../../types/Wallet';
import { CheckoutBillingAddress, DeliveryLocation } from '../../types/Delivery';
import { AppliedCoupon } from '../../types/Coupon';
import { deliveryService } from '../../services/firebase/deliveryService';
import { couponService } from '../../services/firebase/couponService';
import { useStores } from '../../contexts/StoreContext';
import { Wallet, CreditCard, Landmark, Smartphone } from 'lucide-react-native';
import Constants from 'expo-constants';

const CheckoutScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, cartStore, orderStore, walletStore } = useStores();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Billing Address State
  const [billingAddress, setBillingAddress] = useState<CheckoutBillingAddress>({
    fullName: authStore.user?.displayName || '',
    email: authStore.user?.email || '',
    phoneNumber: authStore.user?.phoneNumber || '',
    deliveryAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Nigeria',
  });
  
  // Delivery Location State
  const [deliveryLocations, setDeliveryLocations] = useState<DeliveryLocation[]>([]);
  const [selectedDeliveryLocation, setSelectedDeliveryLocation] = useState<DeliveryLocation | null>(null);
  const [loadingDeliveryLocations, setLoadingDeliveryLocations] = useState(false);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<string>('');
  
  // Delivery Dropdown State
  const [isFocus, setIsFocus] = useState(false);

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
      walletStore.fetchUserWallet(authStore.user.id);
      walletStore.fetchPaymentCards(authStore.user.id);
    }
  }, [authStore.isAuthenticated]);

  useEffect(() => {
    if (authStore.user) {
      walletStore.fetchUserWallet(authStore.user.id, authStore.user.email, authStore.user.displayName || authStore.user.email);
      
      // Update billing address with user data
      setBillingAddress(prev => ({
        ...prev,
        fullName: authStore.user?.displayName || prev.fullName,
        email: authStore.user?.email || prev.email,
        phoneNumber: authStore.user?.phoneNumber || prev.phoneNumber,
      }));
    }
  }, [authStore.user]);

  // Load delivery locations
  useEffect(() => {
    const loadDeliveryLocations = async () => {
      setLoadingDeliveryLocations(true);
      try {
        const locations = await deliveryService.getDeliveryLocations();
        setDeliveryLocations(locations);
        
        // Set default location (Apapa as mentioned in requirements)
        const defaultLocation = locations.find(loc => loc.slug === 'apapa');
        if (defaultLocation) {
          setSelectedDeliveryLocation(defaultLocation);
        }
      } catch (error) {
        console.error('Error loading delivery locations:', error);
        Alert.alert('Error', 'Failed to load delivery locations. Please try again.');
      } finally {
        setLoadingDeliveryLocations(false);
      }
    };

    loadDeliveryLocations();
  }, []);

  // Coupon handling functions
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert('Error', 'Please enter a coupon code');
      return;
    }

    setValidatingCoupon(true);
    try {
      const orderTotals = calculateOrderTotal();
      const result = await couponService.validateCoupon(couponCode.trim(), orderTotals.subtotal, cartStore.items);
      
      if (result.isValid && result.discountAmount) {
        setAppliedCoupon({
          coupon: {
            id: '',
            code: couponCode.trim().toUpperCase(),
            title: 'Discount Applied',
            description: '',
            discountType: 'fixed_amount',
            discountValue: result.discountAmount,
            usedCount: 0,
            isActive: true,
            validFrom: new Date(),
            validUntil: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          discountAmount: result.discountAmount,
        });
        Alert.alert('Success', result.message);
        setCouponCode('');
      } else {
        Alert.alert('Invalid Coupon', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to validate coupon. Please try again.');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // Calculate order totals
  const calculateOrderTotal = () => {
    const subtotal = cartStore.total;
    const tax = subtotal * 0.1;
    const deliveryFee = selectedDeliveryLocation?.price || 0;
    const discount = appliedCoupon?.discountAmount || 0;
    
    return {
      subtotal,
      tax,
      deliveryFee,
      discount,
      total: subtotal + tax + deliveryFee - discount,
    };
  };

  // Payment handling
  const handlePaymentSelection = (paymentType: string) => {
    setSelectedPaymentOption(paymentType);
    setShowPaymentModal(false);
    
    // Here you would integrate with Paystack
    // For now, we'll simulate the payment process
    handlePlaceOrder();
  };

  const handlePlaceOrder = async () => {
    if (authStore.requiresAuthentication()) {
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }

    if (cartStore.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty.');
      return;
    }

    // Validate billing address
    if (!billingAddress.fullName || !billingAddress.email || !billingAddress.phoneNumber || !billingAddress.deliveryAddress) {
      Alert.alert('Error', 'Please fill in all required billing address fields.');
      return;
    }

    // Validate delivery location
    if (!selectedDeliveryLocation) {
      Alert.alert('Error', 'Please select a delivery location.');
      return;
    }

    // Show payment modal instead of processing directly
    if (!selectedPaymentOption) {
      setShowPaymentModal(true);
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

      if (!authStore.user) {
        throw new Error('User not authenticated');
      }

      // Calculate final order totals
      const orderTotals = calculateOrderTotal();

      // Create order
      const orderData = {
        userId: authStore.user.id,
        items: cartStore.items.map((item: CartItem) => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.images[0] || '',
          quantity: item.quantity,
          price: item.product.salePrice || item.product.price,
          totalPrice: (item.product.salePrice || item.product.price) * item.quantity,
          options: item.selectedOptions,
        })),

        subtotal: orderTotals.subtotal,
        tax: orderTotals.tax,
        shippingCost: orderTotals.deliveryFee,
        discount: orderTotals.discount,
        total: orderTotals.total,
        paymentMethod: {
          type: selectedPaymentOption as 'wallet' | 'credit_card' | 'bank_transfer' | 'ussd',
          walletId: selectedPaymentOption === 'wallet' ? walletStore.wallet?.id : undefined,
        },
        shippingAddress: {
          name: billingAddress.fullName,
          line1: billingAddress.deliveryAddress,
          line2: '',
          city: billingAddress.city || selectedDeliveryLocation?.location || '',
          state: billingAddress.state || 'Lagos',
          postalCode: billingAddress.postalCode || '',
          country: billingAddress.country || 'Nigeria',
          phoneNumber: billingAddress.phoneNumber,
        },
        billingAddress: {
          name: billingAddress.fullName,
          line1: billingAddress.deliveryAddress,
          line2: '',
          city: billingAddress.city || selectedDeliveryLocation?.location || '',
          state: billingAddress.state || 'Lagos',
          postalCode: billingAddress.postalCode || '',
          country: billingAddress.country || 'Nigeria',
          phoneNumber: billingAddress.phoneNumber,
        },
        status: 'pending' as const,
      };

      const orderId = await orderStore.createOrder(orderData);

      // Process payment
      if (selectedPaymentMethod === 'wallet' && walletStore.wallet) {
        // Use the new wallet payment processing method
        await walletStore.processWalletPayment(
          walletStore.wallet.id,
          orderData.total,
          orderId,
          `Order payment for ${cartStore.itemCount} items`
        );
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

  // Render billing address form
  const renderBillingAddressForm = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Billing Address</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Full Name</Text>
        <TextInput
          style={styles.textInput}
          value={billingAddress.fullName}
          onChangeText={(text) => setBillingAddress(prev => ({ ...prev, fullName: text }))}
          placeholder="Enter your full name"
          placeholderTextColor={Colors.textSecondary}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          value={billingAddress.email}
          onChangeText={(text) => setBillingAddress(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email address"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Phone Number</Text>
        <TextInput
          style={styles.textInput}
          value={billingAddress.phoneNumber}
          onChangeText={(text) => setBillingAddress(prev => ({ ...prev, phoneNumber: text }))}
          placeholder="Enter your phone number"
          placeholderTextColor={Colors.textSecondary}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Delivery Address</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          value={billingAddress.deliveryAddress}
          onChangeText={(text) => setBillingAddress(prev => ({ ...prev, deliveryAddress: text }))}
          placeholder="Enter your delivery address"
          placeholderTextColor={Colors.textSecondary}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  // Render delivery location dropdown
  const renderDeliveryLocationDropdown = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Delivery Location</Text>
      
      {loadingDeliveryLocations ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading delivery locations...</Text>
        </View>
      ) : (
        <Dropdown
          style={[styles.dropdown, isFocus && { borderColor: Colors.primary }]}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={deliveryLocations.map(location => ({
             label: location.location,
             value: location.id,
             location: location
           }))}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={!isFocus ? 'Select delivery location' : '...'}
          searchPlaceholder="Search..."
          value={selectedDeliveryLocation?.id}
          onFocus={() => setIsFocus(true)}
          onBlur={() => setIsFocus(false)}
          onChange={item => {
            setSelectedDeliveryLocation(item.location);
            setIsFocus(false);
          }}
        />
      )}
    </View>
  );

  // Render coupon section
  const renderCouponSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Coupon Code</Text>
      
      {appliedCoupon ? (
        <View style={styles.appliedCouponContainer}>
          <View style={styles.appliedCouponLeft}>
            <Text style={styles.appliedCouponCode}>{appliedCoupon.coupon.code}</Text>
            <Text style={styles.appliedCouponDiscount}>
              -₦{appliedCoupon.discountAmount.toFixed(2)} discount applied
            </Text>
          </View>
          <TouchableOpacity onPress={handleRemoveCoupon} style={styles.removeCouponButton}>
            <Text style={styles.removeCouponText}>Remove</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.couponInputContainer}>
          <TextInput
            style={styles.couponInput}
            value={couponCode}
            onChangeText={setCouponCode}
            placeholder="Enter coupon code"
            placeholderTextColor={Colors.textSecondary}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyCouponButton, validatingCoupon && styles.disabledButton]}
            onPress={handleApplyCoupon}
            disabled={validatingCoupon}
          >
            {validatingCoupon ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.applyCouponText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  // Render payment modal
  const renderPaymentModal = () => (
    <Modal
      visible={showPaymentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPaymentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Payment Method</Text>
            <TouchableOpacity
              onPress={() => setShowPaymentModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.paymentOptions}>
            {[
              { id: 'credit_card', title: 'Card Payment', subtitle: 'Pay with your debit/credit card', icon: <CreditCard size={18} color={Colors.primary} /> },
              { id: 'bank_transfer', title: 'Bank Transfer', subtitle: 'Transfer directly from your bank', icon: <Landmark size={18} color={Colors.primary}/> },
              { id: 'ussd', title: 'USSD', subtitle: 'Pay using USSD code', icon: <Smartphone size={18} color={Colors.primary} /> },
              { id: 'wallet', title: 'Wallet', subtitle: `Balance: ₦${walletStore.wallet?.balance?.toFixed(2) || '0.00'}`, icon: <Wallet size={18} color={Colors.primary} /> },
            ].map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.paymentOption}
                onPress={() => handlePaymentSelection(option.id)}
              >
                <View style={styles.paymentOptionIcon}>{option.icon}</View>
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.paymentOptionTitle}>{option.title}</Text>
                  <Text style={styles.paymentOptionSubtitle}>{option.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

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
                Balance: ₦{walletStore.wallet.balance.toFixed(2)}
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
    const orderTotals = calculateOrderTotal();

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal ({cartStore.itemCount} items)</Text>
          <Text style={styles.summaryValue}>₦{orderTotals.subtotal.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (10%)</Text>
          <Text style={styles.summaryValue}>₦{orderTotals.tax.toFixed(2)}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Delivery Fee {selectedDeliveryLocation ? `(${selectedDeliveryLocation.location})` : ''}
          </Text>
          <Text style={styles.summaryValue}>
            {orderTotals.deliveryFee === 0 ? 'FREE' : `₦${orderTotals.deliveryFee.toFixed(2)}`}
          </Text>
        </View>

        {appliedCoupon && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors.success }]}>
              Discount ({appliedCoupon.coupon.code})
            </Text>
            <Text style={[styles.summaryValue, { color: Colors.success }]}>
              -₦{orderTotals.discount.toFixed(2)}
            </Text>
          </View>
        )}
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₦{orderTotals.total.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  // Redirect if not authenticated
  if (authStore.requiresAuthentication()) {
    return null;
  }

  return (
    <View style={[styles.container]}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
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
          {renderBillingAddressForm()}
          {renderDeliveryLocationDropdown()}
          {renderCouponSection()}
          {renderOrderSummary()}
        </ScrollView>

        {renderPaymentModal()}

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
      </SafeAreaProvider>
    </View>
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
    fontWeight: '600',
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
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
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
    fontWeight: '400',
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
    paddingVertical: Spacing.lg
  },
  placeOrderButton: {
    marginBottom: 0,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Billing Address Form Styles
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
    backgroundColor: Colors.white,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  // Delivery Location Styles
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  loadingText: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  deliveryLocationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  selectedDeliveryLocation: {
    borderColor: Colors.primary,
    backgroundColor: Colors.gray.light,
  },
  deliveryLocationLeft: {
    flex: 1,
  },
  deliveryLocationName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  deliveryLocationTime: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deliveryLocationPrice: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginRight: Spacing.sm,
  },
  // Coupon Styles
  appliedCouponContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray.light,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: 8,
    padding: Spacing.md,
  },
  appliedCouponLeft: {
    flex: 1,
  },
  appliedCouponCode: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.success,
  },
  appliedCouponDiscount: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.success,
    marginTop: 2,
  },
  removeCouponButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  removeCouponText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.error,
  },
  couponInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
    backgroundColor: Colors.white,
    marginRight: Spacing.sm,
  },
  applyCouponButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyCouponText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.white,
  },
  // Payment Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalCloseText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  paymentOptions: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
  },
  paymentOptionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  paymentOptionSubtitle: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // Dropdown Styles
  dropdown: {
    height: 50,
    borderColor: Colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.white,
    marginTop: Spacing.sm,
  },
  placeholderStyle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  selectedTextStyle: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
  },
});

export default CheckoutScreen;