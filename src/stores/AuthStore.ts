import { makeAutoObservable, runInAction } from 'mobx';
import { User, AddressDetails } from '../types';
import * as AuthService from '../services/firebase/auth';
import { auth } from '../services/firebase/config';
import { User as FirebaseUser } from 'firebase/auth';
import { LoystarAPI, LoystarAuthResponse, LoystarRegistrationRequest } from '../services/loystar';
import { updateDocument, setDocument, createTimestamp } from '../services/firebase/firestore';

class AuthStore {
  user: User | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isFirebaseAuthenticated: boolean = false;
  isLoystarAuthenticated: boolean = false;
  isGuest: boolean = false;
  loystarData: LoystarAuthResponse | null = null;
  loystarToken: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuthState();
  }

  // Computed property: user is only authenticated if both Firebase and Loystar auth succeed
  get isAuthenticated(): boolean {
    return this.isFirebaseAuthenticated && this.isLoystarAuthenticated && !this.isGuest;
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
          // Note: Loystar authentication status is maintained separately
        } else {
          this.user = null;
          this.isFirebaseAuthenticated = false;
          // Reset Loystar authentication when Firebase auth is lost
          this.isLoystarAuthenticated = false;
          this.loystarData = null;
          this.loystarToken = null;
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
    let loystarRegistered = false;
    
    try {
      console.log('Starting dual registration process for:', email);
      
      // First, register with Firebase
      firebaseUser = await AuthService.registerWithEmail(email, password);
      console.log('Firebase registration successful:', firebaseUser);
      
      // Then, register with Loystar using the provided data
      try {
        console.log('Attempting Loystar registration...');
        
        const loystarData: LoystarRegistrationRequest = {
          data: {
            first_name: additionalData?.firstName || '',
            last_name: additionalData?.lastName || '',
            email: email,
            phone_number: additionalData?.phoneNumber || '',
            date_of_birth: additionalData?.dateOfBirth || 'NIL',
            sex: additionalData?.sex || 'NIL',
            local_db_created_at: 'NIL',
            address_line1: additionalData?.addressLine1 || 'NIL',
            address_line2: additionalData?.addressLine2 || 'NIL',
            postcode: additionalData?.postcode ? parseInt(additionalData.postcode) : 0,
            state: additionalData?.state || 'NIL',
            country: additionalData?.country || 'NIL',
          }
        };
        
        const loystarResponse = await LoystarAPI.registerUser(loystarData);
        loystarRegistered = true;
        
        runInAction(() => {
          this.loystarData = loystarResponse;
          this.loystarToken = loystarResponse.token;
          this.isLoystarAuthenticated = true;
          this.isLoading = false;
        });
        
        console.log('Loystar registration successful:', loystarResponse);
        console.log('Loystar token saved:', loystarResponse.token);
        
        return firebaseUser;
        
      } catch (loystarError: any) {
        console.error('Loystar registration failed:', loystarError.message);
        
        // If Loystar registration fails, delete the Firebase user to maintain consistency
        if (firebaseUser) {
          try {
            await firebaseUser.delete();
            console.log('Firebase user deleted due to Loystar registration failure');
          } catch (deleteError) {
            console.error('Failed to delete Firebase user:', deleteError);
          }
        }
        
        runInAction(() => {
          this.error = `Registration failed: ${loystarError.message}`;
          this.isLoading = false;
          this.isFirebaseAuthenticated = false;
          this.isLoystarAuthenticated = false;
          this.user = null;
        });
        
        throw new Error(`Registration failed: Unable to create account on both systems. ${loystarError.message}`);
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // If Firebase registration failed, no need to rollback
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
        this.isFirebaseAuthenticated = false;
        this.isLoystarAuthenticated = false;
        this.user = null;
      });
      
      throw error;
    }
  };

  loginWithEmail = async (email: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      console.log('Starting login process for:', email);
      
      // First, authenticate with Firebase
      const user = await AuthService.loginWithEmail(email, password);
      console.log('Firebase login successful:', user);
      
      // Then, authenticate with Loystar using the email - BOTH must succeed
      try {
        console.log('Attempting Loystar authentication...');
        const loystarResponse = await LoystarAPI.loginWithEmail(email);
        
        runInAction(() => {
          this.loystarData = loystarResponse;
          this.loystarToken = loystarResponse.token;
          this.isFirebaseAuthenticated = true; // Set Firebase auth success
          this.isLoystarAuthenticated = true; // Set Loystar auth success
          this.isLoading = false;
        });
        
        console.log('Loystar authentication successful:', loystarResponse);
        console.log('Loystar token saved:', loystarResponse.token);
        
      } catch (loystarError: any) {
        console.error('Loystar authentication failed:', loystarError.message);
        // If Loystar fails, logout from Firebase and fail the entire login
        await AuthService.logout();
        runInAction(() => {
          this.error = `Authentication failed: ${loystarError.message}`;
          this.isLoading = false;
          this.isFirebaseAuthenticated = false;
          this.isLoystarAuthenticated = false;
          this.user = null;
        });
        throw new Error(`Complete authentication failed: ${loystarError.message}`);
      }
      
      return user;
    } catch (error: any) {
      console.error('Login failed:', error);
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
        this.isFirebaseAuthenticated = false;
        this.isLoystarAuthenticated = false;
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
        this.isLoystarAuthenticated = false;
        this.loystarData = null;
        this.loystarToken = null;
        this.isLoading = false;
      });
      // Clear Loystar token from the API class as well
      LoystarAPI.setAuthToken('');
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Method to get Loystar token for API calls
  getLoystarToken = (): string | null => {
    return this.loystarToken;
  };

  // Method to get Loystar customer data
  getLoystarCustomer = () => {
    return this.loystarData?.customer || null;
  };

  // Method to get Loystar user data
  getLoystarUser = () => {
    return this.loystarData?.user || null;
  };

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
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found.');
      }

      // Update Firebase Auth profile (displayName and photoURL only)
      if (profileData.displayName || profileData.photoURL) {
        await AuthService.updateUserProfile(
          currentUser, 
          profileData.displayName, 
          profileData.photoURL
        );
      }

      // Prepare user data for Firestore
      const userDataForFirestore = {
        id: this.user.id,
        email: this.user.email,
        displayName: profileData.displayName || this.user.displayName,
        firstName: profileData.firstName || this.user.firstName,
        lastName: profileData.lastName || this.user.lastName,
        phone: profileData.phone || this.user.phone,
        phoneNumber: this.user.phoneNumber, // Keep existing phoneNumber
        photoURL: profileData.photoURL || this.user.photoURL,
        addressDetails: profileData.addressDetails || this.user.addressDetails,
        createdAt: this.user.createdAt,
        updatedAt: createTimestamp(),
        // Preserve existing fields
        address: this.user.address,
        favoriteProducts: this.user.favoriteProducts,
        recentlyWishListProducts: this.user.recentlyWishListProducts,
        notificationSettings: this.user.notificationSettings,
      };

      // Save to Firestore users collection
      await setDocument('users', this.user.id, userDataForFirestore);

      // Update local user state
      runInAction(() => {
        if (this.user) {
          this.user.displayName = profileData.displayName || this.user.displayName;
          this.user.firstName = profileData.firstName || this.user.firstName;
          this.user.lastName = profileData.lastName || this.user.lastName;
          this.user.phone = profileData.phone || this.user.phone;
          this.user.photoURL = profileData.photoURL || this.user.photoURL;
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
    if (additionalData?.displayName && user) {
      await this.updateProfile(additionalData.displayName);
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
      this.isLoystarAuthenticated = false;
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
}

// Export both the class and a default instance
export { AuthStore };
export default new AuthStore();