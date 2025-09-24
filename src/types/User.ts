export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  phone?: string; // Alternative phone field to match your data structure
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  address?: Address[];
  addressDetails?: AddressDetails; // Primary address details
  favoriteProducts?: string[];
  recentlyWishListProducts?: string[];
  notificationSettings?: NotificationSettings;
}

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  label?: 'home' | 'work' | 'other';
}

export interface AddressDetails {
  address: string;
  city: string;
  company?: string;
  country: string;
  state: string;
  zipcode?: string;
}

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
}