import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native'
import React, { useEffect, useState } from 'react'
import {  SafeAreaView } from 'react-native-safe-area-context'
import { observer } from 'mobx-react-lite'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import { ArrowLeft, ShoppingCart, Heart, Share2, Info, Package, Tag, Star } from 'lucide-react-native'
import { Product } from '../../types/Product'
import { Colors, GlobalStyles, Spacing, Typography, BorderRadius } from '../../styles/globalStyles'
import { useStores } from '../../contexts/StoreContext'
import ToastService from '../../utils/Toast'

const { width } = Dimensions.get('window')

type ProductDetailsRouteProp = RouteProp<{ ProductDetails: { productId: string } }, 'ProductDetails'>

const ProductDetailsScreen = observer(() => {
  const route = useRoute<ProductDetailsRouteProp>()
  const navigation = useNavigation()
  const { cartStore, productStore } = useStores()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)

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
    
    // Check if item is in stock
    if (!product.inStock || (product.quantity !== undefined && product.quantity <= 0)) {
       ToastService.error('Out of stock', 'This item is currently unavailable.')
       return
    }
    
    cartStore.addItem(product, quantity)
    ToastService.success('Added to cart successfully!')
  }

  const handleGoBack = () => {
    navigation.goBack()
  }

  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1))

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </SafeAreaView>
    )
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Info size={48} color={Colors.error} strokeWidth={1.5} />
          <Text style={styles.errorText}>{error || 'Product not found'}</Text>
          <TouchableOpacity onPress={fetchProductDetails} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Handle image fallback
  const productImage = product.image || (product.images && product.images[0]) || 'https://via.placeholder.com/600'
  const productDescription = product.desc || product.description || 'No description available for this product.'
  
  const hasDiscount = product.salePrice !== undefined && product.salePrice < product.price
  const displayPrice = hasDiscount ? product.salePrice! : product.price
  const originalPrice = hasDiscount ? product.price : undefined
  
  const isOutOfStock = !product.inStock || (product.quantity !== undefined && product.quantity <= 0)

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.label} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>Product Details</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerIcon}>
              <Share2 size={22} color={Colors.label} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIcon}>
              <Heart size={22} color={Colors.label} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Main Product Image */}
          <View style={styles.imageWrapper}>
            <Image 
              source={{ uri: productImage }} 
              style={styles.productImage} 
              resizeMode="cover"
            />
            {isOutOfStock && (
              <View style={styles.outOfStockOverlay}>
                <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
              </View>
            )}
            {hasDiscount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>SALE</Text>
              </View>
            )}
          </View>
          
          <View style={styles.productCard}>
            {/* Category & Badge Row */}
            <View style={styles.badgeRow}>
              {product.category?.name ? (
                <View style={styles.categoryTag}>
                  <Tag size={12} color={Colors.primary} />
                  <Text style={styles.categoryText}>{product.category.name}</Text>
                </View>
              ) : null}
              
              <View style={[styles.stockBadge, isOutOfStock ? styles.outOfStockBadge : styles.inStockBadge]}>
                <View style={[styles.stockDot, isOutOfStock ? styles.outOfStockDot : styles.inStockDot]} />
                <Text style={[styles.stockText, isOutOfStock ? styles.outOfStockLabel : styles.inStockLabel]}>
                  {isOutOfStock ? 'Sold Out' : 'In Stock'}
                </Text>
              </View>
            </View>

            {/* Product Title */}
            <Text style={styles.productName}>{product.name}</Text>
            
            {/* Price & Rating */}
            <View style={styles.priceRatingRow}>
              <View style={styles.priceSection}>
                <Text style={styles.currentPrice}>₦{displayPrice.toLocaleString()}</Text>
                {hasDiscount && originalPrice && (
                  <Text style={styles.originalPrice}>₦{originalPrice.toLocaleString()}</Text>
                )}
              </View>
              
              <View style={styles.ratingSection}>
                <Star size={16} color="#FFB800" fill="#FFB800" />
                <Text style={styles.ratingText}>{product.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.ratingCount}>({product.ratingCount || 0})</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Description */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{productDescription}</Text>
            </View>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <View style={styles.quantitySection}>
                <Text style={styles.quantityLabel}>Quantity</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity onPress={decrementQuantity} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <TouchableOpacity onPress={incrementQuantity} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Product Meta Info */}
            <View style={styles.metaSection}>
              <View style={styles.metaItem}>
                <Package size={20} color={Colors.textSecondary} />
                <View style={styles.metaTextWrapper}>
                  <Text style={styles.metaLabel}>Availability</Text>
                  <Text style={styles.metaValue}>{product.quantity || 0} units remaining</Text>
                </View>
              </View>
              
              {product.loystarId ? (
                <View style={styles.metaItem}>
                  <Info size={20} color={Colors.textSecondary} />
                  <View style={styles.metaTextWrapper}>
                    <Text style={styles.metaLabel}>Loystar ID</Text>
                    <Text style={styles.metaValue}>{product.loystarId}</Text>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Action Button / Box */}
        <View style={styles.footerContainer}>
          <TouchableOpacity 
            style={[styles.addToCartBtn, isOutOfStock && styles.disabledBtn]} 
            onPress={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart size={22} color={Colors.white} />
            <Text style={styles.addToCartBtnText}>
              {isOutOfStock ? 'Sold Out' : `Add to Cart • ₦${(displayPrice * quantity).toLocaleString()}`}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  )
});

export default ProductDetailsScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
  },
  content: {
    flex: 1,
  },
  imageWrapper: {
    width: width,
    height: width * 0.9,
    position: 'relative',
    backgroundColor: '#F0F2F5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    padding: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  categoryText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  inStockBadge: {
    backgroundColor: '#F0FDF4',
  },
  outOfStockBadge: {
    backgroundColor: '#FEF2F2',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inStockDot: {
    backgroundColor: '#16A34A',
  },
  outOfStockDot: {
    backgroundColor: '#DC2626',
  },
  stockText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inStockLabel: {
    color: '#16A34A',
  },
  outOfStockLabel: {
    color: '#DC2626',
  },
  productName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1C1E',
    marginBottom: 12,
    lineHeight: 34,
  },
  priceRatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentPrice: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
  },
  originalPrice: {
    fontSize: 16,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    color: '#92400E',
    fontSize: 14,
    fontWeight: '700',
  },
  ratingCount: {
    color: '#94A3B8',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '400',
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1C1E',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 4,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1C1E',
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1C1E',
    marginHorizontal: 20,
  },
  metaSection: {
    backgroundColor: '#F8F9FB',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaTextWrapper: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    color: '#94A3B8',
    textTransform: 'uppercase',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 15,
    color: '#1A1C1E',
    fontWeight: '600',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  footerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 20,
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  disabledBtn: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
})

