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
  } catch (error: any) {
    console.error('Firebase Auth Registration Error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Firebase API key is invalid. Please check your Firebase project configuration.');
    } else if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email address already exists.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
};

export const loginWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error('Firebase Auth Error:', error);
    
    // Handle specific Firebase auth errors
    if (error.code === 'auth/api-key-not-valid') {
      throw new Error('Firebase API key is invalid. Please check your Firebase project configuration.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This user account has been disabled.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
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