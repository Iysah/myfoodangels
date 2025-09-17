export interface User {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  address?: Address[];
  favoriteProducts?: string[];
  recentlyViewedProducts?: string[];
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

export interface NotificationSettings {
  orderUpdates: boolean;
  promotions: boolean;
  newProducts: boolean;
  priceDrops: boolean;
}