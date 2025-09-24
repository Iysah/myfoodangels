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
import { WebView } from 'react-native-webview';
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
import PaystackService from '../../services/paystack/PaystackService';
import { setDocument, addDocument, createTimestamp, getDocument, updateDocument } from '../../services/firebase/firestore';
import { LoystarAPI } from '../../services/loystar/api';

const CheckoutScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, cartStore, orderStore, walletStore } = useStores();
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Billing Address State
  const [billingAddress, setBillingAddress] = useState<CheckoutBillingAddress>({
    fullName: authStore.user?.displayName || 
              (authStore.user?.firstName && authStore.user?.lastName 
                ? `${authStore.user.firstName} ${authStore.user.lastName}` 
                : ''),
    email: authStore.user?.email || '',
    phoneNumber: authStore.user?.phone || authStore.user?.phoneNumber || '',
    deliveryAddress: authStore.user?.addressDetails?.address || '',
    city: authStore.user?.addressDetails?.city || '',
    state: authStore.user?.addressDetails?.state || '',
    postalCode: authStore.user?.addressDetails?.zipcode || '',
    country: authStore.user?.addressDetails?.country || '',
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
  
  // Paystack WebView State
  const [showPaymentWebView, setShowPaymentWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [currentOrderData, setCurrentOrderData] = useState<any>(null);
  const [currentOrderId, setCurrentOrderId] = useState('');
  const [currentPaymentReference, setCurrentPaymentReference] = useState('');
  
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
      
      // Update billing address with comprehensive user data
      setBillingAddress(prev => ({
        ...prev,
        fullName: authStore.user?.displayName || 
                  (authStore.user?.firstName && authStore.user?.lastName 
                    ? `${authStore.user.firstName} ${authStore.user.lastName}` 
                    : prev.fullName),
        email: authStore.user?.email || prev.email,
        phoneNumber: authStore.user?.phone || authStore.user?.phoneNumber || prev.phoneNumber,
        deliveryAddress: authStore.user?.addressDetails?.address || prev.deliveryAddress,
        city: authStore.user?.addressDetails?.city || prev.city,
        state: authStore.user?.addressDetails?.state || prev.state,
        postalCode: authStore.user?.addressDetails?.zipcode || prev.postalCode,
        country: authStore.user?.addressDetails?.country || prev.country,
      }));
    }
    const publicKey = process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_TEST_KEY;
    console.log('Paystack public key:', publicKey);
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
  const handlePaymentSelection = async (paymentType: string) => {
    setSelectedPaymentOption(paymentType);
    setShowPaymentModal(false);
    
    // Process payment based on selected type
    await processPayment(paymentType);
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

    // Show payment modal to select payment method
    setShowPaymentModal(true);
  };

  const processPayment = async (paymentType: string) => {
    setIsProcessing(true);

    // Validate required data before creating order
    const validateOrderData = () => {
      const errors = [];
      
      if (!authStore.user?.id) {
        errors.push('User ID is required');
      }
      
      if (!cartStore.items || cartStore.items.length === 0) {
        errors.push('Cart items are required');
      }
      
      if (!billingAddress.fullName) {
        errors.push('Full name is required');
      }
      
      if (!billingAddress.deliveryAddress) {
        errors.push('Delivery address is required');
      }
      
      if (!billingAddress.phoneNumber) {
        errors.push('Phone number is required');
      }
      
      return errors;
    };

    try {
      if (!authStore.user) {
        throw new Error('User not authenticated');
      }

      // Validate data first
      const validationErrors = validateOrderData();
      if (validationErrors.length > 0) {
        throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
      }


      // Calculate final order totals
      const orderTotals = calculateOrderTotal();

      // Validate wallet payment
      if (paymentType === 'wallet') {
        if (!walletStore.wallet || walletStore.wallet.balance < orderTotals.total) {
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

      // Create order data
      const orderData = {
        userId: authStore.user?.id || '',
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
          type: paymentType as 'wallet' | 'credit_card' | 'bank_transfer' | 'ussd',
          walletId: paymentType === 'wallet' ? walletStore.wallet?.id : undefined,
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

      // Create order first
      const orderId = await orderStore.createOrder(orderData);
      
      // Ensure orderId is valid
      if (!orderId) {
        throw new Error('Failed to create order');
      }

      // Process payment based on type
      let paymentSuccess = false;
      let paymentReference = '';

      if (paymentType === 'wallet' && walletStore.wallet) {
        // Process wallet payment
        await walletStore.processWalletPayment(
          walletStore.wallet.id,
          orderData.total,
          orderId!,
          `Order payment for ${cartStore.itemCount} items`
        );
        paymentSuccess = true;
        paymentReference = `wallet_${orderId}`;
      } else {
        // Process Paystack payment (card, bank transfer, USSD)
        const paymentResult = await processPaystackPayment(paymentType, orderData, orderId);
        
        if (paymentResult.pending) {
          // Payment is pending (WebView opened) - don't continue processing here
          // The completion will be handled in the WebView callback
          setIsProcessing(false);
          return;
        }
        
        paymentSuccess = paymentResult.success;
        paymentReference = paymentResult.reference;
        
        if (!paymentSuccess) {
          throw new Error(paymentResult.error || 'Payment failed');
        }
      }

      if (paymentSuccess) {
        // Save order to Firebase
        await saveOrderToFirebase(orderData, orderId, paymentReference);
        
        // Send to Loystar for loyalty points
        await sendOrderToLoystar(orderData, orderId);

        // Clear cart
        cartStore.clearCart();

        // Navigate to order confirmation
        navigation.navigate('OrderConfirmation', { orderId });
      } else {
        throw new Error('Payment failed');
      }

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to process Paystack payments
  const processPaystackPayment = async (paymentType: string, orderData: any, orderId: string) => {
    try {
      const paystackService = PaystackService.getInstance();
      const reference = paystackService.generateReference();
      
      const paymentData = paystackService.preparePaymentData(
        authStore.user?.email || billingAddress.email,
        orderData.total,
        'NGN',
        reference,
        {
          orderId,
          paymentType,
          customerName: billingAddress.fullName,
          phoneNumber: billingAddress.phoneNumber,
        }
      );

      // Set payment channels based on payment type
      if (paymentType === 'credit_card') {
        paymentData.channels = ['card'];
      } else if (paymentType === 'bank_transfer') {
        paymentData.channels = ['bank_transfer'];
      } else if (paymentType === 'ussd') {
        paymentData.channels = ['ussd'];
      }

      // Initialize Paystack transaction
      const initResponse = await paystackService.initializeTransaction(paymentData);
      
      if (!initResponse.status) {
        throw new Error(initResponse.message || 'Failed to initialize payment');
      }

      // Store order data for completion after payment
      setCurrentOrderData(orderData);
      setCurrentOrderId(orderId);
      setCurrentPaymentReference(reference);
      
      // Open WebView with Paystack payment URL
      setPaymentUrl(initResponse.data.authorization_url);
      setShowPaymentWebView(true);

      // Return pending status - actual completion happens in WebView callback
      return {
        success: false, // Will be updated after WebView completion
        reference: reference,
        transactionId: initResponse.data.reference,
        pending: true,
      };
    } catch (error: any) {
      console.error('Paystack payment error:', error);
      return {
        success: false,
        reference: '',
        error: error.message,
      };
    }
  };

  // Handle WebView navigation for payment completion
  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    
    // Check if payment was successful (Paystack redirects to success URL)
    if (url.includes('success') || url.includes('callback')) {
      try {
        // Verify payment with Paystack
        const paystackService = PaystackService.getInstance();
        const verificationResponse = await paystackService.verifyTransaction(currentPaymentReference);
        
        if (verificationResponse.status && verificationResponse.data.status === 'success') {
          // Payment successful - create the order
          await createOrder(currentPaymentReference);
        } else {
          // Payment failed
          handlePaymentFailure('Payment verification failed');
        }
      } catch (error: any) {
        console.error('Payment verification error:', error);
        handlePaymentFailure(error.message);
      }
    } else if (url.includes('cancel') || url.includes('failed')) {
      // Payment was cancelled or failed
      handlePaymentFailure('Payment was cancelled or failed');
    }
  };

  // Create order after successful payment
  const createOrder = async (reference: string) => {
    try {
      setShowPaymentWebView(false);
      setIsProcessing(true);

      // Create order data matching web app format
      const singleOrder = {
        name: `${authStore.user?.displayName || authStore.user?.email?.split('@')[0] || 'User'}`,
        firstName: authStore.user?.displayName?.split(' ')[0] || authStore.user?.email?.split('@')[0] || 'User',
        lastName: authStore.user?.displayName?.split(' ')[1] || '',
        email: authStore.user?.email || '',
        totalAmount: currentOrderData.total,
        address: `${billingAddress.deliveryAddress || ''}, ${billingAddress.state || ''}, ${billingAddress.country || ''}`,
        phone: authStore.user?.phoneNumber || billingAddress.phoneNumber || '',
        paymentReference: reference,
        cartItems: cartStore.items,
        orderId: reference,
        status: "success",
        userId: authStore.user?.id || authStore.user?.email || '',
        created_date: createTimestamp(),
      };

      // Save order to Firebase using addDocument
      await addDocument('orders', singleOrder);
    
      
      // Send order to Loystar
      await sendOrderToLoystar(currentOrderData, currentOrderId);
      
      // Clear cart and navigate to confirmation
      cartStore.clearCart();
      setIsProcessing(false);
      
      Alert.alert(
        'Payment Successful!',
        'Your order has been placed successfully.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('OrderConfirmation', { orderId: reference }),
          },
        ]
      );
    } catch (error: any) {
      console.error('Order creation error:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Payment was successful but there was an issue creating your order. Please contact support.');
    }
  };

  // Handle payment failure
  const handlePaymentFailure = (errorMessage: string) => {
    setShowPaymentWebView(false);
    setIsProcessing(false);
    Alert.alert(
      'Payment Failed',
      errorMessage || 'Your payment could not be processed. Please try again.',
      [
        {
          text: 'OK',
          onPress: () => setShowPaymentModal(true), // Show payment modal again
        },
      ]
    );
  };

  // Helper function to save order to Firebase
  const saveOrderToFirebase = async (orderData: any, orderId: string, paymentReference: string) => {
    try {
      // Transform to match Firebase structure
      const firebaseOrder = {
        orderId: orderId || '',
        paymentReference: paymentReference || '',
        status: 'success',
        userId: authStore.user?.id || '',
        email: authStore.user?.email || billingAddress.email || '',
        name: billingAddress.fullName || '',
        firstName: billingAddress.fullName?.split(' ')[0] || '',
        lastName: billingAddress.fullName?.split(' ').slice(1).join(' ') || '',
        phone: billingAddress.phoneNumber || '',
        address: billingAddress.deliveryAddress || '',
        totalAmount: orderData.total || 0,
        cartItems: orderData.items?.map((item: any) => {
          // Create a clean item object without undefined values
          const cleanItem: any = {
            id: item.productId || '',
            name: item.productName || '',
            image: item.productImage || '',
            quantity: item.quantity || 0,
            price: item.price || 0,
            totalPrice: item.totalPrice || 0,
          };

          // Only add optional fields if they have valid values
          if (item.loystarId !== undefined && item.loystarId !== null) {
            cleanItem.loystarId = item.loystarId;
          }
          if (item.category && typeof item.category === 'object' && Object.keys(item.category).length > 0) {
            cleanItem.category = item.category;
          }
          if (item.chosenUnit) {
            cleanItem.chosenUnit = item.chosenUnit;
          }
          if (item.costprice !== undefined && item.costprice !== null) {
            cleanItem.costprice = item.costprice;
          }
          if (item.createdDate) {
            cleanItem.createdDate = item.createdDate;
          } else {
            cleanItem.createdDate = new Date().toISOString();
          }
          if (item.created_date) {
            cleanItem.created_date = item.created_date;
          } else {
            cleanItem.created_date = new Date().toISOString();
          }
          if (item.desc) {
            cleanItem.desc = item.desc;
          }
          if (item.inStock !== undefined) {
            cleanItem.inStock = item.inStock;
          } else {
            cleanItem.inStock = true;
          }
          if (item.loystarUnit) {
            cleanItem.loystarUnit = item.loystarUnit;
          }
          if (item.loystarUnitId !== undefined && item.loystarUnitId !== null) {
            cleanItem.loystarUnitId = item.loystarUnitId;
          }
          if (item.loystarUnitQty !== undefined && item.loystarUnitQty !== null) {
            cleanItem.loystarUnitQty = item.loystarUnitQty;
          }
          if (item.merchant_id !== undefined && item.merchant_id !== null) {
            cleanItem.merchant_id = item.merchant_id;
          }
          if (item.nameYourPrice !== undefined) {
            cleanItem.nameYourPrice = item.nameYourPrice;
          }
          if (item.no_of_items !== undefined && item.no_of_items !== null) {
            cleanItem.no_of_items = item.no_of_items;
          }
          if (item.rating !== undefined && item.rating !== null) {
            cleanItem.rating = item.rating;
          }
          if (item.ratingCount !== undefined && item.ratingCount !== null) {
            cleanItem.ratingCount = item.ratingCount;
          }
          if (item.slug) {
            cleanItem.slug = item.slug;
          }
          if (item.units && Array.isArray(item.units)) {
            cleanItem.units = item.units;
          }
          if (item.options) {
            cleanItem.options = item.options;
          }

          return cleanItem;
        }) || [],
        created_date: new Date(),
      };

      await setDocument('orders', orderId, firebaseOrder);
      console.log('Order saved to Firebase successfully');
    } catch (error: any) {
      console.error('Failed to save order to Firebase:', error);
      throw new Error('Failed to save order details');
    }
  };

  // Helper function to send order to Loystar
  const sendOrderToLoystar = async (orderData: any, orderId: string) => {
    try {
      // Transform order data to Loystar API v2 format
      const loystarData = {
        product_id: orderData.items.map((item: any) => parseInt(item.productId || item.product?.id)),
        quantity: orderData.items.map((item: any) => item.quantity),
        user_id: authStore.loystarData?.customer?.id || authStore.loystarData?.user?.id || 0,
        amount: orderData.total,
        merchant_id: parseInt(process.env.EXPO_PUBLIC_MERCHANT_ID || '543'),
        payment_method: orderData.paymentMethod.type === 'wallet' ? 'cash' : 
                       orderData.paymentMethod.type === 'credit_card' ? 'card' : 
                       orderData.paymentMethod.type === 'bank_transfer' ? 'transfer' : 'card',
        order_reference: orderId,
        customer_email: authStore.user?.email || '',
        customer_phone: authStore.user?.phoneNumber || '',
        delivery_address: `${billingAddress.deliveryAddress || ''}, ${billingAddress.state || ''}, ${billingAddress.country || ''}`,
        items: orderData.items.map((item: any) => ({
          product_id: parseInt(item.productId || item.product?.id),
          product_name: item.productName || item.product?.name,
          quantity: item.quantity,
          unit_price: item.price,
          total_price: item.totalPrice,
          points_earned: Math.floor(item.totalPrice), // 1:1 points ratio
        })),
      };

      console.log('Sending order to Loystar API v2:', loystarData);

      // Send to Loystar API v2 endpoint
      const response = await fetch('https://api.loystar.co/api/v2/sales', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.loystarToken || LoystarAPI.getAuthToken()}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(loystarData),
      });

      const responseText = await response.text();
      console.log('Loystar API response status:', response.status);
      console.log('Loystar API response:', responseText);

      if (!response.ok) {
        throw new Error(`Loystar API error: ${response.status} - ${responseText}`);
      }

      const result = JSON.parse(responseText);
      console.log('Order sent to Loystar successfully:', result);
      
      return result;
    } catch (error: any) {
      console.error('Failed to send order to Loystar:', error);
      // Don't throw error here as it shouldn't block the order completion
      // But log detailed error for debugging
      console.error('Loystar error details:', {
        message: error.message,
        orderData: orderData,
        orderId: orderId,
        loystarToken: authStore.loystarToken ? 'present' : 'missing',
      });
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

        {/* Paystack Payment WebView Modal */}
        <Modal
          visible={showPaymentWebView}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.webViewContainer}>
            <View style={styles.webViewHeader}>
              <TouchableOpacity
                style={styles.webViewCloseButton}
                onPress={() => handlePaymentFailure('Payment cancelled by user')}
              >
                <Text style={styles.webViewCloseText}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.webViewTitle}>Complete Payment</Text>
              <View style={styles.webViewPlaceholder} />
            </View>
            
            {paymentUrl ? (
              <WebView
                source={{ uri: paymentUrl }}
                style={styles.webView}
                onNavigationStateChange={handleWebViewNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                  <View style={styles.webViewLoading}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                    <Text style={styles.webViewLoadingText}>Loading payment...</Text>
                  </View>
                )}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.error('WebView error: ', nativeEvent);
                  handlePaymentFailure('Failed to load payment page');
                }}
              />
            ) : (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.webViewLoadingText}>Preparing payment...</Text>
              </View>
            )}
          </SafeAreaView>
        </Modal>

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
  // WebView Modal Styles
  webViewContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  webViewCloseButton: {
    padding: Spacing.xs,
  },
  webViewCloseText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  webViewTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.semiBold,
    color: Colors.label,
  },
  webViewPlaceholder: {
    width: 60, // Same width as close button for centering
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  webViewLoadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
});

export default CheckoutScreen;