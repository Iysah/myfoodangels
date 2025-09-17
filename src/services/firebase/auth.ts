import { auth } from './config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  PhoneAuthProvider,
  signInWithCredential,
  signOut,
  User,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  PhoneAuthCredential
} from 'firebase/auth';

// Email Authentication
export const registerWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Phone Authentication (React Native compatible)
export const sendPhoneVerificationCode = async (phoneNumber: string) => {
  try {
    // Note: In React Native, phone auth requires platform-specific implementation
    // This is a placeholder - implement with react-native-firebase or similar
    console.log('Phone verification not implemented for React Native');
    return 'placeholder-verification-id';
  } catch (error) {
    throw error;
  }
};

export const verifyPhoneCode = async (verificationId: string, verificationCode: string) => {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const userCredential = await signInWithCredential(auth, credential);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// Google Authentication (React Native compatible)
export const signInWithGoogle = async () => {
  try {
    // Note: In React Native, Google sign-in requires platform-specific implementation
    // This is a placeholder - implement with @react-native-google-signin/google-signin
    console.log('Google sign-in not implemented for React Native');
    throw new Error('Google sign-in not implemented');
  } catch (error) {
    throw error;
  }
};

export const signInWithApple = async () => {
  try {
    // Note: In React Native, Apple sign-in requires platform-specific implementation
    // This is a placeholder - implement with @invertase/react-native-apple-authentication
    console.log('Apple sign-in not implemented for React Native');
    throw new Error('Apple sign-in not implemented');
  } catch (error) {
    throw error;
  }
};

// User Profile
export const updateUserProfile = async (user: User, displayName?: string, photoURL?: string) => {
  try {
    await updateProfile(user, {
      displayName: displayName || user.displayName,
      photoURL: photoURL || user.photoURL
    });
    return user;
  } catch (error) {
    throw error;
  }
};

// Password Reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error) {
    throw error;
  }
};

export const confirmResetPassword = async (code: string, newPassword: string) => {
  try {
    await confirmPasswordReset(auth, code, newPassword);
    return true;
  } catch (error) {
    throw error;
  }
};

// Sign Out
export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    throw error;
  }
};

// Current User
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};