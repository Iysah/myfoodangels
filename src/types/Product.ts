export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  tags: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isFeatured?: boolean;
  options?: ProductOption[];
  specifications?: Record<string, string>;
  dimensions?: ProductDimensions;
  weight?: number; // in kg
  brand?: string;
  offers?: Offer[];
}

export interface ProductOption {
  name: string; // e.g., "Size", "Color"
  values: ProductOptionValue[];
}

export interface ProductOptionValue {
  value: string; // e.g., "Small", "Red"
  priceModifier?: number; // Additional price for this option
  stockCount?: number; // Stock for this specific option
  imageUrl?: string; // Image showing this option
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

export interface Offer {
  id: string;
  userId: string;
  productId: string;
  offeredPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  createdAt: Date;
  expiresAt: Date;
  message?: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  dislikes: number;
  isVerifiedPurchase: boolean;
}