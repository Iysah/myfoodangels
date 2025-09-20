// Export all stores
import authStore from './AuthStore';
import productStore from './ProductStore';
import cartStore from './CartStore';
import orderStore from './OrderStore';
import walletStore from './WalletStore';
import faqStore from './FAQStore';
import { WishlistStore } from './WishlistStore';

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
  wishlistStore
};

export {
  authStore,
  productStore,
  cartStore,
  orderStore,
  walletStore,
  faqStore,
  wishlistStore,
  RootStore as default
};