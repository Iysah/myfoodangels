export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  statusHistory: StatusUpdate[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  options?: Record<string, string>; // e.g., {"Size": "Large", "Color": "Red"}
}

export type OrderStatus = 
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'refunded' 
  | 'on_hold';

export interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'wallet' | 'paypal' | 'apple_pay' | 'google_pay' | 'cash_on_delivery' | 'bank_transfer' | 'ussd';
  cardId?: string; // Reference to saved card
  walletId?: string; // Reference to wallet
  lastFour?: string; // Last four digits of card
  cardBrand?: string; // Visa, Mastercard, etc.
  bankCode?: string; // For bank transfer
  ussdCode?: string; // For USSD payments
}

export interface StatusUpdate {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
  location?: string;
}