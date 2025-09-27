import { PaymentCard, TopUpRequest } from '../../types';

export interface PaystackConfig {
  publicKey: string;
  secretKey?: string; // Only for server-side operations
}

export interface PaystackPaymentData {
  email: string;
  amount: number; // Amount in kobo (multiply by 100)
  currency?: string;
  reference?: string;
  metadata?: any;
  channels?: string[];
  callback_url?: string;
}

export interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any;
  reference?: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
}

export interface PaystackCardData {
  authorization_code: string;
  card_type: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  bin: string;
  bank: string;
  channel: string;
  signature: string;
  reusable: boolean;
  country_code: string;
  account_name?: string;
}

class PaystackService {
  private static instance: PaystackService;
  private config: PaystackConfig;

  private constructor() {
    this.config = {
      publicKey: process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_TEST_KEY || '',
      secretKey: process.env.EXPO_PUBLIC_PAYSTACK_SECRET_TEST_KEY || '',
    };

    if (!this.config.publicKey) {
      console.warn('Paystack public key not found in environment variables');
    }
  }

  public static getInstance(): PaystackService {
    if (!PaystackService.instance) {
      PaystackService.instance = new PaystackService();
    }
    return PaystackService.instance;
  }

  /**
   * Generate a unique payment reference
   */
  generateReference(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    return `mfa_${timestamp}_${random}`;
  }

  /**
   * Convert amount to kobo (Paystack uses kobo as the smallest unit)
   */
  convertToKobo(amount: number): number {
    return Math.round(amount / 100);
  }

  /**
   * Convert amount from kobo to naira
   */
  convertFromKobo(amount: number): number {
    return amount / 100;
  }

  /**
   * Prepare payment data for Paystack
   */
  preparePaymentData(
    email: string,
    amount: number,
    currency: string = 'NGN',
    reference?: string,
    metadata?: any
  ): PaystackPaymentData {
    return {
      email,
      amount: amount,
      currency,
      reference: reference || this.generateReference(),
      metadata: {
        ...metadata,
        custom_fields: [
          {
            display_name: 'Payment For',
            variable_name: 'payment_for',
            value: 'Wallet Top Up',
          },
        ],
      },
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    };
  }

  /**
   * Verify payment transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackResponse> {
    try {
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.config.secretKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying Paystack transaction:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Initialize a payment transaction
   */
  async initializeTransaction(paymentData: PaystackPaymentData): Promise<PaystackResponse> {
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error initializing Paystack transaction:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  /**
   * Process wallet top-up
   */
  async processWalletTopUp(
    topUpRequest: TopUpRequest,
    userEmail: string,
    onSuccess: (response: PaystackResponse) => void,
    onCancel: () => void,
    onError: (error: any) => void
  ): Promise<PaystackPaymentData> {
    try {
      const paymentData = this.preparePaymentData(
        userEmail,
        topUpRequest.amount,
        topUpRequest.currency,
        undefined,
        {
          wallet_id: topUpRequest.walletId,
          payment_type: 'wallet_topup',
          user_email: userEmail,
        }
      );

      return paymentData;
    } catch (error) {
      console.error('Error processing wallet top-up:', error);
      onError(error);
      throw error;
    }
  }

  /**
   * Save card authorization for future use
   */
  async saveCardAuthorization(
    userId: string,
    authorizationCode: string,
    cardData: PaystackCardData
  ): Promise<PaymentCard> {
    try {
      const paymentCard: PaymentCard = {
        id: '', // Will be set by Firestore
        userId,
        cardholderName: cardData.account_name || 'Card Holder',
        cardBrand: cardData.card_type,
        lastFourDigits: cardData.last4,
        expiryMonth: cardData.exp_month,
        expiryYear: cardData.exp_year,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return paymentCard;
    } catch (error) {
      console.error('Error saving card authorization:', error);
      throw error;
    }
  }

  /**
   * Charge a saved card
   */
  async chargeSavedCard(
    authorizationCode: string,
    email: string,
    amount: number,
    currency: string = 'NGN',
    reference?: string
  ): Promise<PaystackResponse> {
    try {
      const response = await fetch('https://api.paystack.co/transaction/charge_authorization', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authorization_code: authorizationCode,
          email,
          amount: this.convertToKobo(amount),
          currency,
          reference: reference || this.generateReference(),
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error charging saved card:', error);
      throw new Error('Failed to charge card');
    }
  }

  /**
   * Get Paystack public key
   */
  getPublicKey(): string {
    return this.config.publicKey;
  }

  /**
   * Validate payment amount
   */
  validateAmount(amount: number): boolean {
    return amount > 0 && amount >= 1; // Minimum 1 Naira
  }

  /**
   * Format currency for display
   */
  formatCurrency(amount: number, currency: string = 'NGN'): string {
    const formatter = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    });
    return formatter.format(amount);
  }

  /**
   * Get supported payment channels
   */
  getSupportedChannels(): string[] {
    return ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'];
  }

  /**
   * Check if Paystack is properly configured
   */
  isConfigured(): boolean {
    return !!this.config.publicKey;
  }
}

export default PaystackService;