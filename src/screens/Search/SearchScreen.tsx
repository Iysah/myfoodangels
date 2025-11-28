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
          product.description?.toLowerCase().includes(query.toLowerCase())
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
    const productPrice = item.salePrice || item.price;
    const productImage = item.images?.[0];

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(productId)}
      >
        <Image 
          source={{ uri: productImage || 'https://via.placeholder.com/150' }} 
          style={styles.productImage} 
        />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{productName}</Text>
          <Text style={styles.productPrice}>₦{productPrice.toLocaleString()}</Text>
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
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.white,
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    height: 40,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.label,
    fontFamily: Typography.fontFamily.regular,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },
  resultsContainer: {
    paddingTop: Spacing.md,
  },
  productCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    margin: Spacing.xs,
    padding: Spacing.sm,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: Spacing.xs,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.medium,
    color: Colors.label,
    marginBottom: Spacing.xs,
  },
  productPrice: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.bold,
    color: Colors.primary,
  },
  productSource: {
    fontSize: Typography.fontSize.xs,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: Spacing.md,
    borderRadius: 8,
    marginVertical: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    fontFamily: Typography.fontFamily.regular,
    color: '#c62828',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    fontFamily: Typography.fontFamily.regular,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

export default SearchScreen;