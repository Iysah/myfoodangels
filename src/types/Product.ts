import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export interface ProductUnit {
  unit: string;
  price: number;
  markedUpPrice: number;
  isDiscounted: boolean;
  image: string;
}

export interface ProductCategoryMap {
  id: string;
  loystarId: number;
  name: string;
  slug: string;
  desc: string;
  image: string;
}

export interface Product {
  id: string;
  name: string;
  desc: string; // Changed from description to desc to match user request, but keeping description for backward compat if needed? User asked for "desc". Let's check if I should keep description as alias or replace. The user provided model has "desc". Existing code uses "description". I will keep "description" as optional or check usages.
  // Wait, user provided:
  // "desc": "Beverage"
  // Existing: "description": string
  // I should probably map them or update usages.
  // Let's stick to the user's provided interface structure but keep existing fields if they seem critical and not replaced.
  // User provided:
  // export interface Product { ... desc: string ... }
  // I will add `desc` and `description` (optional) to avoid breaking everything immediately, or replace if I fix all usages.
  // The user explicitly gave a "Main Product Model". I should follow it.
  // However, I need to be careful about `created_date` vs `createdAt`.
  // User: created_date: FirebaseFirestoreTypes.Timestamp;
  // Existing: createdAt: Date;
  // I will add the new fields and keep the old ones if they are compatible, or replace if they conflict.
  // Actually, the user said "Create/Update the TypeScript interface".
  // I will implement the user's requested interface.

  created_date: FirebaseFirestoreTypes.Timestamp; 
  slug: string;
  image: string; // User has `image`, existing has `images: string[]`.
  
  price: number;
  costprice: number;
  minimumPrice: number;
  nameYourPrice: boolean;
  inStock: boolean;
  quantity: number;
  
  rating: number;
  ratingCount: number;

  category: ProductCategoryMap;
  units: ProductUnit[];
  
  // Keeping some existing fields that might be useful or used elsewhere until fully refactored, 
  // but marking them optional if they conflict or are replaced.
  // `stock` in existing is likely `quantity` or `inStock`.
  stock: number; // Keeping for compatibility with existing code that uses .stock
  
  // Existing fields that might still be needed:
  salePrice?: number;
  images?: string[]; // Keeping for compatibility
  description?: string; // Keeping for compatibility
  createdAt?: Date; // Keeping for compatibility
  updatedAt?: Date; // Keeping for compatibility
  isActive?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  reviews?: any[]; // Placeholder
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