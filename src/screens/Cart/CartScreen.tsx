import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import AuthPrompt from '../../components/AuthPrompt';
import Constants from 'expo-constants';

const CartScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, cartStore } = useStores();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleCheckout = () => {
    // Check if user is authenticated for checkout
    if (authStore.requiresAuthentication()) {
      setShowAuthPrompt(true);
      return;
    } else {
      setShowAuthPrompt(false)
    }

    // Proceed to checkout for authenticated users
    navigation.navigate('Checkout');
  };

  const handleContinueShopping = () => {
    navigation.navigate('Main', { screen: 'Home' });
  };

  const handleRemoveItem = (productId: string, selectedOptions?: Record<string, string>) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => cartStore.removeItem(productId, selectedOptions)
        },
      ]
    );
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number, selectedOptions?: Record<string, string>) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId, selectedOptions);
    } else {
      cartStore.updateItemQuantity(productId, newQuantity, selectedOptions);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item?.product?.imageUrl }} style={styles.productImage} />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.product.name}</Text>
        <Text style={styles.productPrice}>
          ₦{(item.product.salePrice || item.product.price).toFixed(2)}
        </Text>
        
        {item.selectedOptions && (
          <View style={styles.optionsContainer}>
            {Object.entries(item.selectedOptions).map(([key, value]) => (
              <Text key={key} style={styles.optionText}>
                {key}: {String(value)}
              </Text>
            ))}
          </View>
        )}
      </View>
      
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.product.id, item.quantity - 1, item.selectedOptions)}
        >
          <Text style={styles.quantityButtonText}>-</Text>
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{item.quantity}</Text>
        
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.selectedOptions)}
        >
          <Text style={styles.quantityButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(item.product.id, item.selectedOptions)}
      >
        <Text style={styles.removeButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🛒</Text>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyMessage}>
        Add some delicious items to your cart and they'll appear here.
      </Text>
      <TouchableOpacity
        style={[GlobalStyles.primaryButton, styles.shopButton]}
        onPress={handleContinueShopping}
      >
        <Text style={GlobalStyles.primaryButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

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
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <View style={styles.headerRight} />
        </View>

        {cartStore.items.length === 0 ? (
          renderEmptyCart()
        ) : (
          <>
            <FlatList
              data={cartStore.items}
              renderItem={renderCartItem}
              keyExtractor={(item, index) => `${item.product.id}-${index}`}
              style={styles.cartList}
              showsVerticalScrollIndicator={false}
            />
            
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal ({cartStore.itemCount} items)</Text>
                  <Text style={styles.totalAmount}>₦{cartStore.total.toFixed(2)}</Text>
                </View>
                
                <TouchableOpacity
                  style={[GlobalStyles.primaryButton, styles.checkoutButton]}
                  onPress={handleCheckout}
                >
                  <Text style={GlobalStyles.primaryButtonText}>
                    {authStore.requiresAuthentication() ? 'Sign In to Checkout' : 'Proceed to Checkout'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.continueShoppingButton}
                  onPress={handleContinueShopping}
                >
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        <AuthPrompt
          visible={showAuthPrompt}
          onClose={() => setShowAuthPrompt(false)}
          feature="checkout"
          message="Sign in to proceed with your purchase and track your order."
        />
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
    width: 40, // Balance the header
  },
  cartList: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: Spacing.md,
    marginVertical: Spacing.xs,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F4F4F4',
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: 4,
  },
  optionsContainer: {
    marginTop: 4,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.white,
  },
  quantityText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginHorizontal: Spacing.md,
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: Spacing.xs,
  },
  removeButtonText: {
    fontSize: 20,
    color: Colors.error,
  },
  footer: {
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  totalContainer: {
    padding: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  totalAmount: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  checkoutButton: {
    marginBottom: Spacing.sm,
  },
  continueShoppingButton: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  continueShoppingText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emptyMessage: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  shopButton: {
    paddingHorizontal: Spacing.xl,
    width: '80%',
  },
});

export default CartScreen;