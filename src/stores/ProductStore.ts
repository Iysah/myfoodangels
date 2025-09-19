import { makeAutoObservable, runInAction } from 'mobx';
import { Product, FilterOptions, Review, Offer, Category } from '../types';
import * as FirestoreService from '../services/firebase/firestore';
import { LoystarAPI, LoystarProduct } from '../services/loystar';

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
  
  // Loystar Farm Offtake products
  farmOfftakeProducts: LoystarProduct[] = [];
  farmOfftakeLoading: boolean = false;
  farmOfftakeError: string | null = null;
  farmOfftakeMeta: any = null;
  
  // Loystar All Products (random 10 for home screen)
  allLoystarProducts: LoystarProduct[] = [];
  allProductsLoading: boolean = false;
  allProductsError: string | null = null;

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

  // Fetch Farm Offtake products from Loystar
  fetchFarmOfftakeProducts = async (page: number = 1, pageSize: number = 6) => {
    this.farmOfftakeLoading = true;
    this.farmOfftakeError = null;
    
    try {
      console.log('Fetching Farm Offtake products from Loystar...');
      const products: LoystarProduct[] = await LoystarAPI.fetchFarmOfftakeProducts(page, pageSize);
      
      runInAction(() => {
        if (page === 1) {
          // First page - replace products
          this.farmOfftakeProducts = products;
        } else {
          // Additional pages - append products
          this.farmOfftakeProducts = [...this.farmOfftakeProducts, ...products];
        }
        // Since the API doesn't return pagination meta, we'll handle it differently
        this.farmOfftakeMeta = {
          current_page: page,
          total_pages: products.length === pageSize ? page + 1 : page,
          total_count: this.farmOfftakeProducts.length,
          per_page: pageSize
        };
        this.farmOfftakeLoading = false;
        this.farmOfftakeError = null;
      });
      
      console.log('Farm Offtake products fetched successfully:', products.length, 'products');
      return products;
    } catch (error: any) {
      console.error('Error fetching Farm Offtake products:', error);
      runInAction(() => {
        this.farmOfftakeError = error.message || 'Failed to fetch Farm Offtake products';
        this.farmOfftakeLoading = false;
      });
      throw error;
    }
  };

  // Fetch all products from Loystar and get random 10 for home screen
  fetchAllLoystarProducts = async (pageSize: number = 50) => {
    this.allProductsLoading = true;
    this.allProductsError = null;
    
    try {
      console.log('Fetching all Loystar products for home screen...');
      
      // Fetch a larger set of products to choose random ones from
      const products = await LoystarAPI.fetchProducts(undefined, 1, pageSize);
      
      // Shuffle the array and take first 10
      const shuffled = [...products].sort(() => 0.5 - Math.random());
      const randomProducts = shuffled.slice(0, 10);
      
      runInAction(() => {
        this.allLoystarProducts = randomProducts;
        this.allProductsLoading = false;
        this.allProductsError = null;
      });
      
      console.log(`Fetched ${randomProducts.length} random products for home screen`);
      return randomProducts;
    } catch (error: any) {
      console.error('Error fetching all Loystar products:', error);
      runInAction(() => {
        this.allProductsError = error.message || 'Failed to fetch products';
        this.allProductsLoading = false;
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