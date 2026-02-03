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
import { Colors, GlobalStyles, Spacing, Typography } from '@/styles/globalStyles';
import { useStores } from '@/contexts/StoreContext';
import { Category } from '@/types';
import {Bell, Heart, ShoppingCart, Search } from 'lucide-react-native'
import LogoIcon from '../../../assets/icons/logo';
import { 
  AppConfig, 
  listenToAppConfig, 
  shouldShowFlashSales 
} from '@/services/firebase/appConfig';
import { listenToDocument } from '@/services/firebase/firestore';
import ToastService from '@/utils/Toast';

const HomeScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, productStore, cartStore, wishlistStore } = useStores();
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          productStore.fetchFeaturedProducts(),
          productStore.fetchCategories(),
          productStore.fetchProducts(),
        ]);
      } catch (error) {
        console.error('Error loading home screen data:', error);
      }
    };

    loadData();
  }, [productStore]);

  // Listen to Firebase app configuration changes
  useEffect(() => {
    const unsubscribe = listenToAppConfig((config) => {
      setAppConfig(config);
    });

    return () => unsubscribe();
  }, []);

  // Listen to user notifications for unread count badge
  useEffect(() => {
    const userId = authStore.user?.id;
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    const unsubscribe = listenToDocument<any>('notifications', userId, (doc) => {
      const items = (doc?.notifications || []) as Array<{ read?: boolean }>
      const count = items.reduce((acc, n) => acc + (!n.read ? 1 : 0), 0)
      setUnreadCount(count)
    })

    return () => unsubscribe()
  }, [authStore.user?.id])

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
    const isInWishlist = wishlistStore.isInWishlist(item.id);
    const isOutOfStock = !item.inStock || (item.quantity !== undefined && item.quantity <= 0);
    const displayPrice = item.salePrice || item.price;
    const hasDiscount = item.salePrice && item.salePrice < item.price;

    const handleAddToCart = (e: any) => {
      e.stopPropagation();
      if (isOutOfStock) {
        ToastService.error('Out of Stock', 'This item is currently unavailable.');
        return;
      }
      cartStore.addItem(item, 1);
      ToastService.success('Added to Cart', `${item.name} added to cart`);
    };

    const handleToggleWishlist = (e: any) => {
      e.stopPropagation();
      wishlistStore.toggleWishlistItem(item);
      if (isInWishlist) {
        ToastService.info('Removed from Wishlist', `${item.name} removed from wishlist`);
      } else {
        ToastService.success('Added to Wishlist', `${item.name} added to wishlist`);
      }
    };

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.productImageContainer}>
          <Image 
            source={{ uri: item?.image || item?.images?.[0] || item?.picture || 'https://via.placeholder.com/150' }} 
            style={styles.productImage} 
          />
          
          <TouchableOpacity 
            style={styles.wishlistButton}
            onPress={handleToggleWishlist}
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
            {item.category?.name && (
              <Text style={styles.productCategory}>{item.category.name}</Text>
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
              onPress={handleAddToCart}
              disabled={isOutOfStock}
            >
              <ShoppingCart size={14} color={Colors.white} />
            </TouchableOpacity>
          </View>
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
  const renderFunction = renderProduct;
      
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
  const renderFunction = renderProduct;
      
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

    // Removed Farm Offtake section and Loystar-dependent content

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
        data: [productStore?.products || []],
        type: 'grid',
        showViewAll: true,
        emptyMessage: 'No products available',
      }
    );

    return baseSections;
  }, [
    appConfig,
    productStore?.categories,
    productStore?.products,
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
            <View style={styles.cartIconContainer}>
              <Bell size={22} color={'#000'}/>
              {unreadCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
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
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.md,
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
    paddingBottom: Spacing.sm,
  },
  gridList: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 40,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
    maxWidth: '47%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
  },
  productImageContainer: {
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
    fontFamily: Typography.fontFamily.bold,
    color: Colors.error,
    fontWeight: '700',
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
    color: Colors.white,
    fontSize: 10,
    fontFamily: Typography.fontFamily.bold,
    textTransform: 'uppercase',
  },
  productInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.label,
    marginBottom: 2,
    lineHeight: 18,
  },
  productCategory: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
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
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 11,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
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
    backgroundColor: Colors.border,
    shadowOpacity: 0,
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
    margin: 2,
    padding: Spacing.sm,
    alignItems: 'center',
    flex: 1,
    maxWidth: '30%',
  },
  categoryImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
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