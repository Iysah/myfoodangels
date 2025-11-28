import { makeAutoObservable, runInAction } from 'mobx';
import { Product, FilterOptions, Review, Offer, Category } from '../types';
import * as FirestoreService from '../services/firebase/firestore';
// Firebase-only implementation

class ProductStore {
  products: Product[] = [];
  featuredProducts: Product[] = [];
  recentlyWishListProducts: Product[] = [];
  categories: Category[] = [];
  currentProduct: Product | null = null;
  isLoading: boolean = false;
  categoriesLoading: boolean = false;
  error: string | null = null;
  filters: FilterOptions = {};
  
  // Removed Loystar-specific product collections and loading states

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
      let clientSort: 'price_asc' | 'price_desc' | 'rating' | 'newest' | undefined;
      const hasCategoryFilter = !!filters?.category;
      
      if (filters?.category) {
        constraints.push(FirestoreService.createWhereConstraint('category.name', '==', filters.category));
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
        // To avoid Firestore composite index requirement, perform client-side sort
        // when a category filter is present.
        if (hasCategoryFilter) {
          clientSort = filters.sortBy;
        } else {
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
        }
      } else {
        // Default sorting
        if (hasCategoryFilter) {
          clientSort = 'newest';
        } else {
          constraints.push(FirestoreService.createOrderByConstraint('createdAt', 'desc'));
        }
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

      // Client-side sort fallback when a category filter is present
      if (clientSort) {
        const asTime = (val: any): number => {
          if (!val) return 0;
          if (val instanceof Date) return val.getTime();
          if (typeof val === 'number') return val;
          if (typeof val === 'string') {
            const t = new Date(val).getTime();
            return isNaN(t) ? 0 : t;
          }
          // Firestore Timestamp-like object
          if (typeof val === 'object' && 'seconds' in val) {
            return (val.seconds as number) * 1000;
          }
          return 0;
        };

        switch (clientSort) {
          case 'price_asc':
            filteredProducts = filteredProducts.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
            break;
          case 'price_desc':
            filteredProducts = filteredProducts.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
            break;
          case 'rating':
            filteredProducts = filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          case 'newest':
            filteredProducts = filteredProducts.sort((a, b) => asTime(b.created_date || b.createdAt) - asTime(a.created_date || a.createdAt));
            break;
        }
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
      // Simple query to get first 10 products
      const constraints = [
        FirestoreService.createLimitConstraint(10),
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
      console.error('Error fetching featured products:', error);
      throw error;
    }
  };

  fetchProductsByLoystarCategory = async (loystarCategoryId: number, categoryName?: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const limitConstraint = FirestoreService.createLimitConstraint(50);
      const constraints = [
        FirestoreService.createWhereConstraint('category.loystarId', '==', loystarCategoryId),
        limitConstraint,
      ];
      let products = await FirestoreService.queryDocuments<Product>('products', constraints);

      const asTime = (val: any): number => {
        if (!val) return 0;
        if (val instanceof Date) return val.getTime();
        if (typeof val === 'number') return val;
        if (typeof val === 'string') {
          const t = new Date(val).getTime();
          return isNaN(t) ? 0 : t;
        }
        if (typeof val === 'object' && 'seconds' in val) {
          return (val.seconds as number) * 1000;
        }
        return 0;
      };

      if (products.length > 0) {
        products = products.sort((a, b) => asTime(b.created_date || b.createdAt) - asTime(a.created_date || a.createdAt));
      }

      runInAction(() => {
        this.products = products;
        this.filters = categoryName ? { category: categoryName } : {};
        this.isLoading = false;
      });
      return products;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Fetch categories
  fetchCategories = async () => {
    this.categoriesLoading = true;
    this.error = null;
    try {
      // Simple query to get all categories
      const constraints = [
        FirestoreService.createLimitConstraint(20)
      ];
      
      const categories = await FirestoreService.queryDocuments<Category>('categories', constraints);
      
      runInAction(() => {
        this.categories = categories;
        this.categoriesLoading = false;
      });
      
      return categories;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.categoriesLoading = false;
      });
      console.error('Error fetching categories:', error);
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
        
        // Add to recently WishList if not already there
        if (product && !this.recentlyWishListProducts.some(p => p.id === product.id)) {
          this.recentlyWishListProducts = [
            product,
            ...this.recentlyWishListProducts.slice(0, 9) // Keep only 10 most recent
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
          (product.description || product.desc || '').toLowerCase().includes(lowerQuery) ||
          (product.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))
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
          ratingCount: reviews.length
        });
        
        runInAction(() => {
          if (this.currentProduct) {
            this.currentProduct.rating = newRating;
            this.currentProduct.ratingCount = reviews.length;
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

  // Removed Loystar-specific fetch methods

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