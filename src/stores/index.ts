// Export all stores
import authStore from './AuthStore';
import productStore from './ProductStore';
import cartStore from './CartStore';
import orderStore from './OrderStore';
import walletStore from './WalletStore';

// Create a root store object
const RootStore = {
  authStore,
  productStore,
  cartStore,
  orderStore,
  walletStore
};

export {
  authStore,
  productStore,
  cartStore,
  orderStore,
  walletStore,
  RootStore as default
};