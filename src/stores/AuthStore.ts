import { makeAutoObservable, runInAction } from 'mobx';
import { User, AddressDetails } from '../types';
import * as AuthService from '../services/firebase/auth';
import { auth } from '../services/firebase/config';
import { User as FirebaseUser } from 'firebase/auth';
import { updateDocument, setDocument, createTimestamp } from '../services/firebase/firestore';
import { uploadProfileImage } from '../services/firebase/storage';

class AuthStore {
  user: User | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isFirebaseAuthenticated: boolean = false;
  isGuest: boolean = false;
  // Removed Loystar-specific state

  constructor() {
    makeAutoObservable(this);
    this.initializeAuthState();
  }

  // Computed property: user is authenticated if Firebase auth succeeds and not guest
  get isAuthenticated(): boolean {
    return this.isFirebaseAuthenticated && !this.isGuest;
  }

  initializeAuthState = () => {
    this.isLoading = true;
    // Listen for auth state changes
    const unsubscribe = auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
      runInAction(() => {
        if (firebaseUser) {
          this.user = {
            id: firebaseUser.uid,
            email: firebaseUser.email || undefined,
            phoneNumber: firebaseUser.phoneNumber || undefined,
            displayName: firebaseUser.displayName || undefined,
            // firstName: firebaseUser?.firstName || undefined,
            // lastName: firebaseUser?.lastName || undefined,
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          this.isFirebaseAuthenticated = true;
        } else {
          this.user = null;
          this.isFirebaseAuthenticated = false;
        }
        this.isLoading = false;
        this.error = null;
      });
    });

    return unsubscribe;
  };

  registerWithEmail = async (
    email: string,
    password: string,
    additionalData?: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      sex?: string;
      addressLine1?: string;
      addressLine2?: string;
      postcode?: string;
      state?: string;
      country?: string;
    }
  ) => {
    this.isLoading = true;
    this.error = null;

    let firebaseUser: any = null;

    try {
      // Register with Firebase
      firebaseUser = await AuthService.registerWithEmail(email, password);
      return firebaseUser;
    } catch (error: any) {
      console.error('Registration error:', error);

      // If Firebase registration failed, no need to rollback
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
        this.isFirebaseAuthenticated = false;
        this.user = null;
      });

      throw error;
    }
  };

  loginWithEmail = async (email: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const user = await AuthService.loginWithEmail(email, password);
    } catch (error: any) {
      console.error('Login failed:', error);
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
        this.isFirebaseAuthenticated = false;
      });
      throw error;
    }
  };

  loginWithPhone = async (verificationId: string, verificationCode: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const user = await AuthService.verifyPhoneCode(verificationId, verificationCode);
      runInAction(() => {
        this.isLoading = false;
      });
      return user;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  loginWithGoogle = async () => {
    this.isLoading = true;
    this.error = null;
    try {
      const user = await AuthService.signInWithGoogle();
      runInAction(() => {
        this.isLoading = false;
      });
      return user;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  loginWithApple = async () => {
    this.isLoading = true;
    this.error = null;
    try {
      const user = await AuthService.signInWithApple();
      runInAction(() => {
        this.isLoading = false;
      });
      return user;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  logout = async () => {
    this.isLoading = true;
    this.error = null;
    try {
      await AuthService.logout();
      runInAction(() => {
        this.user = null;
        this.isFirebaseAuthenticated = false;
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

  // Removed Loystar helpers

  resetPassword = async (email: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      await AuthService.resetPassword(email);
      runInAction(() => {
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

  updateProfile = async (displayName?: string, photoURL?: string) => {
    if (!this.user) return;

    this.isLoading = true;
    this.error = null;
    try {
      const currentUser = AuthService.getCurrentUser();
      if (currentUser) {
        await AuthService.updateUserProfile(currentUser, displayName, photoURL);
        runInAction(() => {
          if (this.user) {
            this.user.displayName = displayName || this.user.displayName;
            this.user.photoURL = photoURL || this.user.photoURL;
            this.user.updatedAt = new Date();
          }
          this.isLoading = false;
        });
      }
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Comprehensive profile update method
  updateUserProfile = async (profileData: {
    displayName?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    photoURL?: string;
    addressDetails?: AddressDetails;
  }) => {
    if (!this.user) {
      throw new Error('No user found. Please log in again.');
    }

    this.isLoading = true;
    this.error = null;

    try {
      console.log('AuthStore: Starting profile update...');
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found.');
      }

      // Handle profile image upload if it's a local URI
      let finalPhotoURL = profileData.photoURL || this.user.photoURL;
      if (profileData.photoURL && (
        profileData.photoURL.startsWith('file://') ||
        profileData.photoURL.startsWith('content://') ||
        !profileData.photoURL.startsWith('http')
      )) {
        console.log('AuthStore: Uploading profile image...', profileData.photoURL);
        finalPhotoURL = await uploadProfileImage(this.user.id, profileData.photoURL);
        console.log('AuthStore: Upload successful, new photoURL:', finalPhotoURL);
      }

      // Update Firebase Auth profile (displayName and photoURL only)
      if (profileData.displayName || finalPhotoURL !== this.user.photoURL) {
        await AuthService.updateUserProfile(
          currentUser,
          profileData.displayName,
          finalPhotoURL
        );
      }

      console.log('AuthStore: Preparing Firestore data...');
      const userDataForFirestore = this.sanitizeData({
        id: this.user.id,
        email: this.user.email,
        displayName: profileData.displayName || this.user.displayName,
        firstName: profileData.firstName || this.user.firstName,
        lastName: profileData.lastName || this.user.lastName,
        phone: profileData.phone || this.user.phone,
        phoneNumber: this.user.phoneNumber, // Keep existing phoneNumber
        photoURL: finalPhotoURL,
        addressDetails: profileData.addressDetails || this.user.addressDetails,
        createdAt: this.user.createdAt,
        updatedAt: createTimestamp(),
        // Preserve existing fields
        address: this.user.address,
        favoriteProducts: this.user.favoriteProducts,
        recentlyWishListProducts: this.user.recentlyWishListProducts,
        notificationSettings: this.user.notificationSettings,
      });

      // Save to Firestore users collection
      console.log('AuthStore: Saving to Firestore...');
      await setDocument('users', this.user.id, userDataForFirestore);
      console.log('AuthStore: Firestore save complete.');

      // Update local user state
      runInAction(() => {
        if (this.user) {
          this.user.displayName = profileData.displayName || this.user.displayName;
          this.user.firstName = profileData.firstName || this.user.firstName;
          this.user.lastName = profileData.lastName || this.user.lastName;
          this.user.phone = profileData.phone || this.user.phone;
          this.user.photoURL = finalPhotoURL;
          this.user.addressDetails = profileData.addressDetails || this.user.addressDetails;
          this.user.updatedAt = new Date();
        }
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

  // Register method (alias for registerWithEmail)
  register = async (
    email: string,
    password: string,
    additionalData?: {
      displayName?: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      dateOfBirth?: string;
      sex?: string;
      addressLine1?: string;
      addressLine2?: string;
      postcode?: string;
      state?: string;
      country?: string;
    }
  ) => {
    const user = await this.registerWithEmail(email, password, additionalData);
    if (user) {
      // Use updateUserProfile to ensure data is saved to Firestore
      await this.updateUserProfile({
        displayName: additionalData?.displayName,
        firstName: additionalData?.firstName,
        lastName: additionalData?.lastName,
        phone: additionalData?.phoneNumber, // Mapping phoneNumber to phone
      });
    }
    return user;
  };

  // Check auth state method
  checkAuthState = async () => {
    // This is handled by initializeAuthState, but we need this method for the RootNavigator
    return new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });
  };

  // Send phone verification code
  sendPhoneVerificationCode = async (phoneNumber: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      // For React Native, we'll need to handle this differently
      // This is a simplified version - in a real app, you'd use Firebase Auth for React Native
      const verificationId = await AuthService.sendPhoneVerificationCode(phoneNumber);
      runInAction(() => {
        this.isLoading = false;
      });
      return verificationId;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Verify phone code
  verifyPhoneCode = async (verificationId: string, verificationCode: string) => {
    return this.loginWithPhone(verificationId, verificationCode);
  };

  // Guest mode methods
  enterGuestMode = () => {
    runInAction(() => {
      this.isGuest = true;
      this.isFirebaseAuthenticated = false;
      this.user = null;
      this.error = null;
    });
  };

  exitGuestMode = () => {
    runInAction(() => {
      this.isGuest = false;
    });
  };

  // Check if user can access feature (authenticated or guest for browsing)
  canAccessFeature = (feature: 'browse' | 'restricted') => {
    if (feature === 'browse') {
      return this.isAuthenticated || this.isGuest;
    }
    return this.isAuthenticated;
  };

  // Prompt authentication for restricted features
  requiresAuthentication = () => {
    return !this.isFirebaseAuthenticated;
  };

  /**
   * Helper to remove undefined values from an object before sending to Firestore
   * Handles nested objects and skips recursion for special types like Timestamps
   */
  private sanitizeData = (data: any): any => {
    if (data === null || data === undefined) return data;

    // Skip recursion for Dates and Firestore Timestamps
    if (data instanceof Date || (data.seconds !== undefined && data.nanoseconds !== undefined) || typeof data.toDate === 'function') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item));
    }

    if (typeof data === 'object') {
      const sanitized: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key];
        // Don't include undefined, but include null (Firestore supports null)
        if (value !== undefined) {
          // Only recurse if it's a plain object (not Date, Timestamp, etc.)
          if (typeof value === 'object' && value !== null && !(value instanceof Date) && !(value.seconds !== undefined && value.nanoseconds !== undefined) && typeof value.toDate !== 'function') {
            sanitized[key] = this.sanitizeData(value);
          } else {
            sanitized[key] = value;
          }
        }
      });
      return sanitized;
    }

    return data;
  };
}

// Export both the class and a default instance
export { AuthStore };
export default new AuthStore();