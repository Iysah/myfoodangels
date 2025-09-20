// Export all data models
export * from './Category';
export * from './Coupon';
export * from './Delivery';
export * from './FAQ';
export * from './Order';
export * from './Product';
export * from './User';
export * from './Wallet';

// Common types used across the application
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface FilterOptions {
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  tags?: string[];
  inStock?: boolean;
  onSale?: boolean;
}