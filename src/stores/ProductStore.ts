import { makeAutoObservable, runInAction } from 'mobx';
import { Product, FilterOptions, Review, Offer } from '../types';
import * as FirestoreService from '../services/firebase/firestore';

class ProductStore {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  recentlyViewedProducts: Product[] = [];
  currentProduct: Product | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  filters: FilterOptions = {};

  constructor() {
    makeAutoObservable(this);
  }

  // Fetch all products with optional filtering
  fetchProducts = async (filters?: FilterOptions) => {
    this.isLoading = true;
    this.error = null;
    try {
      // Apply filters to query
      const constraints: any[] = [];
      
      if (filters?.category) {
        constraints.push(FirestoreService.createWhereConstraint('category', '==', filters.category));
      }
      
      if (filters?.inStock) {
        constraints.push(FirestoreService.createWhereConstraint('stock', '>', 0));
      }
      
      if (filters?.onSale) {
        constraints.push(FirestoreService.createWhereConstraint('salePrice', '!=', null));
      }
      
      if (filters?.rating) {
        constraints.push(FirestoreService.createWhereConstraint('rating', '>=', filters.rating));
      }
      
      // Add sorting
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            constraints.push(FirestoreService.createOrderByConstraint('price', 'asc'));
            break;
          case 'price_desc':
            constraints.push(FirestoreService.createOrderByConstraint('price', 'desc'));
            break;
          case 'rating':
            constraints.push(FirestoreService.createOrderByConstraint('rating', 'desc'));
            break;
          case 'newest':
            constraints.push(FirestoreService.createOrderByConstraint('createdAt', 'desc'));
            break;
        }
      } else {
        // Default sorting
        constraints.push(FirestoreService.createOrderByConstraint('createdAt', 'desc'));
      }
      
      // Limit results
      constraints.push(FirestoreService.createLimitConstraint(50));
      
      const products = await FirestoreService.queryDocuments<Product>('products', constraints);
      
      // Apply price range filter client-side (Firestore doesn't support range queries on multiple fields)
      let filteredProducts = products;
      if (filters?.priceRange) {
        filteredProducts = products.filter(product => {
          const price = product.salePrice || product.price;
          return price >= (filters.priceRange?.min || 0) && price <= (filters.priceRange?.max || Infinity);
        });
      }
      
      runInAction(() => {
        this.products = filteredProducts;
        this.filters = filters || {};
        this.isLoading = false;
      });
      
      return filteredProducts;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Fetch featured products
  fetchFeaturedProducts = async () => {
    this.isLoading = true;
    this.error = null;
    try {
      const constraints = [
        FirestoreService.createWhereConstraint('isFeatured', '==', true),
        FirestoreService.createOrderByConstraint('createdAt', 'desc'),
        FirestoreService.createLimitConstraint(10)
      ];
      
      const featuredProducts = await FirestoreService.queryDocuments<Product>('products', constraints);
      
      runInAction(() => {
        this.featuredProducts = featuredProducts;
        this.isLoading = false;
      });
      
      return featuredProducts;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Fetch a single product by ID
  fetchProductById = async (productId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const product = await FirestoreService.getDocument<Product>('products', productId);
      
      runInAction(() => {
        this.currentProduct = product;
        this.isLoading = false;
        
        // Add to recently viewed if not already there
        if (product && !this.recentlyViewedProducts.some(p => p.id === product.id)) {
          this.recentlyViewedProducts = [
            product,
            ...this.recentlyViewedProducts.slice(0, 9) // Keep only 10 most recent
          ];
        }
      });
      
      return product;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Search products by name or description
  searchProducts = async (query: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a simplified approach - in a real app, you might use Algolia or similar
      const constraints = [
        FirestoreService.createOrderByConstraint('name'),
        FirestoreService.createLimitConstraint(50)
      ];
      
      const allProducts = await FirestoreService.queryDocuments<Product>('products', constraints);
      
      // Client-side filtering
      const searchResults = allProducts.filter(product => {
        const lowerQuery = query.toLowerCase();
        return (
          product.name.toLowerCase().includes(lowerQuery) ||
          product.description.toLowerCase().includes(lowerQuery) ||
          product.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
        );
      });
      
      runInAction(() => {
        this.products = searchResults;
        this.isLoading = false;
      });
      
      return searchResults;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Submit a product review
  submitReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'likes' | 'dislikes'>) => {
    this.isLoading = true;
    this.error = null;
    try {
      const newReview: Review = {
        ...review,
        id: '', // Will be set by Firestore
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        dislikes: 0
      };
      
      const reviewId = await FirestoreService.addDocument('reviews', newReview);
      
      // Update product rating
      if (this.currentProduct) {
        // Fetch all reviews for this product
        const constraints = [
          FirestoreService.createWhereConstraint('productId', '==', review.productId),
        ];
        
        const reviews = await FirestoreService.queryDocuments<Review>('reviews', constraints);
        
        // Calculate new average rating
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const newRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        // Update product
        await FirestoreService.updateDocument('products', review.productId, {
          rating: newRating,
          reviewCount: reviews.length
        });
        
        runInAction(() => {
          if (this.currentProduct) {
            this.currentProduct.rating = newRating;
            this.currentProduct.reviewCount = reviews.length;
          }
        });
      }
      
      runInAction(() => {
        this.isLoading = false;
      });
      
      return reviewId;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Submit an offer for a product
  submitOffer = async (offer: Omit<Offer, 'id' | 'createdAt' | 'status'>) => {
    this.isLoading = true;
    this.error = null;
    try {
      const newOffer: Offer = {
        ...offer,
        id: '', // Will be set by Firestore
        createdAt: new Date(),
        status: 'pending'
      };
      
      const offerId = await FirestoreService.addDocument('offers', newOffer);
      
      runInAction(() => {
        this.isLoading = false;
      });
      
      return offerId;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Clear current product
  clearCurrentProduct = () => {
    this.currentProduct = null;
  };

  // Clear filters
  clearFilters = () => {
    this.filters = {};
  };
}

// Export both the class and a default instance
export { ProductStore };
export default new ProductStore();