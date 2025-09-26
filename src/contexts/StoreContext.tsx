import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import authStoreInstance, { AuthStore } from '../stores/AuthStore';
import { ProductStore } from '../stores/ProductStore';
import { CartStore } from '../stores/CartStore';
import { OrderStore } from '../stores/OrderStore';
import walletStoreInstance, { WalletStore } from '../stores/WalletStore';
import { FAQStore } from '../stores/FAQStore';
import { WishlistStore } from '../stores/WishlistStore';
import { onboardingStore } from '../stores/OnboardingStore';

// Create store context
interface StoreContextType {
  authStore: AuthStore;
  productStore: ProductStore;
  cartStore: CartStore;
  orderStore: OrderStore;
  walletStore: WalletStore;
  faqStore: FAQStore;
  wishlistStore: WishlistStore;
  onboardingStore: typeof onboardingStore;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Store provider component
interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const stores = useMemo(() => ({
    authStore: authStoreInstance,
    productStore: new ProductStore(),
    cartStore: new CartStore(),
    orderStore: new OrderStore(),
    walletStore: walletStoreInstance,
    faqStore: new FAQStore(),
    wishlistStore: new WishlistStore(),
    onboardingStore: onboardingStore,
  }), []);

  return (
    <StoreContext.Provider value={stores}>
      {children}
    </StoreContext.Provider>
  );
};

// Custom hook to use stores
export const useStores = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;