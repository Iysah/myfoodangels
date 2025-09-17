import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';

const HomeScreen = observer(() => {
  const navigation = useNavigation();
  const { authStore, productStore } = useStores();

  useEffect(() => {
    // Load featured products
    if (productStore) {
      productStore.fetchFeaturedProducts();
    }
  }, [productStore]);

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

  return (
    <SafeAreaView style={[GlobalStyles.safeArea, styles.container]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MyFoodAngels</Text>
        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {!authStore.isAuthenticated && !authStore.isGuest && (
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
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Featured Products</Text>
          <FlatList
            data={productStore?.featuredProducts || []}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Products</Text>
          <FlatList
            data={productStore?.products || []}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridList}
          />
        </View>
      </ScrollView>
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
  cartButton: {
    padding: Spacing.sm,
  },
  cartIcon: {
    fontSize: 24,
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
    color: Colors.label,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
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
    shadowColor: Colors.label,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
});

export default HomeScreen;