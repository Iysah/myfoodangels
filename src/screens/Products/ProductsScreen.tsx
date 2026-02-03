import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  // SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { observer } from 'mobx-react-lite';
import { Product } from '../../types/Product';
// Removed LoystarProduct usage; Wishlist uses Firebase Product directly
import { RootStackParamList } from '../../navigation/types';
import { useStores } from '../../contexts/StoreContext';
import { ArrowLeft, Bell, Heart, ShoppingCart } from 'lucide-react-native';
import { Colors, Spacing } from '../../styles/globalStyles';
import ToastService from '../../utils/Toast';
import AuthPrompt from '../../components/AuthPrompt';
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants';

type ProductsScreenRouteProp = RouteProp<RootStackParamList, 'Products'>;
type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;

interface ProductsScreenProps {}

const ProductsScreen: React.FC<ProductsScreenProps> = observer(() => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const route = useRoute<ProductsScreenRouteProp>();
  const { productStore, cartStore, authStore, wishlistStore } = useStores();
  
  const { category } = route.params;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      let fetched: Product[] = [];
      if (category.loystarId && category.loystarId > 0) {
        fetched = await productStore.fetchProductsByLoystarCategory(category.loystarId);
        console.log('Fetched products by loystar category:', fetched);
        console.log('loystar category:', category.loystarId);
      }
      setProducts(fetched);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      ToastService.error('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {};

  const handleCartPress = () => {
    // Check if user is authenticated for cart access
    if (authStore.requiresAuthentication()) {
      // Show authentication prompt
      navigation.navigate('Auth', { screen: 'Login' });
      return;
    }
    navigation.navigate('Cart');
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const addToCart = (product: Product) => {
    const quantity = product.quantity ?? product.stock ?? 0;
    if (quantity <= 0) {
      ToastService.error('This item is currently out of stock');
      return;
    }
    cartStore.addItem(product, 1);
    ToastService.success(`${product.name} added to cart!`);
  };

  const handleWishlistToggle = (item: Product) => {
    // Check if user is authenticated for wishlist access
    if (authStore.requiresAuthentication()) {
      // Show authentication prompt with return navigation
      setShowAuthPrompt(true);
      return;
    }

    const isInWishlist = wishlistStore.isInWishlist(item.id);
    if (isInWishlist) {
      wishlistStore.removeFromWishlist(item.id);
      ToastService.success(`${item.name} removed from wishlist`);
    } else {
      wishlistStore.addToWishlist(item);
      ToastService.success(`${item.name} added to wishlist!`);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const isOutOfStock = !item.inStock || (item.quantity !== undefined && item.quantity <= 0);
    const displayPrice = item.salePrice || item.price;
    const hasDiscount = item.salePrice && item.salePrice < item.price;
    const isInWishlist = wishlistStore.isInWishlist(item.id);

    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image || item.images?.[0] || 'https://via.placeholder.com/150' }} 
            style={styles.productImage}
          />
          
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={() => handleWishlistToggle(item)}
            activeOpacity={0.7}
          >
            <Heart 
              size={18} 
              color={isInWishlist ? Colors.primary : '#8E8E93'}
              fill={isInWishlist ? Colors.primary : 'transparent'}
            />
          </TouchableOpacity>

          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>Sale</Text>
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
            <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
            {(item.desc || item.description) && (
              <Text style={styles.productDescription} numberOfLines={1}>
                {item.desc || item.description}
              </Text>
            )}
          </View>
          
          <View style={styles.priceActionRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>₦{displayPrice.toLocaleString()}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₦{item.price.toLocaleString()}</Text>
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.addIconCircle, isOutOfStock && styles.disabledAddButton]}
              onPress={() => !isOutOfStock && addToCart(item)}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color="#4CAF50" />
        <Text style={styles.loadingMoreText}>Loading more products...</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, {justifyContent:"center", alignItems:"center"}]}>
        <View style={{ backgroundColor: '#fff', width:"100%", height:"100%" }}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <ArrowLeft size={24} color={Colors.label} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{category.name}</Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{category.name}</Text>
          <View style={styles.rowContainer}>
            <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
              <View style={styles.cartIconContainer}>
                <ShoppingCart size={18} color={'#000'}/>
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
              <Bell size={18} color={'#000'}/>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => loadProducts()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ backgroundColor: '#fff',  }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{category.name}</Text>

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
        
        {products.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No products found in this category</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsList}
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.1}
            ListFooterComponent={renderFooter}
          />
        )}
      </View>
      
      <AuthPrompt
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        returnTo={{
          screen: 'Products',
          params: { category }
        }}
      />
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  rowContainer: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8
  },
  cartButton: {
    padding: 8,
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
    borderWidth: 2,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: '#8E8E93',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
  productsList: {
    padding: 12,
    paddingBottom: 100
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 6,
    maxWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  imageContainer: {
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#F8F8F8',
  },
  wishlistButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF3B30',
  },
  discountBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 6,
  },
  priceActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: '#8E8E93',
    textDecorationLine: 'line-through',
  },
  addIconCircle: {
    backgroundColor: Colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  disabledAddButton: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
  },
  loadingMore: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#8E8E93',
  },
  placeholder: {
    width: 40,
  }
});

export default ProductsScreen;