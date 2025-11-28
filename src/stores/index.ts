// Export all stores
import authStore from './AuthStore';
import productStore from './ProductStore';
import cartStore from './CartStore';
import orderStore from './OrderStore';
import walletStore from './WalletStore';
import faqStore from './FAQStore';
import { WishlistStore } from './WishlistStore';

import notificationStore from './NotificationStore';

// Create wishlist store instance
const wishlistStore = new WishlistStore();

// Create a root store object
const RootStore = {
  authStore,
  productStore,
  cartStore,
  orderStore,
  walletStore,
  faqStore,
  wishlistStore,
  notificationStore
};

export {
  authStore,
  productStore,
  cartStore,
  orderStore,
  walletStore,
  faqStore,
  wishlistStore,
  notificationStore,
  RootStore as default
};