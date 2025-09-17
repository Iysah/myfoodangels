import { makeAutoObservable, runInAction } from 'mobx';
import { Wallet, Transaction, PaymentCard, TopUpRequest } from '../types';
import * as FirestoreService from '../services/firebase/firestore';

class WalletStore {
  wallet: Wallet | null = null;
  transactions: Transaction[] = [];
  cards: PaymentCard[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Fetch user wallet
  fetchUserWallet = async (userId: string) => {
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
          currency: 'USD',
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
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Fetch wallet transactions
  fetchTransactions = async (walletId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const constraints = [
        FirestoreService.createWhereConstraint('walletId', '==', walletId),
        FirestoreService.createOrderByConstraint('createdAt', 'desc')
      ];
      
      const transactions = await FirestoreService.queryDocuments<Transaction>('transactions', constraints);
      
      runInAction(() => {
        this.transactions = transactions;
        this.isLoading = false;
      });
      
      return transactions;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
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

  // Top up wallet
  topUpWallet = async (request: TopUpRequest) => {
    this.isLoading = true;
    this.error = null;
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
        status: 'completed', // In a real app, this might be 'pending' until payment is processed
        description: `Top up via ${request.paymentMethod}`,
        reference: request.cardId,
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
        this.isLoading = false;
      });
      
      return transactionId;
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