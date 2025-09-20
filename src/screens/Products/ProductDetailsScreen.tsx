import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import { observer } from 'mobx-react-lite'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { ArrowLeft, ShoppingCart, Heart } from 'lucide-react-native'
import { LoystarAPI, LoystarProduct } from '../../services/loystar'
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles'
import { useStores } from '../../contexts/StoreContext'
import ToastService from '../../utils/Toast'

type ProductDetailsRouteProp = RouteProp<{ ProductDetails: { productId: string } }, 'ProductDetails'>

const ProductDetailsScreen = observer(() => {
  const route = useRoute<ProductDetailsRouteProp>()
  const navigation = useNavigation()
  const { cartStore, authStore, productStore } = useStores()
  const [product, setProduct] = useState<LoystarProduct | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const productId = route.params?.productId

  useEffect(() => {
    fetchProductDetails()
  }, [productId])

  const fetchProductDetails = async () => {
    if (!productId) {
      setError('Product ID not provided')
      setIsLoading(false)
      return
    }

    console.log('LoystarAPI object:', LoystarAPI);
    console.log('fetchSingleProduct method:', LoystarAPI.fetchSingleProduct);

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching product details for ID:', productId)
      const productIdNumber = parseInt(productId, 10)
      if (isNaN(productIdNumber)) {
        throw new Error('Invalid product ID format')
      }
      const products = await LoystarAPI.fetchSingleProduct(productIdNumber)
      if (products && products.length > 0) {
        setProduct(products[0])
      } else {
        setError('Product not found')
      }
    } catch (error: any) {
      console.error('Error fetching product details:', error)
      setError(error.message || 'Failed to load product details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product) return
    
    // Convert LoystarProduct to Product type for cart
    const cartProduct = {
      id: product.id.toString(),
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price),
      salePrice: product.original_price ? parseFloat(product.original_price) : undefined,
      images: product.picture ? [product.picture] : [],
      category: 'General',
      tags: [],
      stock: product.quantity ? parseInt(product.quantity) : 0,
      rating: 0,
      reviewCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: !product.deleted,
      specifications: {
        'SKU': product.sku || 'N/A',
        'Unit': product.unit || 'piece',
        'Weight': product.weight || 'N/A',
        'Tax Rate': product.tax_rate || '0%',
      }
    }
    
    cartStore.addItem(cartProduct, 1)
    ToastService.success('Added to cart successfully!')
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaProvider style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading product details...</Text>
          </View>
        </SafeAreaProvider>
      </View>
    )
  }

  if (error || !product) {
    return (
      <View style={styles.container}>
        <SafeAreaProvider style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <ArrowLeft size={24} color={Colors.label} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Product Details</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error || 'Product not found'}</Text>
            <TouchableOpacity onPress={fetchProductDetails} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaProvider>
      </View>
    )
  }

  const currentPrice = parseFloat(product.price)
  const originalPrice = parseFloat(product.original_price)
  const hasDiscount = originalPrice && currentPrice < originalPrice

  return (
    <View style={styles.container}>
      <SafeAreaProvider style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Heart size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Image 
            source={{ uri: product.picture?.trim() || 'https://via.placeholder.com/300' }} 
            style={styles.productImage} 
            resizeMode="cover"
          />
          
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>₦{currentPrice.toFixed(2)}</Text>
              {hasDiscount && (
                <Text style={styles.originalPrice}>₦{originalPrice.toFixed(2)}</Text>
              )}
            </View>

            {product.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{product.description}</Text>
              </View>
            )}

            <View style={styles.detailsContainer}>
              <Text style={styles.sectionTitle}>Product Details</Text>
              
              {product.sku && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>SKU:</Text>
                  <Text style={styles.detailValue}>{product.sku}</Text>
                </View>
              )}
              
              {product.unit && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Unit:</Text>
                  <Text style={styles.detailValue}>{product.unit}</Text>
                </View>
              )}
              
              {product.quantity && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Quantity:</Text>
                  <Text style={styles.detailValue}>{product.quantity}</Text>
                </View>
              )}

              {product.tax && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tax:</Text>
                  <Text style={styles.detailValue}>+{product.tax_rate}% {product.tax_type}</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={handleAddToCart}
          >
            <ShoppingCart size={20} color={Colors.white} />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaProvider>
    </View>
  )
});

export default ProductDetailsScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        backgroundColor: Colors.background,
        position: 'relative',
        paddingTop: Constants.statusBarHeight,
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        backgroundColor: Colors.background,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    backButton: {
        padding: Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.bold,
        color: Colors.label,
    },
    favoriteButton: {
        padding: Spacing.sm,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
    },
    productImage: {
        width: '100%',
        height: 300,
        backgroundColor: Colors.gray.light,
    },
    productInfo: {
        padding: Spacing.md,
    },
    productName: {
        fontSize: Typography.fontSize.xl,
        fontFamily: Typography.fontFamily.bold,
        color: Colors.label,
        marginBottom: Spacing.sm,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    currentPrice: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.bold,
        color: Colors.primary,
    },
    originalPrice: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        color: Colors.textSecondary,
        textDecorationLine: 'line-through',
    },
    descriptionContainer: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: Typography.fontSize.lg,
        fontFamily: Typography.fontFamily.bold,
        color: Colors.label,
        marginBottom: Spacing.sm,
    },
    description: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        color: Colors.textSecondary,
        lineHeight: 22,
    },
    detailsContainer: {
        marginBottom: Spacing.xl,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    detailLabel: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.medium,
        color: Colors.label,
    },
    detailValue: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        color: Colors.textSecondary,
    },
    footer: {
        padding: Spacing.lg,
        backgroundColor: Colors.background,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    addToCartButton: {
        ...GlobalStyles.primaryButton,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    addToCartText: {
        ...GlobalStyles.primaryButtonText,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        color: Colors.textSecondary,
        marginTop: Spacing.md,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    errorText: {
        fontSize: Typography.fontSize.base,
        fontFamily: Typography.fontFamily.regular,
        color: Colors.error,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    retryButton: {
        ...GlobalStyles.secondaryButton,
    },
    retryButtonText: {
        ...GlobalStyles.secondaryButtonText,
    },
})
