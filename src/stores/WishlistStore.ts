import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoystarProduct } from '../services/loystar/api';

export class WishlistStore {
  wishlistItems: LoystarProduct[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    this.loadWishlistFromStorage();
  }

  // Load wishlist from AsyncStorage
  loadWishlistFromStorage = async () => {
    try {
      this.isLoading = true;
      const storedWishlist = await AsyncStorage.getItem('wishlist');
      
      if (storedWishlist) {
        const parsedWishlist = JSON.parse(storedWishlist);
        runInAction(() => {
          this.wishlistItems = parsedWishlist;
        });
      }
    } catch (error) {
      console.error('Error loading wishlist from storage:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Save wishlist to AsyncStorage
  saveWishlistToStorage = async () => {
    try {
      await AsyncStorage.setItem('wishlist', JSON.stringify(this.wishlistItems));
    } catch (error) {
      console.error('Error saving wishlist to storage:', error);
    }
  };

  // Add item to wishlist
  addToWishlist = (product: LoystarProduct) => {
    const existingIndex = this.wishlistItems.findIndex(item => item.id === product.id);
    
    if (existingIndex === -1) {
      this.wishlistItems.push(product);
      this.saveWishlistToStorage();
    }
  };

  // Remove item from wishlist
  removeFromWishlist = (productId: number) => {
    this.wishlistItems = this.wishlistItems.filter(item => item.id !== productId);
    this.saveWishlistToStorage();
  };

  // Toggle item in wishlist
  toggleWishlistItem = (product: LoystarProduct) => {
    const existingIndex = this.wishlistItems.findIndex(item => item.id === product.id);
    
    if (existingIndex === -1) {
      this.addToWishlist(product);
    } else {
      this.removeFromWishlist(product.id);
    }
  };

  // Check if item is in wishlist
  isInWishlist = (productId: number): boolean => {
    return this.wishlistItems.some(item => item.id === productId);
  };

  // Get wishlist count
  get wishlistCount(): number {
    return this.wishlistItems.length;
  }

  // Clear entire wishlist
  clearWishlist = () => {
    this.wishlistItems = [];
    this.saveWishlistToStorage();
  };
}