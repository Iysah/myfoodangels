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
import { Product } from '../../types/Product'
import { Colors, GlobalStyles, Spacing, Typography } from '../../styles/globalStyles'
import { useStores } from '../../contexts/StoreContext'
import ToastService from '../../utils/Toast'

type ProductDetailsRouteProp = RouteProp<{ ProductDetails: { productId: string } }, 'ProductDetails'>

const ProductDetailsScreen = observer(() => {
  const route = useRoute<ProductDetailsRouteProp>()
  const navigation = useNavigation()
  const { cartStore, productStore } = useStores()
  const [product, setProduct] = useState<Product | null>(null)
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

    try {
      setIsLoading(true)
      setError(null)
      
      console.log('Fetching product details for ID:', productId)
      const fetched = await productStore.fetchProductById(productId)
      if (fetched) {
        setProduct(fetched)
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
    
    cartStore.addItem(product, 1)
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

  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price
  const displayPrice = hasDiscount ? product.salePrice! : product.price
  const originalPrice = hasDiscount ? product.price : undefined

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
            source={{ uri: (product.images && product.images[0]) ? product.images[0] : 'https://via.placeholder.com/300' }} 
            style={styles.productImage} 
            resizeMode="cover"
          />
          
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>₦{displayPrice.toFixed(2)}</Text>
              {hasDiscount && originalPrice !== undefined && (
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
              {typeof product.stock === 'number' && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Stock:</Text>
                  <Text style={styles.detailValue}>{product.stock}</Text>
                </View>
              )}
              {product.specifications && Object.entries(product.specifications).map(([key, value]) => (
                <View style={styles.detailRow} key={key}>
                  <Text style={styles.detailLabel}>{key}:</Text>
                  <Text style={styles.detailValue}>{String(value)}</Text>
                </View>
              ))}
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
