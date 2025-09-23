import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  queryDocuments, 
  createWhereConstraint,
  createTimestamp 
} from './firestore';
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { firestore } from './config';
import { Timestamp } from 'firebase/firestore';

export interface WalletData {
  userId: string;
  email: string;
  name: string;
  balance: number;
  totalDeposit: number;
  totalSpent: number;
}

export interface TransactionData {
  amount: number;
  type: 'credit' | 'debit';
  date: Date;
  reference?: string;
  transId?: string;
  status: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  description?: string;
}

export interface NotificationData {
  message: string;
  type: string;
  date: Date;
  read: boolean;
  firstName?: string;
  lastName?: string;
  status?: string;
  email?: string;
}

/**
 * Format amount to Naira currency
 */
export const formatToNaira = (amount: number): string => {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

/**
 * Get or create wallet for a user
 */
export const getOrCreateWallet = async (
  userId: string, 
  email: string, 
  firstName?: string, 
  lastName?: string
): Promise<WalletData> => {
  try {
    const walletRef = doc(firestore, "wallets", userId);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      return walletSnap.data() as WalletData;
    } else {
      // Create a new wallet document if it doesn't exist
      const newWallet: WalletData = {
        userId,
        email,
        name: `${firstName || "User"} ${lastName || ""}`.trim(),
        balance: 0,
        totalDeposit: 0,
        totalSpent: 0,
      };

      await setDoc(walletRef, newWallet);
      return newWallet;
    }
  } catch (error) {
    console.error('Error getting or creating wallet:', error);
    throw error;
  }
};

/**
 * Update wallet balance and total deposit
 */
export const updateWalletBalance = async (
  userId: string,
  amount: number,
  isCredit: boolean = true
): Promise<void> => {
  try {
    const walletRef = doc(firestore, "wallets", userId);
    const walletSnap = await getDoc(walletRef);

    if (walletSnap.exists()) {
      const currentData = walletSnap.data() as WalletData;
      const updateData: Partial<WalletData> = {};

      if (isCredit) {
        updateData.balance = currentData.balance + amount;
        updateData.totalDeposit = (currentData.totalDeposit || 0) + amount;
      } else {
        updateData.balance = currentData.balance - amount;
        updateData.totalSpent = (currentData.totalSpent || 0) + amount;
      }

      await updateDoc(walletRef, updateData);
    } else {
      throw new Error('Wallet not found');
    }
  } catch (error) {
    console.error('Error updating wallet balance:', error);
    throw error;
  }
};

/**
 * Add transaction to user's transactions document
 */
export const addTransaction = async (
  userId: string,
  transaction: TransactionData
): Promise<void> => {
  try {
    const transactionsRef = doc(firestore, "transactions", userId);
    const transactionsSnap = await getDoc(transactionsRef);

    if (transactionsSnap.exists()) {
      // Add a new transaction to the transactions array
      await updateDoc(transactionsRef, {
        transactions: arrayUnion(transaction),
      });
    } else {
      // Create a new transactions document with the initial transaction
      await setDoc(transactionsRef, {
        userId,
        transactions: [transaction],
      });
    }
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

/**
 * Get user transactions
 */
export const getUserTransactions = async (userId: string): Promise<TransactionData[]> => {
  try {
    const transactionsRef = doc(firestore, "transactions", userId);
    const transactionsSnap = await getDoc(transactionsRef);

    if (transactionsSnap.exists()) {
      const data = transactionsSnap.data();
      return data.transactions || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

/**
 * Add notification to user's notifications document
 */
export const addNotification = async (
  userId: string,
  notification: NotificationData
): Promise<void> => {
  try {
    const notificationsRef = doc(firestore, "notifications", userId);
    const notificationsSnap = await getDoc(notificationsRef);

    if (notificationsSnap.exists()) {
      // Add a new notification to the notifications array
      await updateDoc(notificationsRef, {
        notifications: arrayUnion(notification),
      });
    } else {
      // Create a new notifications document with the initial notification
      await setDoc(notificationsRef, {
        userId,
        notifications: [notification],
      });
    }
  } catch (error) {
    console.error('Error adding notification:', error);
    throw error;
  }
};

/**
 * Process wallet credit (matches web app logic)
 */
export const processWalletCredit = async (
  userId: string,
  amount: number,
  email: string,
  firstName?: string,
  lastName?: string,
  reference?: string,
  transId?: string,
  status: string = 'success'
): Promise<void> => {
  try {
    if (status !== "success") {
      throw new Error("Payment failed");
    }

    // Update wallet balance and totalDeposit
    await updateWalletBalance(userId, amount, true);

    // Add transaction
    const transaction: TransactionData = {
      amount,
      type: "credit",
      date: new Date(),
      reference,
      transId,
      status,
      firstName: firstName || "User",
      lastName: lastName || "User",
      email,
      description: `Wallet credit of ${formatToNaira(amount)}`,
    };

    await addTransaction(userId, transaction);

    // Add notification
    const notification: NotificationData = {
      message: `Your wallet has been credited with ${formatToNaira(amount)}`,
      type: "wallet_credit",
      date: new Date(),
      read: false,
      firstName,
      lastName,
      status,
      email,
    };

    await addNotification(userId, notification);
  } catch (error) {
    console.error('Error processing wallet credit:', error);
    throw error;
  }
};

/**
 * Process wallet debit
 */
export const processWalletDebit = async (
  userId: string,
  amount: number,
  email: string,
  description: string,
  firstName?: string,
  lastName?: string,
  reference?: string
): Promise<void> => {
  try {
    // Update wallet balance and totalSpent
    await updateWalletBalance(userId, amount, false);

    // Add transaction
    const transaction: TransactionData = {
      amount,
      type: "debit",
      date: new Date(),
      reference,
      status: 'success',
      firstName: firstName || "User",
      lastName: lastName || "User",
      email,
      description,
    };

    await addTransaction(userId, transaction);

    // Add notification
    const notification: NotificationData = {
      message: `${formatToNaira(amount)} has been debited from your wallet for ${description}`,
      type: "wallet_debit",
      date: new Date(),
      read: false,
      firstName,
      lastName,
      status: 'success',
      email,
    };

    await addNotification(userId, notification);
  } catch (error) {
    console.error('Error processing wallet debit:', error);
    throw error;
  }
};