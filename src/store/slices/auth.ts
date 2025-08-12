import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { LoginResponse, UserData, Achievement, Education, Experience } from '../../types/auth';
import { User } from '../../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Performance {
  _id: string;
  athlete?: string;
  description: string;
  visibility: string;
  image: string;
  updatedAt: string;
  createdAt?: string;
  __v?: number;
}


interface AuthState {
  userData: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export class AuthStore implements AuthState {
  token: string | null = null;
  user: User | null = null;
  role: string | null = null;
  isLoading = false;
  refreshing = false;
  loadingMore = false;
  page = 1;
  hasMoreData = true;
  videos: Performance[] = [];
  error: string | null = null;
  userData: UserData | null = null;
  isAuthenticated = false;
  achievements: Achievement[] = [];

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async login(email: string, password: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/auth/login', { email, password });

      console.log(response)
      const result = response.data
      const statistic = result?.user?.statistic;
      // console.log('data: ', result)
      this.role = result.user.accountType;
      console.log('role', this.role)
      await AsyncStorage.setItem('userRole', this.role || '');
      
      this.token = result.token;
      this.isAuthenticated = true;
      
      // Persist tokens to AsyncStorage
      await AsyncStorage.setItem('authToken', result.token);
      if (result.refreshToken) {
        await AsyncStorage.setItem('refreshToken', result.refreshToken);
      }
      
      this.userData = {
        fullName: result?.user.name,
        email: result?.user.email,
        role: result?.user.accountType || '',
        userID: result?.user?._id,
        skill: result?.user?.skill,
        position: result?.user?.position,
        pushNotification: result?.user?.pushNotification,
        emailNotification: result?.user?.emailNotification,
        soundVibration: result?.user?.soundVibration,
        country: result?.user?.location?.country,
        city: result?.user?.location?.city,
        profileImg: result?.user?.profileImg,
        about: result?.user?.about,
        achievements: result?.user?.achievement || [],
        experience: result?.user?.experience || [],
        education: result?.user?.education || [],
        height: statistic?.height || '0',
        weight: statistic?.weight || '0',
        bodyFat: statistic?.bodyFat || '0',
        bmi: statistic?.bmi || '0',
        maxHeart: statistic?.maxHeight || '0',
        v02max: statistic?.v02max || '0',
        sprint: statistic?.sprint || '0',
        vertical: statistic?.vertical || '0',
        agility: statistic?.agility || '0',
        sports: result?.user?.sports || [],
        lookFor: result?.user?.lookFor || [],
      };
    } catch (error: any) {
      if (error.response?.data?.error?.[0]?.message) {
        this.error = error.response.data.error[0].message;
        console.log(error.response.data.error[0].message)
      } else if (error.error?.[0]?.message) {
        this.error = error.error[0].message;
        console.log(error.error[0].message)
      } else {
        this.error = 'An unexpected error occurred';
      }
      console.log(error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async register(data: {
    email: string;
    password: string;
    name: string;
    accountType: string;
  }) {
    try {
      this.isLoading = true;
      this.error = null;
      
      console.log('Registering with data:', data);
      const response = await apiClient.post<any>('/auth/signup', data);

      console.log(response)
    } catch (error: any) {
      console.log('Registration error response:', error.response?.data);
      if (error.response?.data?.error?.[0]?.message) {
        this.error = error.response.data.error[0].message;
        console.log(error.response.data.error[0].message)
      } else if (error.response?.data?.errors?.[0]?.msg) {
        this.error = error.response.data.errors[0].msg;
        console.log(error.response.data.errors[0].msg)
      } else if (error.error?.[0]?.message) {
        this.error = error.error[0].message;
        console.log(error.error[0].message)
      } else {
        this.error = 'An unexpected error occurred';
      }
      console.log(error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async verifyEmail(email: string, otp: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/auth/verify-email', { email, otp });

      console.log(response)
      const result = response.data
      
      this.token = result.token;
      this.user = result.user;
      // this.role = result.user.accountType;
    } catch (error: any) {
      this.error = error.message;
      console.log(error)
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/auth/resend-email', { email });

      console.log(response)
    } catch (error: any) {
      this.error = error.message;
      console.log(error)
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async forgetPassword(email: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/auth/forgot-password', { email });

      console.log(response)
      const result = response.data
      
    } catch (error: any) {
      this.error = error.error.message;
      console.log(error)
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async verifyOtp(email: string, otp: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/auth/verify-password-otp', { email, otp });

      console.log(response)
      const result = response.data
      
      this.token = result.token;
      this.user = result.user;
      // this.role = result.user.accountType;
      
      // Persist token to AsyncStorage
      await AsyncStorage.setItem('authToken', result.token);
    } catch (error: any) {
      this.error = error.message;
      console.log(error)
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async createPassword(email: string, password: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/auth/reset-password', { email, password });

      console.log(response)
      const result = response.data
      console.log('data: ', result)
      
      // this.token = result.token;
      // // this.user = result.user;
      // this.role = result.user.accountType;
      // this.userData = {
      //   fullName: result.user.name,
      //   email: result?.user.email,
      //   role: result?.user.accountType || '',
      //   token: result?.token,
      //   userID: result?.user.data?._id,
      //   // Add other relevant user data
      // };
    } catch (error: any) {
      if (error.response?.data?.error?.[0]?.message) {
        this.error = error.response.data.error[0].message;
        console.log(error.response.data.error[0].message)
      } else if (error.error?.[0]?.message) {
        this.error = error.error[0].message;
        console.log(error.error[0].message)
      } else {
        this.error = 'An unexpected error occurred';
      }
      console.log(error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async updateAbout (about: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Determine endpoint based on role
      const role = (this.role || this.userData?.role || '').toLowerCase();
      const endpoint = role === 'scout' ? '/scout/profile-about' : '/athlete/profile-about';
      const response = await apiClient.post<any>(endpoint, { about: about });

      if (response?.status && response.data?.data) {
        const userData = response.data.data;
        runInAction(() => {
          this.userData = {
            fullName: userData.name,
            email: userData.email,
            role: userData.accountType,
            userID: userData._id,
            skill: userData.skill,
            position: userData.position,
            pushNotification: userData.pushNotification,
            emailNotification: userData.emailNotification,
            soundVibration: userData.soundVibration,
            country: userData.location.country,
            city: userData.location.city,
            profileImg: userData.profileImg,
            about: userData.about,
            achievements: userData.achievement || [],
            experience: userData.experience || [],
            education: userData.education || []
          };
        });
      }
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Failed to update about';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async addBio (data: {
    name: string;
    skill: string;
    position: string;
    country: string;
    city: string;
  }) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/profile-bio', data);

      if (response?.status && response.data?.data) {
        const userData = response?.data.data;
        runInAction(() => {
          this.userData = {
            fullName: userData.name,
            email: userData.email,
            role: userData.accountType,
            userID: userData._id,
            skill: userData.skill,
            position: userData.position,
            pushNotification: userData.pushNotification,
            emailNotification: userData.emailNotification,
            soundVibration: userData.soundVibration,
            country: userData.location.country,
            city: userData.location.city,
            profileImg: userData.profileImg || '',
            about: userData.about || '',
            achievements: userData.achievement || [],
            experience: userData.experience || [],
            education: userData.education || [],
            sports: userData.sports || [],
            lookFor: userData.lookFor || [],
          };
        });
      }
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Failed to update bio';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async addAchievements (data: {
    title: string;
    sport: string;
    date: string;
    description: string;
  }) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/profile/add-achievement', data);

      if (response?.status && this.userData) {
        const newAchievement: Achievement = {
          _id: Date.now().toString(), // Temporary ID until backend provides one
          title: response.data.data.title,
          sport: response.data.data.sport,
          date: response.data.data.date,
          description: response.data.data.description
        };

        const currentUserData = this.userData;
        runInAction(() => {
          // Ensure we have all required fields from the existing userData
          this.userData = {
            fullName: currentUserData.fullName,
            email: currentUserData.email,
            role: currentUserData.role,
            userID: currentUserData.userID,
            skill: currentUserData.skill,
            position: currentUserData.position,
            pushNotification: currentUserData.pushNotification,
            emailNotification: currentUserData.emailNotification,
            soundVibration: currentUserData.soundVibration,
            country: currentUserData.country,
            city: currentUserData.city,
            profileImg: currentUserData.profileImg,
            about: currentUserData.about,
            achievements: [...(currentUserData.achievements || []), newAchievement],
            experience: currentUserData.experience || [],
            education: currentUserData.education || [],
            sports: currentUserData.sports || [],
            lookFor: currentUserData.lookFor || [],
          };
        });
      }
    } catch (error: any) {
      this.error = error.response?.data?.message || 'Failed to add achievement';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async addExperience (data: {
    title: string;
    sport: string;
    date: string;
    description: string;
  }) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/profile/add-experience', data);

      console.log(response)

      if (response?.status && this.userData) {
        const newExperience: Experience = {
          _id: Date.now().toString(), // Temporary ID until backend provides one
          title: response.data.data.title,
          sport: response.data.data.sport,
          date: response.data.data.date,
          description: response.data.data.description
        };

        const currentUserData = this.userData;
        runInAction(() => {
          // Ensure we have all required fields from the existing userData
          this.userData = {
            fullName: currentUserData.fullName,
            email: currentUserData.email,
            role: currentUserData.role,
            userID: currentUserData.userID,
            skill: currentUserData.skill,
            position: currentUserData.position,
            pushNotification: currentUserData.pushNotification,
            emailNotification: currentUserData.emailNotification,
            soundVibration: currentUserData.soundVibration,
            country: currentUserData.country,
            city: currentUserData.city,
            profileImg: currentUserData.profileImg,
            about: currentUserData.about,
            achievements: currentUserData.achievements || [],
            experience:  [...(currentUserData.experience || []), newExperience],
            education: currentUserData.education || []
          };
        });
      }

    } catch (error: any) {
      this.error = error.response
    } finally {
      this.isLoading = false
    }
  }

  async addEducation (data: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    description: string;
  }) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/profile/add-education', data);

      console.log(response)
      console.log(response?.status, this.userData)
      if (this.userData) {
        const newEducation: Education = {
          _id: Date.now().toString(), // Temporary ID until backend provides one
          school: response?.data.school,
          degree: response?.data.degree,
          field: response?.data.field,
          startDate: response?.data.startDate,
          endDate: response?.data.endDate,
          description: response.data.data.description
        };

        const currentUserData = this.userData;
        runInAction(() => {
          // Ensure we have all required fields from the existing userData
          this.userData = {
            fullName: currentUserData.fullName,
            email: currentUserData.email,
            role: currentUserData.role,
            userID: currentUserData.userID,
            skill: currentUserData.skill,
            position: currentUserData.position,
            pushNotification: currentUserData.pushNotification,
            emailNotification: currentUserData.emailNotification,
            soundVibration: currentUserData.soundVibration,
            country: currentUserData.country,
            city: currentUserData.city,
            profileImg: currentUserData.profileImg,
            about: currentUserData.about,
            achievements: currentUserData.achievements || [],
            experience:  currentUserData.experience || [],
            education: [...(currentUserData.education || []), newEducation]
          };
          console.log([...(currentUserData.education || []), newEducation])
        });
      }

    } catch (error: any) {
      this.error = error.response
    } finally {
      this.isLoading = false
    }
  }

  async addStatistics (data: {
    height: string;
    weight: string;
    bodyFat: string;
    BMI: string;
    maxHeight: string;
    v02Max: string;
    sprintSpeed: string;
    verticalJump: string;
    agility: string;
  }) {

    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/profile/add-statistic', data);
      if (response.data?.status && response.data?.data) {
        const userData = response?.data.data;
        runInAction(() => {
          this.userData = {
            fullName: userData.name,
            email: userData.email,
            role: userData.accountType,
            userID: userData._id,
            skill: userData.skill,
            position: userData.position,
            pushNotification: userData.pushNotification,
            emailNotification: userData.emailNotification,
            soundVibration: userData.soundVibration,
            country: userData.location.country,
            city: userData.location.city,
            profileImg: userData.profileImg || '',
            about: userData.about || '',
            achievements: userData?.achievement || [],
            experience: userData?.experience || [],
            education: userData?.education || [],
            height: userData?.statistic?.height,
            weight: userData?.statistic?.weight,
            bodyFat: userData?.statistic?.bodyFat,
            bmi: userData?.statistic?.BMI,
            maxHeart: userData?.statistic?.maxHeight,
            v02max: userData?.statistic?.v02Max,
            sprint: userData?.statistic?.sprintSpeed,
            vertical: userData?.statistic?.verticalJump,
            agility: userData?.statistic?.agility
          };
        });
      }

      console.log(response)
    } catch (error: any) {
      this.error = error.response
    }

  }

  async updateProfileImage (picture: FormData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/profile-img', picture, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status && response.data?.data) {
        const userData = response.data.data;
        runInAction(() => {
          if (this.userData) {
            this.userData.profileImg = userData.profileImg;
          }
        });
      }
    } catch (error: any) {
      this.error = error.response?.error?.message || 'Failed to update profile image';
      console.log(error?.response.error.message)
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async initializeAuth() {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userRole = await AsyncStorage.getItem('userRole');
      
      if (token) {
        this.token = token;
        this.isAuthenticated = true;
        this.role = userRole;
        
        // Verify token is still valid
        try {
          await this.verifyToken();
        } catch (error) {
          // Token is invalid, try to refresh
          if (refreshToken) {
            try {
              await this.refreshToken();
            } catch (refreshError) {
              // If refresh fails, logout
              await this.logout();
            }
          } else {
            // No refresh token, logout
            await this.logout();
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  async verifyToken() {
    try {
      // Make a simple API call to verify token
      await apiClient.get('/auth/verify');
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Token is invalid');
      }
      throw error;
    }
  }

  logout() {
    this.token = null;
    this.user = null;
    this.role = null;
    this.error = null;
    this.isAuthenticated = false;
    
    // Clear stored tokens
    AsyncStorage.removeItem('authToken');
    AsyncStorage.removeItem('refreshToken');
    AsyncStorage.removeItem('userRole');
  }

  async refreshToken() {
    try {
      this.isLoading = true;
      this.error = null;
      
      // Check if we have a refresh token stored
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiClient.post<any>('/auth/refresh', { refreshToken });
      
      this.token = response.token;
      this.user = response.user;
      this.role = response.user.role;
      
      // Persist tokens to AsyncStorage
      await AsyncStorage.setItem('authToken', response.token);
      if (response.refreshToken) {
        await AsyncStorage.setItem('refreshToken', response.refreshToken);
      }
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
} 