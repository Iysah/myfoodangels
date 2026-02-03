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
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react-native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import AuthPrompt from '../../components/AuthPrompt';
import Constants from 'expo-constants';
import ToastService from '../../utils/Toast';
import { useNavigation } from '@react-navigation/native';

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

  const renderCartItem = ({ item }: { item: any }) => {
    const displayPrice = item.product.salePrice || item.product.price;
    const itemTotal = displayPrice * item.quantity;

    return (
      <View style={styles.cartItem}>
        <View style={styles.itemMainRow}>
          <Image 
            source={{ uri: item?.product?.image || item?.product?.images?.[0] || 'https://via.placeholder.com/150' }} 
            style={styles.productImage} 
          />
          
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.product.name}</Text>
            {item.product.category?.name && (
              <Text style={styles.productCategory}>{item.product.category.name}</Text>
            )}
            
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>₦{displayPrice.toLocaleString()}</Text>
              {item.product.salePrice && item.product.salePrice < item.product.price && (
                <Text style={styles.originalPrice}>₦{item.product.price.toLocaleString()}</Text>
              )}
            </View>

            {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
              <View style={styles.optionsContainer}>
                {Object.entries(item.selectedOptions).map(([key, value]) => (
                  <View key={key} style={styles.optionBadge}>
                    <Text style={styles.optionText}>
                      {key}: {String(value)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        
        <View style={styles.itemActionRow}>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={[styles.quantityBtn, item.quantity <= 1 && styles.quantityBtnDisabled]}
              onPress={() => item.quantity > 1 ? handleUpdateQuantity(item.product.id, item.quantity - 1, item.selectedOptions) : handleRemoveItem(item.product.id, item.selectedOptions)}
              activeOpacity={0.7}
            >
              {item.quantity <= 1 ? <Trash2 size={14} color={Colors.error} /> : <Minus size={14} color={Colors.label} />}
            </TouchableOpacity>
            
            <Text style={styles.quantityText}>{item.quantity}</Text>
            
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => handleUpdateQuantity(item.product.id, item.quantity + 1, item.selectedOptions)}
              activeOpacity={0.7}
            >
              <Plus size={14} color={Colors.label} />
            </TouchableOpacity>
          </View>

          <View style={styles.itemTotalContainer}>
            <Text style={styles.itemTotalLabel}>Total</Text>
            <Text style={styles.itemTotalAmount}>₦{itemTotal.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <ShoppingCart size={48} color={Colors.primary} />
      </View>
      <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
      <Text style={styles.emptyMessage}>
        Looks like you haven't added anything to your cart yet.
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={handleContinueShopping}
        activeOpacity={0.8}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
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
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shopping Cart</Text>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => {
              Alert.alert('Clear Cart', 'Remove all items from your cart?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: () => {
                  cartStore.clearCart();
                  ToastService.info('Cart cleared');
                }}
              ]);
            }}
            disabled={cartStore.items.length === 0}
          >
            <Trash2 size={20} color={cartStore.items.length > 0 ? Colors.error : '#D1D1D6'} />
          </TouchableOpacity>
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
            
            <View style={styles.summaryFooter}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>₦{cartStore.total.toLocaleString()}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery Fee</Text>
                  <Text style={[styles.summaryValue, { color: Colors.primary }]}>Calculated at checkout</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalValue}>₦{cartStore.total.toLocaleString()}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.checkoutBtn, authStore.requiresAuthentication() && styles.authBtn]}
                onPress={handleCheckout}
                activeOpacity={0.8}
              >
                <Text style={styles.checkoutBtnText}>
                  {authStore.requiresAuthentication() ? 'Sign In to Checkout' : 'Proceed to Checkout'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.shopMoreBtn}
                onPress={handleContinueShopping}
              >
                <Text style={styles.shopMoreText}>Add more items</Text>
              </TouchableOpacity>
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  itemMainRow: {
    flexDirection: 'row',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 20,
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  optionBadge: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  optionText: {
    fontSize: 10,
    color: '#555',
  },
  itemActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  quantityBtnDisabled: {
    backgroundColor: '#FFF5F5',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotalContainer: {
    alignItems: 'flex-end',
  },
  itemTotalLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  itemTotalAmount: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryFooter: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#8E8E93',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  authBtn: {
    backgroundColor: '#333',
    shadowColor: '#000',
  },
  checkoutBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shopMoreBtn: {
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 4,
  },
  shopMoreText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default CartScreen;