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
import { LoystarAPI, LoystarProduct } from '../../services/loystar/api';
import { RootStackParamList } from '../../navigation/types';
import { useStores } from '../../contexts/StoreContext';
import { ArrowLeft, Bell, Heart, ShoppingCart } from 'lucide-react-native';
import { Colors, Spacing } from '../../styles/globalStyles';
import ToastService from '../../utils/Toast';
import AuthPrompt from '../../components/AuthPrompt';
import {SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants';

type ProductsScreenRouteProp = RouteProp<RootStackParamList, 'Products'>;
type ProductsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Products'>;

interface ProductsScreenProps {}

const ProductsScreen: React.FC<ProductsScreenProps> = observer(() => {
  const navigation = useNavigation<ProductsScreenNavigationProp>();
  const route = useRoute<ProductsScreenRouteProp>();
  const { productStore, cartStore, authStore, wishlistStore } = useStores();
  
  const { category } = route.params;
  
  const [products, setProducts] = useState<LoystarProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      // Note: The fetchProducts method uses specific hardcoded headers for the products endpoint
      // The stored token from login is for checkout, not for product fetching
      const response = await LoystarAPI.fetchProducts(category.loystarId, page, 10);
      
      // Handle the actual API response structure (array of products)
      const products = Array.isArray(response) ? response : response.data || [];
      
      if (append) {
        setProducts(prev => [...prev, ...products]);
      } else {
        setProducts(products);
      }
      
      // Since the API doesn't return pagination meta, we'll handle it differently
      // For now, assume we got all products if we received less than the page size
      const hasMoreProducts = products.length === 10; // pageSize
      setCurrentPage(page);
      setTotalPages(hasMoreProducts ? page + 1 : page); // Simple pagination logic
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Failed to load products');
      ToastService.error('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMoreProducts = () => {
    if (!isLoadingMore && currentPage < totalPages) {
      loadProducts(currentPage + 1, true);
    }
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

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const addToCart = (product: LoystarProduct) => {
    try {
      // Convert LoystarProduct to our Product type
      const cartProduct = {
        id: product.id.toString(),
        name: product.name,
        description: product.description || '',
        price: parseFloat(product.price),
        salePrice: product.original_price ? parseFloat(product.original_price) : undefined,
        images: [product.picture || 'https://via.placeholder.com/150'],
        category: category.name,
        subcategory: undefined,
        tags: [],
        stock: parseInt(product.quantity || '0'),
        rating: 0,
        reviewCount: 0,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at),
        isActive: !product.deleted,
        isFeatured: false,
        brand: undefined,
        weight: product.weight ? parseFloat(product.weight) : undefined,
      };
      
      cartStore.addItem(cartProduct, 1);
      ToastService.success(`${product.name} added to cart!`);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      ToastService.error('Failed to add item to cart');
    }
  };

  const handleWishlistToggle = (item: LoystarProduct) => {
    // Check if user is authenticated for wishlist access
    if (authStore.requiresAuthentication()) {
      // Show authentication prompt with return navigation
      setShowAuthPrompt(true);
      return;
    }

    const isInWishlist = wishlistStore.isInWishlist(item.id.toString());
    if (isInWishlist) {
      wishlistStore.removeFromWishlist(item.id.toString());
      ToastService.success(`${item.name} removed from wishlist`);
    } else {
      wishlistStore.addToWishlist({
        id: item.id.toString(),
        name: item.name,
        price: parseFloat(item.price),
        image: item.picture || 'https://via.placeholder.com/150',
        description: item.description || '',
      });
      ToastService.success(`${item.name} added to wishlist!`);
    }
  };

  const renderProduct = ({ item }: { item: LoystarProduct }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleProductPress(item.id.toString())}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: item.picture || 'https://via.placeholder.com/150' }} 
          style={styles.productImage}
        />
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => handleWishlistToggle(item)}
        >
          <Heart 
            size={20} 
            color={wishlistStore.isInWishlist(item.id.toString()) ? Colors.primary : '#ccc'}
            fill={wishlistStore.isInWishlist(item.id.toString()) ? Colors.primary : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>₦{parseFloat(item.price).toLocaleString()}</Text>
          {item.original_price && parseFloat(item.original_price) > parseFloat(item.price) && (
            <Text style={styles.originalPrice}>₦{parseFloat(item.original_price).toLocaleString()}</Text>
          )}
        </View>
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => addToCart(item)}
        >
          <Text style={styles.addToCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

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
      <View style={styles.container}>
        <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
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
        </SafeAreaProvider>
      </View>
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
    <View style={styles.container}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
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
      </SafeAreaProvider>
      
      <AuthPrompt
        visible={showAuthPrompt}
        onClose={() => setShowAuthPrompt(false)}
        returnTo={{
          screen: 'Products',
          params: { category }
        }}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  placeholder: {
    width: 40, // Same width as back button for centering
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  productsList: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 6,
    maxWidth: '47%', // Ensures consistent width for 2-column grid
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Ensures rounded corners work properly
  },
  imageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 140,
    resizeMode: 'cover',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 6,
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
    marginBottom: 6,
    lineHeight: 18,
  },
  productDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
    lineHeight: 16,
    minHeight: 32, // Ensures consistent spacing even when description is short
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 6,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 'auto', // Push button to bottom of card
  },
  addToCartText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
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
    color: '#666',
  },
});

export default ProductsScreen;