import React, { useEffect } from 'react';
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
import {Bell, Heart, ShoppingCart } from 'lucide-react-native'

const HomeScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, productStore } = useStores();

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
      } catch (error) {
        console.error('Error loading home screen data:', error);
      }
    };

    loadData();
  }, [productStore, authStore.loystarToken]);

  const handleProductPress = (productId: string) => {
    // Navigate to product details
    navigation.navigate('ProductDetails', { productId });
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

  const renderProduct = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item.id)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLoystarProduct = ({ item }: { item: any }) => {
    const currentPrice = parseFloat(item.price);
    const originalPrice = parseFloat(item.original_price);
    const hasDiscount = originalPrice && currentPrice < originalPrice;
    
    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item.id.toString())}
      >
        <Image 
          source={{ uri: item.picture?.trim() || 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
        />
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
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => {
        // Navigate to categories page or filter products by category
        // For now, we'll filter products by category
        productStore?.fetchProducts({ category: item.name });
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

  const renderSectionHeader = ({ section }: { section: SectionData }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      {section.showViewAll && (
        <TouchableOpacity onPress={() => {
          console.log(`Navigate to ${section.title}`);
        }}>
          <Text style={styles.viewAllButton}>View All</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionItem = ({ item, section }: { item: any; section: SectionData }) => {
    if (section.type === 'categories') {
      return (
        <FlatList
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

  const sections: SectionData[] = [
    {
      title: 'Categories',
      data: [productStore?.categories.slice(0, 6) || []],
      type: 'categories',
      showViewAll: true,
    },
    {
      title: 'Featured Products',
      data: [productStore?.featuredProducts || []],
      type: 'horizontal',
      showViewAll: false,
    },
    {
      title: 'Farm Offtake',
      data: [productStore?.farmOfftakeProducts || []],
      type: 'horizontal',
      showViewAll: true,
      emptyMessage: authStore.loystarToken ? 'No farm offtake products available' : 'Please login to view farm offtake products',
      isLoading: productStore?.farmOfftakeLoading,
      error: productStore?.farmOfftakeError,
    },
    {
      title: 'Flash Sales',
      data: [[]],
      type: 'horizontal',
      showViewAll: true,
      emptyMessage: 'Flash sales coming soon!',
    },
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
      showViewAll: false,
    },
  ];

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MyFoodAngels</Text>

        <View style={styles.rowContainer}>
          <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
            <ShoppingCart size={18} color={'#000'}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton}>
            <Heart size={18} color={'#000'}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cartButton}>
            <Bell size={18} color={'#000'}/>
          </TouchableOpacity>
        </View>
      </View>

      <SectionList
        sections={sections}
        renderSectionHeader={renderSectionHeader}
        renderItem={renderSectionItem}
        keyExtractor={(item, index) => `section-${index}`}
        style={styles.content}
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
                for full access
              </Text>
            </View>
          ) : null
        }
        stickySectionHeadersEnabled={false}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontFamily: Typography.fontFamily.bold,
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
    textAlign: 'center',
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
    backgroundColor: Colors.white,
    borderRadius: 8,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    // shadowColor: Colors.label,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
    width: 150,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
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