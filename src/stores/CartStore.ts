import { makeAutoObservable, runInAction } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedOptions?: Record<string, string>;
}

class CartStore {
  items: CartItem[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadCartFromStorage();
  }

  // Load cart from AsyncStorage
  loadCartFromStorage = async () => {
    try {
      this.isLoading = true;
      const cartData = await AsyncStorage.getItem('cart_items');
      if (cartData) {
        const parsedItems = JSON.parse(cartData);
        runInAction(() => {
          this.items = parsedItems;
        });
        console.log('Cart loaded from storage:', parsedItems.length, 'items');
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.error = 'Failed to load cart from storage';
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  // Save cart to AsyncStorage
  saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('cart_items', JSON.stringify(this.items));
      console.log('Cart saved to storage:', this.items.length, 'items');
    } catch (error) {
      console.error('Error saving cart to storage:', error);
      this.error = 'Failed to save cart to storage';
    }
  };

  // Add item to cart
  addItem = (product: Product, quantity: number = 1, selectedOptions?: Record<string, string>) => {
    // Check if item already exists in cart
    const existingItemIndex = this.items.findIndex(
      item => item.product.id === product.id && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );

    if (existingItemIndex >= 0) {
      // Update quantity if item exists
      const updatedItems = [...this.items];
      updatedItems[existingItemIndex].quantity += quantity;
      this.items = updatedItems;
    } else {
      // Add new item if it doesn't exist
      this.items.push({
        product,
        quantity,
        selectedOptions
      });
    }

    this.saveCartToStorage();
  };

  // Remove item from cart
  removeItem = (productId: string, selectedOptions?: Record<string, string>) => {
    this.items = this.items.filter(
      item => !(item.product.id === productId && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions))
    );
    this.saveCartToStorage();
  };

  // Update item quantity
  updateItemQuantity = (productId: string, quantity: number, selectedOptions?: Record<string, string>) => {
    const itemIndex = this.items.findIndex(
      item => item.product.id === productId && 
      JSON.stringify(item.selectedOptions) === JSON.stringify(selectedOptions)
    );

    if (itemIndex >= 0) {
      const updatedItems = [...this.items];
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        updatedItems.splice(itemIndex, 1);
      } else {
        // Update quantity
        updatedItems[itemIndex].quantity = quantity;
      }
      
      this.items = updatedItems;
      this.saveCartToStorage();
    }
  };

  // Clear cart
  clearCart = () => {
    this.items = [];
    this.saveCartToStorage();
  };

  // Get cart total
  get total(): number {
    return this.items.reduce((sum, item) => {
      const price = item.product.salePrice || item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  }

  // Get total number of items in cart
  get itemCount(): number {
    return this.items.reduce((count, item) => count + item.quantity, 0);
  }
}

// Export both the class and a default instance
export { CartStore };
export default new CartStore();