import React, { useEffect, useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SectionList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import { Category } from '../../types';
import {Bell, Heart, ShoppingCart, Search } from 'lucide-react-native'
import LogoIcon from '../../../assets/icons/logo';
import { 
  AppConfig, 
  listenToAppConfig, 
  shouldShowFarmOfftake, 
  shouldShowFlashSales 
} from '../../services/firebase/appConfig';

const HomeScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, productStore, cartStore, wishlistStore } = useStores();
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('HomeScreen: Starting to load data...');
        console.log('ProductStore loading states:', {
          isLoading: productStore.isLoading,
          categoriesLoading: productStore.categoriesLoading,
          error: productStore.error
        });
        
        await Promise.all([
          productStore.fetchFeaturedProducts(),
          productStore.fetchCategories(),
          productStore.fetchAllLoystarProducts(50), // Fetch random 10 products for All Products section
        ]);
        
        // Fetch Farm Offtake products from Loystar if user is authenticated
        if (authStore.loystarToken) {
          console.log('Fetching Farm Offtake products...');
          await productStore.fetchFarmOfftakeProducts(1, 6);
        } else {
          console.log('No Loystar token available, skipping Farm Offtake products');
        }
        
        console.log('HomeScreen: Data loaded successfully');
        console.log('Featured products count:', productStore.featuredProducts.length);
        console.log('Categories count:', productStore.categories.length);
        console.log('Farm Offtake products count:', productStore.farmOfftakeProducts.length);
        console.log('All Loystar products count:', productStore.allLoystarProducts.length);
      } catch (error) {
        console.error('Error loading home screen data:', error);
      }
    };

    loadData();
  }, [productStore, authStore.loystarToken]);

  // Listen to Firebase app configuration changes
  useEffect(() => {
    const unsubscribe = listenToAppConfig((config) => {
      console.log('App config updated:', config);
      setAppConfig(config);
    });

    return () => unsubscribe();
  }, []);

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const handleCartPress = () => {
    navigation.navigate('Cart');
  };

  const handleLikePress = () => {
    navigation.navigate('Likes');
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications');
  };

  const renderProduct = ({ item }: { item: any }) => {
    const isInWishlist = wishlistStore.isInWishlist(parseInt(item.id));
    
    const handleAddToCart = (e: any) => {
      e.stopPropagation();
      cartStore.addItem(item, 1);
    };

    const handleToggleWishlist = (e: any) => {
      e.stopPropagation();
      // For regular products, we'll skip wishlist functionality for now
      // since they don't match the LoystarProduct interface
      console.log('Wishlist functionality not available for regular products');
    };

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
      >
        <View style={styles.productImageContainer}>
          <Image source={{ uri: item.imageUrl || item.images?.[0] }} style={styles.productImage} />
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
          >
            <Heart 
              size={20} 
              color={isInWishlist ? Colors.primary : Colors.textSecondary}
              fill={isInWishlist ? Colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productPrice}>₦{item.price}</Text>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart size={16} color={Colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLoystarProduct = ({ item }: { item: any }) => {
    const currentPrice = parseFloat(item.price);
    const originalPrice = parseFloat(item.original_price);
    const hasDiscount = originalPrice && currentPrice < originalPrice;
    const isInWishlist = wishlistStore.isInWishlist(item.id);
    
    const handleAddToCart = (e: any) => {
      e.stopPropagation();
      // Convert LoystarProduct to Product format for cart
      const productForCart = {
        id: item.id.toString(),
        name: item.name,
        description: item.description || '',
        price: currentPrice,
        images: [item.picture?.trim() || 'https://via.placeholder.com/150'],
        category: item.category || 'General',
        tags: [],
        stock: item.stock || 1,
        rating: 0,
        reviewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };
      cartStore.addItem(productForCart, 1);
    };

    const handleToggleWishlist = (e: any) => {
      e.stopPropagation();
      wishlistStore.toggleWishlistItem(item);
    };
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id.toString())}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item.picture?.trim() || 'https://via.placeholder.com/150' }} 
            style={styles.productImage} 
          />
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
          >
            <Heart 
              size={20} 
              color={isInWishlist ? Colors.primary : Colors.textSecondary}
              fill={isInWishlist ? Colors.primary : 'transparent'}
            />
          </TouchableOpacity>
          {hasDiscount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% OFF
              </Text>
            </View>
          )}
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>
              ₦{currentPrice.toFixed(2)}
            </Text>
            {hasDiscount && (
              <Text style={styles.originalPrice}>₦{originalPrice.toFixed(2)}</Text>
            )}
          </View>
          {item.tax && (
            <Text style={styles.productCategory}>
              +{item.tax_rate}% {item.tax_type}
            </Text>
          )}
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <ShoppingCart size={16} color={Colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        navigation.navigate('Products', {
          category: {
            id: item.id,
            name: item.name,
            loystarId: item.loystarId || 0,
            image: item.image,
          }
        });
      }}
    >
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  interface SectionData {
    title: string;
    data: any[];
    type: 'categories' | 'horizontal' | 'grid';
    showViewAll: boolean;
    emptyMessage?: string;
    isLoading?: boolean;
    error?: string | null;
  }

  const renderSectionHeader = ({ section }: { section: SectionData }) => {
    if (!section.showViewAll) return null;
    
    const handleViewAllPress = () => {
      if (section.title === 'Categories') {
        navigation.navigate('Categories' as never);
      } else {
        console.log('View all pressed for:', section.title);
      }
    };
    
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <TouchableOpacity onPress={handleViewAllPress}>
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSectionItem = ({ item, section }: { item: any; section: SectionData }) => {
    if (section.type === 'categories') {
      return (
        <FlatList
          key={`categories-${appConfig ? 'with-config' : 'no-config'}`}
          data={item}
          renderItem={renderCategory}
          keyExtractor={(category: Category) => category.id}
          numColumns={3}
          scrollEnabled={false}
          contentContainerStyle={styles.categoriesGrid}
        />
      );
    } else if (section.type === 'horizontal') {
      // Use renderLoystarProduct for Farm Offtake section
      const renderFunction = section.title === 'Farm Offtake' ? renderLoystarProduct : renderProduct;
      
      return (
        <FlatList
          key={`horizontal-${section.title}-${appConfig ? 'with-config' : 'no-config'}`}
          data={item}
          renderItem={renderFunction}
          keyExtractor={(product: any) => product.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={
            section.emptyMessage ? (
              <View style={styles.emptySection}>
                <Text style={styles.emptyText}>{section.emptyMessage}</Text>
              </View>
            ) : null
          }
        />
      );
    } else if (section.type === 'grid') {
      // Use renderLoystarProduct for Farm Offtake section if it's ever displayed as grid
      const renderFunction = section.title === 'Farm Offtake' ? renderLoystarProduct : renderProduct;
      
      return (
        <FlatList
          key={`grid-${section.title}-${appConfig ? 'with-config' : 'no-config'}`}
          data={item}
          renderItem={renderFunction}
          keyExtractor={(product: any) => product.id.toString()}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.gridList}
        />
      );
    }
    return null;
  };

  // Create sections array with Firebase configuration-based visibility
  const sections = useMemo((): SectionData[] => {
    const baseSections: SectionData[] = [
      {
        title: 'Categories',
        data: [productStore?.categories.slice(0, 6) || []],
        type: 'categories',
        showViewAll: true,
      },
    ];

    // Add Farm Offtake section if enabled by Firebase config
    if (appConfig && shouldShowFarmOfftake(appConfig)) {
      baseSections.push({
        title: 'Farm Offtake',
        data: [productStore?.farmOfftakeProducts || []],
        type: 'horizontal',
        showViewAll: true,
        emptyMessage: authStore.loystarToken ? 'No farm offtake products available' : 'Please login to view farm offtake products',
        isLoading: productStore?.farmOfftakeLoading,
        error: productStore?.farmOfftakeError,
      });
    }

    // Add Flash Sales section if enabled by Firebase config
    if (appConfig && shouldShowFlashSales(appConfig)) {
      baseSections.push({
        title: 'Flash Sales',
        data: [[]],
        type: 'horizontal',
        showViewAll: true,
        emptyMessage: 'Flash sales coming soon!',
      });
    }

    // Always show these sections
    baseSections.push(
      {
        title: 'Subscription Packages',
        data: [[]],
        type: 'horizontal',
        showViewAll: true,
        emptyMessage: 'Subscription packages coming soon!',
      },
      {
        title: 'All Products',
        data: [productStore?.allLoystarProducts || []],
        type: 'grid',
        showViewAll: false,
        isLoading: productStore?.allProductsLoading,
        error: productStore?.allProductsError,
        emptyMessage: 'No products available',
      }
    );

    return baseSections;
  }, [
    appConfig,
    productStore?.categories,
    productStore?.farmOfftakeProducts,
    productStore?.products,
    productStore?.farmOfftakeLoading,
    productStore?.farmOfftakeError,
    productStore?.allLoystarProducts,
    productStore?.allProductsLoading,
    productStore?.allProductsError,
    authStore.loystarToken,
  ]);

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <View style={styles.header}>
        <View>
          <LogoIcon />
        </View>

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

          <TouchableOpacity style={styles.cartButton} onPress={handleNotificationPress}>
            <Bell size={22} color={'#000'}/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity 
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.7}
      >
        <Search size={20} color={Colors.textSecondary} />
        <Text style={styles.searchPlaceholder}>I'm looking for...</Text>
      </TouchableOpacity>

      <SectionList
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderSectionItem}
        keyExtractor={(item, index) => `item-${index}`}
        stickySectionHeadersEnabled={false}
        style={styles.content}
        extraData={appConfig}
        ListHeaderComponent={
          !authStore.isAuthenticated && !authStore.isGuest ? (
            <View style={styles.guestBanner}>
              <Text style={styles.guestText}>
                Browse our products as a guest or{' '}
                <Text
                  style={styles.loginLink}
                  onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                >
                  sign in
                </Text>{' '}
                for full access.
              </Text>
            </View>
          ) : null
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
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
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchPlaceholder: {
    marginLeft: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  guestBanner: {
    backgroundColor: Colors.primary + '20',
    padding: Spacing.md,
    margin: Spacing.md,
    borderRadius: 8,
  },
  guestText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.label,
    textAlign: 'left',
  },
  loginLink: {
    color: Colors.primary,
    fontFamily: Typography.fontFamily.bold,
  },
  section: {
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
    color: Colors.label,
  },
  productList: {
    paddingHorizontal: Spacing.md,
  },
  gridList: {
    paddingHorizontal: Spacing.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    maxWidth: '46%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 130,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.white,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.bold,
    fontWeight: '600',
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  productCategory: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addToCartButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    gap: 4,
  },
  addToCartText: {
    color: Colors.white,
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md
  },
  viewAllButton: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.primary,
  },
  categoriesGrid: {
    paddingHorizontal: Spacing.md,
  },
  categoryCard: {
    borderRadius: 8,
    margin: 4,
    padding: Spacing.sm,
    alignItems: 'center',
    flex: 1,
    maxWidth: '30%',
  },
  categoryImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: Spacing.xs,
  },
  categoryName: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    textAlign: 'center',
  },
  emptySection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.label + '80',
    textAlign: 'center',
  },
});

export default HomeScreen;