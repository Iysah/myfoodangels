export interface Wallet {
  id?: string;
  userId: string;
  balance: number;
  name: string;
  email: string;
  totalDeposit: number;
  totalSpent: number;
}

export interface Transaction {
  id: string;
  userId: string; // Changed from walletId to userId to match Firestore data
  amount: number;
  type: 'Credit' | 'Debit' | 'deposit' | 'withdrawal' | 'payment' | 'refund'; // Added Credit/Debit from your sample
  status: 'Success' | 'Failed' | 'pending' | 'completed' | 'failed' | 'cancelled'; // Added Success/Failed from your sample
  description?: string; // Made optional since it might not always be present
  reference?: string; // Order ID or other reference
  date: Date; // Changed from createdAt to date to match Firestore data
  createdAt?: Date; // Keep as optional for backward compatibility
  updatedAt?: Date; // Made optional
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