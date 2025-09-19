import { makeAutoObservable, runInAction } from 'mobx';
import { Wallet, Transaction, PaymentCard, TopUpRequest } from '../types';
import * as FirestoreService from '../services/firebase/firestore';
import PaystackService, { PaystackResponse } from '../services/paystack/PaystackService';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const constraints = [
        FirestoreService.createWhereConstraint('userId', '==', userId),
        FirestoreService.createLimitConstraint(1)
      ];
      
      const wallets = await FirestoreService.queryDocuments<Wallet>('wallets', constraints);
      
      if (wallets.length > 0) {
        runInAction(() => {
          this.wallet = wallets[0];
          this.isLoading = false;
        });
        return wallets[0];
      } else {
        // Create a new wallet if none exists
        const newWallet: Wallet = {
          id: '',
          userId,
          balance: 0,
          name: userName ?? 'User',
          email: userEmail ?? '',
          totalDeposit: 0,
          totalSpent: 0,
          currency: 'NGN',
          createdAt: new Date(),
          updatedAt: new Date(),
          transactions: [],
          cards: []
        };
        
        const walletId = await FirestoreService.addDocument('wallets', newWallet);
        const createdWallet = await FirestoreService.getDocument<Wallet>('wallets', walletId);
        
        runInAction(() => {
          this.wallet = createdWallet;
          this.isLoading = false;
        });
        
        return createdWallet;
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = `Error loading wallet data: ${error.message}`;
        this.isLoading = false;
      });
      console.error('Error fetching wallet:', error);
      throw error;
    }
  };

  // Fetch wallet transactions
  fetchTransactions = async (walletId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      // Simplified query to avoid composite index requirement
      const constraints = [
        FirestoreService.createWhereConstraint('walletId', '==', walletId),
        FirestoreService.createLimitConstraint(50) // Limit to recent 50 transactions
      ];
      
      const transactions = await FirestoreService.queryDocuments<Transaction>('transactions', constraints);
      
      // Sort transactions locally by createdAt desc
      const sortedTransactions = transactions.sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
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
    return this.paystackService.formatCurrency(this.wallet.balance, this.wallet.currency);
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
        currency: this.wallet.currency ?? 'NGN',
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

  // Complete top-up after successful payment
  completeTopUp = async (request: TopUpRequest, reference: string) => {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not found');
      }
      
      // Create a new transaction
      const transaction: Transaction = {
        id: '',
        walletId: request.walletId,
        amount: request.amount,
        type: 'deposit',
        status: 'completed',
        description: `Wallet top-up via ${request.paymentMethod}`,
        reference,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const transactionId = await FirestoreService.addDocument('transactions', transaction);
      
      // Update wallet balance
      const newBalance = this.wallet.balance + request.amount;
      
      await FirestoreService.updateDocument('wallets', this.wallet.id, {
        balance: newBalance,
        updatedAt: new Date()
      });
      
      runInAction(() => {
        if (this.wallet) {
          this.wallet.balance = newBalance;
          this.wallet.updatedAt = new Date();
        }
        
        // Add the new transaction to the list
        const newTransaction = {
          ...transaction,
          id: transactionId
        };
        
        this.transactions = [newTransaction, ...this.transactions];
      });
      
      return transactionId;
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
        balance: newBalance,
        updatedAt: new Date()
      };
      
      await FirestoreService.updateDocument('wallets', walletId, updateData);
      
      runInAction(() => {
        if (this.wallet && this.wallet.id === walletId) {
          this.wallet.balance = newBalance;
          this.wallet.updatedAt = new Date();
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
      if (!this.wallet || this.wallet.id !== walletId) {
        throw new Error('Wallet not found');
      }

      if (this.wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
      }

      // Create transaction record
      const transaction: Omit<Transaction, 'id'> = {
        walletId,
        amount: -amount, // Negative for payment
        type: 'payment',
        status: 'completed',
        description,
        reference: orderId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const transactionId = await FirestoreService.addDocument('transactions', transaction);
      
      // Update wallet balance
      const newBalance = this.wallet.balance - amount;
      await this.updateWalletBalance(walletId, newBalance);

      // Add transaction to local state
      const createdTransaction = await FirestoreService.getDocument<Transaction>('transactions', transactionId);
      if (createdTransaction) {
        runInAction(() => {
          this.transactions = [createdTransaction, ...this.transactions];
        });
      }

      return { success: true, transactionId, newBalance };
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };
}

// Export both the class and a default instance
export { WalletStore };
export default new WalletStore();