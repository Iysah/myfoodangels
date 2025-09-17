import { makeAutoObservable, runInAction } from 'mobx';
import { User } from '../types';
import * as AuthService from '../services/firebase/auth';
import { auth } from '../services/firebase/config';
import { User as FirebaseUser } from 'firebase/auth';
import { LoystarAPI, LoystarAuthResponse } from '../services/loystar';

class AuthStore {
  user: User | null = null;
  isLoading: boolean = false;
  error: string | null = null;
  isAuthenticated: boolean = false;
  isGuest: boolean = false;
  loystarData: LoystarAuthResponse | null = null;
  loystarToken: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.initializeAuthState();
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
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          this.isAuthenticated = true;
        } else {
          this.user = null;
          this.isAuthenticated = false;
        }
        this.isLoading = false;
        this.error = null;
      });
    });

    return unsubscribe;
  };

  registerWithEmail = async (email: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const user = await AuthService.registerWithEmail(email, password);
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

  loginWithEmail = async (email: string, password: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      console.log('Starting login process for:', email);
      
      // First, authenticate with Firebase
      const user = await AuthService.loginWithEmail(email, password);
      console.log('Firebase login successful:', user);
      
      // Then, authenticate with Loystar using the email
      try {
        console.log('Attempting Loystar authentication...');
        const loystarResponse = await LoystarAPI.loginWithEmail(email);
        
        runInAction(() => {
          this.loystarData = loystarResponse;
          this.loystarToken = loystarResponse.token;
          this.isLoading = false;
        });
        
        console.log('Loystar authentication successful:', loystarResponse);
        console.log('Loystar token saved:', loystarResponse.token);
        
      } catch (loystarError: any) {
        console.warn('Loystar authentication failed, but Firebase login succeeded:', loystarError.message);
        // Don't fail the entire login if Loystar fails
        runInAction(() => {
          this.isLoading = false;
        });
      }
      
      return user;
    } catch (error: any) {
      console.error('Login failed:', error);
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
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
        this.isAuthenticated = false;
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

  // Register method (alias for registerWithEmail)
  register = async (email: string, password: string, additionalData?: { displayName?: string }) => {
    const user = await this.registerWithEmail(email, password);
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
      this.isAuthenticated = false;
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
    return !this.isAuthenticated;
  };
}

// Export both the class and a default instance
export { AuthStore };
export default new AuthStore();