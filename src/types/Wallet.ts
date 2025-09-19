export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency?: string;
  name: string;
  email: string;
  totalDeposit: number;
  totalSpent: number;
  createdAt?: Date;
  updatedAt?: Date;
  transactions?: Transaction[];
  cards?: PaymentCard[];
}

export interface Transaction {
  id: string;
  walletId: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  reference?: string; // Order ID or other reference
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentCard {
  id: string;
  userId: string;
  cardholderName: string;
  cardBrand: string; // Visa, Mastercard, etc.
  lastFourDigits: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  billingAddress?: BillingAddress;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TopUpRequest {
  walletId: string;
  amount: number;
  paymentMethod: 'card' | 'bank_transfer' | 'paypal';
  cardId?: string; // If payment method is card
  currency: string;
}