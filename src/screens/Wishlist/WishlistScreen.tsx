import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import { RootStackParamList } from '../../navigation/types';
import { useStores } from '../../contexts/StoreContext';
import { ArrowLeft, Bell, Heart, ShoppingCart, Trash2, Star, Tag } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../styles/globalStyles';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { Product } from '../../types/Product';
import ToastService from '../../utils/Toast';
import AuthPrompt from '../../components/AuthPrompt';

type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface WishlistScreenProps {}

const WishlistScreen: React.FC<WishlistScreenProps> = observer(() => {
  const navigation = useNavigation<WishlistScreenNavigationProp>();
  const { wishlistStore, cartStore, authStore } = useStores();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    // Check if user is authenticated when screen loads
    if (authStore.requiresAuthentication()) {
      setShowAuthPrompt(true);
    }
  }, [authStore]);

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    wishlistStore.removeFromWishlist(productId);
    ToastService.success(`${productName} removed from wishlist`);
  };

  const handleCartPress = () => {
    // Check if user is authenticated for cart access
    if (authStore.requiresAuthentication()) {
      // Show authentication prompt
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    navigation.navigate('Cart');
  };

  const handleAddToCart = (product: Product) => {
    try {
      cartStore.addItem(product, 1);
      ToastService.success(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      ToastService.error('Failed to add item to cart');
    }
  };

  const renderWishlistItem = ({ item }: { item: Product }) => {
    const displayPrice = item.salePrice || item.price;
    const hasDiscount = item.salePrice && item.salePrice < item.price;
    const isOutOfStock = !item.inStock || (item.quantity !== undefined && item.quantity <= 0);

    return (
      <TouchableOpacity 
        style={styles.productCard}
        onPress={() => navigation.navigate('ProductDetails', { product: item })}
        activeOpacity={0.7}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image || item.images?.[0] || 'https://via.placeholder.com/150' }} 
            style={styles.productImage}
          />
          {hasDiscount && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>SALE</Text>
            </View>
          )}
          {isOutOfStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>SOLD OUT</Text>
            </View>
          )}
        </View>

        <View style={styles.productInfo}>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <TouchableOpacity 
                style={styles.removeIcon}
                onPress={() => handleRemoveFromWishlist(item.id, item.name)}
              >
                <Trash2 size={18} color={Colors.error} />
              </TouchableOpacity>
            </View>
            
            {(item.desc || item.description) ? (
              <Text style={styles.productDescription} numberOfLines={1}>
                {item.desc || item.description}
              </Text>
            ) : null}
            
            <View style={styles.metaRow}>
              {item.category?.name ? (
                <View style={styles.categoryBadge}>
                  <Tag size={10} color={Colors.textSecondary} />
                  <Text style={styles.categoryText}>{item.category.name}</Text>
                </View>
              ) : null}
              
              <View style={styles.ratingBadge}>
                <Star size={10} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>{item.rating?.toFixed(1) || '0.0'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.priceActionRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₦{displayPrice.toLocaleString()}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₦{item.price.toLocaleString()}</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.addToCartButton, isOutOfStock && styles.disabledCartButton]}
              onPress={() => !isOutOfStock && handleAddToCart(item)}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={16} color="#fff" />
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyWishlist = () => {
    if (authStore.requiresAuthentication()) {
      return (
        <View style={styles.emptyContainer}>
          <Heart size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>
            Please sign in to view and manage your wishlist items.
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => setShowAuthPrompt(true)}
          >
            <Text style={styles.shopButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Heart size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
        <Text style={styles.emptyText}>
          Start adding products to your wishlist by tapping the heart icon on any product.
        </Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('Main', { screen: 'Home' })}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaProvider>
      <AuthPrompt
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        returnTo={{ screen: 'Wishlist' }}
        feature="your wishlist"
      />
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Constants.statusBarHeight }]}>
          <Text style={styles.headerTitle}>My Wishlist</Text>

          <View style={styles.rowContainer}>
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
              <View style={styles.cartIconContainer}>
                <ShoppingCart size={22} color={'#000'}/>
                {cartStore.itemCount > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cartStore.itemCount > 99 ? '99+' : cartStore.itemCount}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cartButton}>
              <Bell size={22} color={'#000'}/>
            </TouchableOpacity>
          </View>
        </View>

        {wishlistStore.wishlistItems.length === 0 ? (
          renderEmptyWishlist()
        ) : (
          <FlatList
            data={wishlistStore.wishlistItems}
            renderItem={renderWishlistItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.productsList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
    flex: 1,
  },
   rowContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  cartButton: {
    padding: Spacing.sm,
  },
  cartIcon: {
    color: '#000'
  },
  cartIconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  productsList: {
    padding: 16,
    paddingBottom: 40,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    minHeight: 120,
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  saleBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  saleText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: Typography.fontFamily.bold,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    paddingLeft: 12,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    flex: 1,
    marginRight: 8,
  },
  productDescription: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
    opacity: 0.8,
  },
  removeIcon: {
    padding: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.textSecondary,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
  },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceContainer: {
    justifyContent: 'flex-end',
  },
  productPrice: {
    fontSize: 16,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
    marginTop: -2,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  disabledCartButton: {
    backgroundColor: Colors.border,
    opacity: 0.6,
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: Typography.fontFamily.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
  },
});

export default WishlistScreen;