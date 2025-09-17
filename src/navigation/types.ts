import { NavigatorScreenParams } from '@react-navigation/native';

// Auth Navigator Param List
export type AuthStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  PhoneLogin: undefined;
};

// Main Tab Navigator Param List
export type MainTabParamList = {
  Home: undefined;
  Viewed: undefined;
  TrackOrders: undefined;
  Profile: undefined;
};

// Root Navigator Param List
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
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
  Reviews: { productId: string };
  MakeOffer: { productId: string };
};

// Navigation Types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}