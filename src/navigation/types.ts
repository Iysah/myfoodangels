import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Navigator Param List
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: { returnTo?: { screen: string; params?: any } } | undefined;
  Register: { returnTo?: { screen: string; params?: any } } | undefined;
  ForgotPassword: undefined;
  PhoneLogin: undefined;
};

// Main Tab Navigator Param List
export type MainTabParamList = {
  Home: undefined;
  Wishlist: undefined;
  TrackOrders: undefined;
  Profile: undefined;
};

// Root Navigator Param List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Categories: undefined;
  Search: undefined;
  Products: { category: { id: string; name: string; loystarId: number; image?: string } };
  ProductDetails: { productId: string };
  Cart: undefined;
  Checkout: undefined;
  OrderConfirmation: { orderId: string };
  OrderDetails: { orderId: string };
  EditProfile: undefined;
  Wallet: undefined;
  AddCard: undefined;
  TopUp: undefined;
  Settings: undefined;
  Notifications: undefined;
  Likes: undefined;
  About: undefined;
  Refer: undefined;
  Faqs: undefined;
  Reviews: { productId: string };
  MakeOffer: { productId: string };
};

// Navigation Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}