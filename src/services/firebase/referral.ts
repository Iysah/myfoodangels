import { 
  getDocument, 
  setDocument, 
  updateDocument, 
  queryDocuments, 
  createWhereConstraint,
  createTimestamp 
} from './firestore';
import { Timestamp } from 'firebase/firestore';

export interface ReferralData {
  id?: string;
  userId: string;
  referralCode: string;
  points: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  referredUsers?: string[]; // Array of user IDs who used this referral code
}

export interface ReferralTransaction {
  id?: string;
  referrerId: string; // User who owns the referral code
  referredUserId: string; // User who used the referral code
  pointsAwarded: number;
  createdAt: Timestamp;
}

/**
 * Generate a unique referral code
 */
const generateReferralCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Check if a referral code already exists
 */
const isReferralCodeUnique = async (code: string): Promise<boolean> => {
  try {
    const existingReferrals = await queryDocuments<ReferralData>(
      'referrals',
      [createWhereConstraint('referralCode', '==', code)]
    );
    return existingReferrals.length === 0;
  } catch (error) {
    console.error('Error checking referral code uniqueness:', error);
    return false;
  }
};

/**
 * Generate a unique referral code
 */
const generateUniqueReferralCode = async (): Promise<string> => {
  let code = generateReferralCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const isUnique = await isReferralCodeUnique(code);
    if (isUnique) {
      return code;
    }
    code = generateReferralCode();
    attempts++;
  }

  // If we can't generate a unique code after max attempts, use timestamp
  return `REF${Date.now().toString().slice(-6)}`;
};

/**
 * Get referral data for a user, create if doesn't exist
 */
export const getOrCreateReferral = async (userId: string): Promise<ReferralData> => {
  try {
    // First try to get existing referral data
    const existingReferral = await getDocument<ReferralData>('referrals', userId);
    
    if (existingReferral) {
      return existingReferral;
    }

    // Create new referral data if doesn't exist
    const referralCode = await generateUniqueReferralCode();
    const now = createTimestamp();
    
    const newReferralData: ReferralData = {
      userId,
      referralCode,
      points: 0,
      createdAt: now,
      updatedAt: now,
      referredUsers: []
    };

    await setDocument('referrals', userId, newReferralData);
    
    return {
      id: userId,
      ...newReferralData
    };
  } catch (error) {
    console.error('Error getting or creating referral:', error);
    throw error;
  }
};

/**
 * Get referral data by user ID
 */
export const getReferralData = async (userId: string): Promise<ReferralData | null> => {
  try {
    return await getDocument<ReferralData>('referrals', userId);
  } catch (error) {
    console.error('Error getting referral data:', error);
    throw error;
  }
};

/**
 * Update referral points
 */
export const updateReferralPoints = async (userId: string, points: number): Promise<void> => {
  try {
    await updateDocument('referrals', userId, {
      points,
      updatedAt: createTimestamp()
    });
  } catch (error) {
    console.error('Error updating referral points:', error);
    throw error;
  }
};

/**
 * Add points to referral account
 */
export const addReferralPoints = async (userId: string, pointsToAdd: number): Promise<void> => {
  try {
    const referralData = await getReferralData(userId);
    if (referralData) {
      const newPoints = referralData.points + pointsToAdd;
      await updateReferralPoints(userId, newPoints);
    }
  } catch (error) {
    console.error('Error adding referral points:', error);
    throw error;
  }
};

/**
 * Withdraw referral points (set to 0)
 */
export const withdrawReferralPoints = async (userId: string): Promise<number> => {
  try {
    const referralData = await getReferralData(userId);
    if (referralData) {
      const pointsWithdrawn = referralData.points;
      await updateReferralPoints(userId, 0);
      return pointsWithdrawn;
    }
    return 0;
  } catch (error) {
    console.error('Error withdrawing referral points:', error);
    throw error;
  }
};

/**
 * Process a referral (when someone uses a referral code)
 */
export const processReferral = async (
  referralCode: string, 
  newUserId: string, 
  pointsToAward: number = 10
): Promise<boolean> => {
  try {
    // Find the referrer by referral code
    const referrers = await queryDocuments<ReferralData>(
      'referrals',
      [createWhereConstraint('referralCode', '==', referralCode)]
    );

    if (referrers.length === 0) {
      throw new Error('Invalid referral code');
    }

    const referrer = referrers[0];
    
    // Check if the new user has already been referred by this code
    if (referrer.referredUsers?.includes(newUserId)) {
      throw new Error('User has already been referred by this code');
    }

    // Update referrer's points and referred users list
    const updatedReferredUsers = [...(referrer.referredUsers || []), newUserId];
    const newPoints = referrer.points + pointsToAward;

    await updateDocument('referrals', referrer.userId, {
      points: newPoints,
      referredUsers: updatedReferredUsers,
      updatedAt: createTimestamp()
    });

    // Create a referral transaction record
    const transaction: ReferralTransaction = {
      referrerId: referrer.userId,
      referredUserId: newUserId,
      pointsAwarded: pointsToAward,
      createdAt: createTimestamp()
    };

    await setDocument('referralTransactions', `${referrer.userId}_${newUserId}`, transaction);

    return true;
  } catch (error) {
    console.error('Error processing referral:', error);
    throw error;
  }
};

/**
 * Get referral transactions for a user
 */
export const getReferralTransactions = async (userId: string): Promise<ReferralTransaction[]> => {
  try {
    return await queryDocuments<ReferralTransaction>(
      'referralTransactions',
      [createWhereConstraint('referrerId', '==', userId)]
    );
  } catch (error) {
    console.error('Error getting referral transactions:', error);
    throw error;
  }
};

/**
 * Validate referral code format
 */
export const validateReferralCode = (code: string): boolean => {
  // Check if code is 8 characters long and contains only alphanumeric characters
  const regex = /^[A-Z0-9]{8}$/;
  return regex.test(code);
};