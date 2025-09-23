import { makeAutoObservable, runInAction } from 'mobx';
import { Wallet, Transaction, PaymentCard, TopUpRequest } from '../types';
import * as FirestoreService from '../services/firebase/firestore';
import * as WalletService from '../services/firebase/wallet';
import PaystackService, { PaystackResponse } from '../services/paystack/PaystackService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../services/firebase/config';

class WalletStore {
  wallet: Wallet | null = null;
  transactions: Transaction[] = [];
  cards: PaymentCard[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  isBalanceVisible: boolean = true;
  isTopUpLoading: boolean = false;
  isCardLoading: boolean = false;
  
  private paystackService: PaystackService;

  constructor() {
    makeAutoObservable(this);
    this.paystackService = PaystackService.getInstance();
    this.loadBalanceVisibility();
  }

  // Fetch user wallet
  fetchUserWallet = async (userId: string, userEmail?: string, userName?: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      // Check if user is authenticated
      if (!auth.currentUser) {
        throw new Error('User must be authenticated to access wallet data');
      }

      // Verify the userId matches the authenticated user
      if (auth.currentUser.uid !== userId) {
        throw new Error('User ID mismatch - unauthorized access');
      }

      console.log('Fetching wallet for user:', userId);
      console.log('Current authenticated user:', auth.currentUser.uid);

      // Use the new Firebase wallet service
      const walletData = await WalletService.getOrCreateWallet(
        userId,
        userEmail || '',
        userName?.split(' ')[0],
        userName?.split(' ')[1]
      );
      
      // Convert WalletData to Wallet type
      const wallet: Wallet = {
        id: userId, // Use userId as the wallet ID
        userId: walletData.userId,
        balance: walletData.balance,
        name: walletData.name,
        email: walletData.email,
        totalDeposit: walletData.totalDeposit,
        totalSpent: walletData.totalSpent
      };
      
      runInAction(() => {
        this.wallet = wallet;
        this.isLoading = false;
        console.log("wallet fetched:", wallet);
      });
      
      return wallet;
    } catch (error: any) {
      runInAction(() => {
        this.error = `Error loading wallet data: ${error.message}`;
        this.isLoading = false;
      });
      console.error('Error fetching wallet:', error);
      throw error;
    }
  };

  // Helper function to safely convert various date formats to Date object
  private safeConvertToDate = (dateValue: any): Date => {
    if (!dateValue) {
      return new Date(); // Return current date if undefined/null
    }
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    // Handle Firestore Timestamp
    if (dateValue && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    // Handle timestamp objects with seconds property
    if (dateValue && typeof dateValue.seconds === 'number') {
      return new Date(dateValue.seconds * 1000);
    }
    
    // Try to parse as string or number
    const parsedDate = new Date(dateValue);
    return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  };

  // Fetch wallet transactions
  fetchTransactions = async (userId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      // Use the new Firebase wallet service to get transactions
      const transactionData = await WalletService.getUserTransactions(userId);
      
      // Convert TransactionData to Transaction type
       const transactions: Transaction[] = transactionData.map((tx, index) => {
           const safeDate = this.safeConvertToDate(tx.date);
           return {
             id: `${userId}_${index}_${safeDate.getTime()}`, // Generate unique ID with safe date
             userId,
             amount: tx.amount,
             type: tx.type === 'credit' ? 'deposit' : 'payment', // Map to existing types
             description: tx.description || `${tx.type === 'credit' ? 'Deposit' : 'Payment'} of ₦${tx.amount}`,
             status: (tx.status === 'success' ? 'completed' : tx.status) as 'Success' | 'Failed' | 'pending' | 'completed' | 'failed' | 'cancelled',
             reference: tx.reference || undefined,
             date: safeDate,
             createdAt: safeDate,
             updatedAt: safeDate
           };
         });
      
      // Sort transactions locally by date desc
      const sortedTransactions = transactions.sort((a, b) => {
        // Handle both 'date' and 'createdAt' fields for compatibility
        const dateA = a.date ? (a.date instanceof Date ? a.date : new Date(a.date)) : 
                     (a.createdAt ? (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)) : new Date());
        const dateB = b.date ? (b.date instanceof Date ? b.date : new Date(b.date)) : 
                     (b.createdAt ? (b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt)) : new Date());
        return dateB.getTime() - dateA.getTime();
      });
      
      runInAction(() => {
        this.transactions = sortedTransactions;
        this.isLoading = false;
      });
      
      return sortedTransactions;
    } catch (error: any) {
      runInAction(() => {
        this.error = `Error loading transactions: ${error.message}`;
        this.isLoading = false;
      });
      console.error('Error fetching transactions:', error);
      throw error;
    }
  };

  // Fetch user payment cards
  fetchPaymentCards = async (userId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const constraints = [
        FirestoreService.createWhereConstraint('userId', '==', userId),
        FirestoreService.createOrderByConstraint('createdAt', 'desc')
      ];
      
      const cards = await FirestoreService.queryDocuments<PaymentCard>('paymentCards', constraints);
      
      runInAction(() => {
        this.cards = cards;
        this.isLoading = false;
      });
      
      return cards;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Add a payment card
  addPaymentCard = async (card: Omit<PaymentCard, 'id' | 'createdAt' | 'updatedAt'>) => {
    this.isLoading = true;
    this.error = null;
    try {
      const newCard: PaymentCard = {
        ...card,
        id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const cardId = await FirestoreService.addDocument('paymentCards', newCard);
      const createdCard = await FirestoreService.getDocument<PaymentCard>('paymentCards', cardId);
      
      runInAction(() => {
        if (createdCard) {
          this.cards = [createdCard, ...this.cards];
          
          // If this is the default card, update other cards
          if (createdCard.isDefault) {
            this.cards = this.cards.map(c => {
              if (c.id !== createdCard.id) {
                return { ...c, isDefault: false };
              }
              return c;
            });
          }
        }
        this.isLoading = false;
      });
      
      return cardId;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Remove a payment card
  removePaymentCard = async (cardId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      await FirestoreService.deleteDocument('paymentCards', cardId);
      
      runInAction(() => {
        this.cards = this.cards.filter(card => card.id !== cardId);
        this.isLoading = false;
      });
      
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Set default payment card
  setDefaultCard = async (cardId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      // Update the selected card to be default
      await FirestoreService.updateDocument('paymentCards', cardId, {
        isDefault: true,
        updatedAt: new Date()
      });
      
      // Update all other cards to not be default
      const otherCards = this.cards.filter(card => card.id !== cardId);
      
      for (const card of otherCards) {
        if (card.isDefault) {
          await FirestoreService.updateDocument('paymentCards', card.id, {
            isDefault: false,
            updatedAt: new Date()
          });
        }
      }
      
      runInAction(() => {
        this.cards = this.cards.map(card => {
          if (card.id === cardId) {
            return { ...card, isDefault: true, updatedAt: new Date() };
          } else {
            return { ...card, isDefault: false, updatedAt: new Date() };
          }
        });
        this.isLoading = false;
      });
      
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Load balance visibility preference from storage
  loadBalanceVisibility = async () => {
    try {
      const visibility = await AsyncStorage.getItem('wallet_balance_visible');
      runInAction(() => {
        this.isBalanceVisible = visibility !== 'false';
      });
    } catch (error) {
      console.error('Error loading balance visibility:', error);
    }
  };

  // Toggle balance visibility
  toggleBalanceVisibility = async () => {
    try {
      const newVisibility = !this.isBalanceVisible;
      await AsyncStorage.setItem('wallet_balance_visible', newVisibility.toString());
      runInAction(() => {
        this.isBalanceVisible = newVisibility;
      });
    } catch (error) {
      console.error('Error saving balance visibility:', error);
    }
  };

  // Get formatted balance for display
  getDisplayBalance = (): string => {
    if (!this.wallet) return '₦0.00';
    if (!this.isBalanceVisible) return '****';
    return this.paystackService.formatCurrency(this.wallet.balance, 'NGN');
  };

  // Process Paystack top-up
  processPaystackTopUp = async (
    amount: number,
    userEmail: string,
    onSuccess: (response: PaystackResponse) => void,
    onCancel: () => void,
    onError: (error: any) => void
  ) => {
    this.isTopUpLoading = true;
    this.error = null;
    
    try {
      if (!this.wallet) {
        throw new Error('Wallet not found');
      }

      if (!this.paystackService.validateAmount(amount)) {
        throw new Error('Invalid amount. Minimum amount is ₦1.00');
      }

      const topUpRequest: TopUpRequest = {
        walletId: this.wallet.id,
        amount,
        paymentMethod: 'card',
        currency: 'NGN',
      };

      const paymentData = await this.paystackService.processWalletTopUp(
        topUpRequest,
        userEmail,
        async (response: PaystackResponse) => {
          try {
            // Verify the transaction
            const verification = await this.paystackService.verifyTransaction(
              response.reference || response.trxref || ''
            );

            if (verification.status && verification.data?.status === 'success') {
              // Update wallet balance
              await this.completeTopUp(topUpRequest, response.reference || response.trxref || '');
              onSuccess(response);
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            onError(error);
          } finally {
            runInAction(() => {
              this.isTopUpLoading = false;
            });
          }
        },
        () => {
          runInAction(() => {
            this.isTopUpLoading = false;
          });
          onCancel();
        },
        (error) => {
          runInAction(() => {
            this.isTopUpLoading = false;
            this.error = error.message || 'Payment failed';
          });
          onError(error);
        }
      );

      return paymentData;
    } catch (error: any) {
      runInAction(() => {
        this.isTopUpLoading = false;
        this.error = error.message;
      });
      onError(error);
      throw error;
    }
  };

  // Helper function to extract firstName and lastName from displayName
  private extractNames = (displayName?: string): { firstName: string; lastName: string } => {
    if (!displayName) {
      return { firstName: 'User', lastName: 'User' };
    }
    
    const names = displayName.trim().split(' ');
    const firstName = names[0] || 'User';
    const lastName = names.length > 1 ? names.slice(1).join(' ') : 'User';
    
    return { firstName, lastName };
  };

  // Complete top-up after successful payment
  completeTopUp = async (request: TopUpRequest, reference: string, status: string = 'success') => {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not found');
      }

      // Validate payment status (matching web app logic)
      if (status !== "success") {
        throw new Error("Payment failed");
      }

      // Extract firstName and lastName from user's displayName
      const { firstName, lastName } = this.extractNames(this.wallet.name);
      
      // Use the new Firebase wallet service for credit operation
      await WalletService.processWalletCredit(
        this.wallet.userId,
        request.amount,
        this.wallet.email,
        firstName,
        lastName,
        reference,
        reference, // transId
        status
      );
      
      // Refresh wallet and transactions data
      await this.fetchUserWallet(this.wallet.userId);
      await this.fetchTransactions(this.wallet.userId);
      
      return reference;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      throw error;
    }
  };

  // Check if wallet has sufficient balance
  hasSufficientBalance = (amount: number): boolean => {
    return this.wallet ? this.wallet.balance >= amount : false;
  };

  // Get default payment card
  getDefaultCard = (): PaymentCard | null => {
    return this.cards.find(card => card.isDefault) || null;
  };

  // Clear error
  clearError = () => {
    runInAction(() => {
      this.error = null;
    });
  };

  // Top up wallet (legacy method for backward compatibility)
  topUpWallet = async (request: TopUpRequest) => {
    return this.completeTopUp(request, `manual_${Date.now()}`);
  };

  // Update wallet balance
  updateWalletBalance = async (walletId: string, newBalance: number) => {
    this.isLoading = true;
    this.error = null;
    try {
      const updateData = {
        balance: newBalance
      };
      
      await FirestoreService.updateDocument('wallets', walletId, updateData);
      
      runInAction(() => {
        if (this.wallet && this.wallet.id === walletId) {
          this.wallet.balance = newBalance;
        }
        this.isLoading = false;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Process wallet payment for orders
  processWalletPayment = async (walletId: string, amount: number, orderId: string, description: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      if (!this.wallet || this.wallet.userId !== walletId) {
        throw new Error('Wallet not found');
      }

      if (this.wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Use the new Firebase wallet service for debit operation
      await WalletService.processWalletDebit(
        this.wallet.userId,
        amount,
        this.wallet.email,
        description,
        undefined, // firstName
        undefined, // lastName
        orderId // reference
      );

      // Refresh wallet and transactions data
      await this.fetchUserWallet(this.wallet.userId);
      await this.fetchTransactions(this.wallet.userId);

      runInAction(() => {
        this.isLoading = false;
      });

      return { success: true, newBalance: this.wallet?.balance || 0 };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Credit wallet using Firebase service (matches web app structure)
  creditWallet = async (
    userId: string,
    amount: number,
    email: string,
    reference?: string,
    transId?: string,
    firstName?: string,
    lastName?: string
  ) => {
    this.isLoading = true;
    this.error = null;
    try {
      await WalletService.processWalletCredit(
        userId,
        amount,
        email,
        firstName,
        lastName,
        reference,
        transId
      );

      // Refresh wallet and transactions data
      await this.fetchUserWallet(userId);
      await this.fetchTransactions(userId);

      runInAction(() => {
        this.isLoading = false;
      });

      return { success: true };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Debit wallet using Firebase service (matches web app structure)
  debitWallet = async (
    userId: string,
    amount: number,
    email: string,
    description: string,
    firstName?: string,
    lastName?: string,
    reference?: string
  ) => {
    this.isLoading = true;
    this.error = null;
    try {
      await WalletService.processWalletDebit(
        userId,
        amount,
        email,
        description,
        firstName,
        lastName,
        reference
      );

      // Refresh wallet and transactions data
      await this.fetchUserWallet(userId);
      await this.fetchTransactions(userId);

      runInAction(() => {
        this.isLoading = false;
      });

      return { success: true };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Helper method to check authentication status
  checkAuthStatus = () => {
    const user = auth.currentUser;
    console.log('Auth status:', {
      isAuthenticated: !!user,
      userId: user?.uid,
      email: user?.email,
      isAnonymous: user?.isAnonymous
    });
    return user;
  };
}

// Export both the class and a default instance
export { WalletStore };
export default new WalletStore();