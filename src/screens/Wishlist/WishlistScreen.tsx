import React from 'react';
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
import { ArrowLeft, Bell, Heart, ShoppingCart } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../../styles/globalStyles';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import { LoystarProduct } from '../../services/loystar/api';

type WishlistScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface WishlistScreenProps {}

const WishlistScreen: React.FC<WishlistScreenProps> = observer(() => {
  const navigation = useNavigation<WishlistScreenNavigationProp>();
  const { wishlistStore, cartStore, authStore } = useStores();

  const handleRemoveFromWishlist = (productId: number, productName: string) => {
    wishlistStore.removeFromWishlist(productId);
    Alert.alert('Removed', `${productName} removed from wishlist`);
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

  const handleAddToCart = (product: LoystarProduct) => {
    try {
      // Convert wishlist product to cart product format
      const cartProduct = {
        id: product.id.toString(),
        name: product.name,
        price: parseFloat(product.price),
        description: product.description || '',
        images: [product.picture || 'https://via.placeholder.com/150'],
        category: 'Wishlist Item',
        stock: 100, // Default stock
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        isFeatured: false,
        brand: undefined,
        weight: product.weight ? parseFloat(product.weight) : undefined,
        tags: [],
        rating: 0,
        reviewCount: 0,
      };
      
      cartStore.addItem(cartProduct, 1);
      Alert.alert('Success', `${product.name} added to cart!`);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      Alert.alert('Error', 'Failed to add item to cart');
    }
  };

  const renderWishlistItem = ({ item }: { item: LoystarProduct }) => (
    <View style={styles.productCard}>
      <Image 
        source={{ uri: item.picture || 'https://via.placeholder.com/150' }} 
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        {item.description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <Text style={styles.productPrice}>₦{parseFloat(item.price).toLocaleString()}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
          >
            <ShoppingCart size={16} color="#fff" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => handleRemoveFromWishlist(item.id, item.name)}
          >
            <Heart size={16} color={Colors.primary} fill={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmptyWishlist = () => (
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

  return (
    <View style={styles.container}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <View style={styles.header}>
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
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label,
    opacity: 0.7,
    marginBottom: 8,
  },
  productPrice: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    marginLeft: 4,
  },
  removeButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
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