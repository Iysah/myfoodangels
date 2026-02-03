import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { observer } from 'mobx-react-lite';
import { useNavigation } from '@react-navigation/native';
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles';
import { useStores } from '../../contexts/StoreContext';
import { ArrowLeft, Search } from 'lucide-react-native';
import { Product } from '../../types';
import Constants from 'expo-constants';

const SearchScreen = observer(() => {
  const navigation = useNavigation();
  const { productStore } = useStores();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);
    
    if (query.trim().length > 2) {
      setIsLoading(true);
      try {
        // Firebase-only search using ProductStore
        const results = await productStore.searchProducts(query.trim());
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search products. Please try again.');
        // Fallback to client-side filter on already loaded products
        const localResults = productStore.products.filter(product =>
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          (product.desc || product.description || '').toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(localResults);
      } finally {
        setIsLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetails', { productId });
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const productId = item.id;
    const productName = item.name;
    const displayPrice = item.salePrice || item.price;
    const hasDiscount = item.salePrice && item.salePrice < item.price;
    const productImage = item.image || item.images?.[0];
    const isOutOfStock = !item.inStock || (item.quantity !== undefined && item.quantity <= 0);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(productId)}
        activeOpacity={0.9}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: productImage || 'https://via.placeholder.com/150' }} 
            style={styles.productImage} 
          />
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
            <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
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
            <View style={styles.addIconCircle}>
              <Search size={14} color={Colors.white} />
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container]}>
      <SafeAreaProvider style={{ backgroundColor: '#fff', position: 'relative', paddingTop: Constants.statusBarHeight }}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Search size={20} color={Colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoFocus
              placeholderTextColor={Colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.content}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Searching products...</Text>
            </View>
          )}

          {searchQuery.length > 0 && searchResults.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No products found for "{searchQuery}"</Text>
            </View>
          )}

          {searchResults.length > 0 && (
            <FlatList
              data={searchResults}
              renderItem={renderProduct}
              keyExtractor={(item) => String(item.id)}
              numColumns={2}
              contentContainerStyle={styles.resultsContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {searchQuery.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Start typing to search for products</Text>
            </View>
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  backButton: {
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 45,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.label,
    fontFamily: Typography.fontFamily.regular,
  },
  content: {
    flex: 1,
  },
  resultsContainer: {
    padding: 12,
    paddingBottom: 40,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
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
  productCategory: {
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
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    padding: 16,
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: '#FFDADA',
  },
  errorText: {
    fontSize: 14,
    fontFamily: Typography.fontFamily.regular,
    color: '#CC0000',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
  },
});

export default SearchScreen;