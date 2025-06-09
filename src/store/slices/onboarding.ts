// src/store/slices/onboarding.ts
import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStore } from '../root';
import { UserRole } from '../../types/user';

export class OnboardingStore {
  hasCompletedOnboarding = false;
  selectedRole: UserRole | null = null;
  profileData: any = {};
  isLoading = false;
  currentStep = 0;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
    this.loadOnboardingStatus();
  }

  async loadOnboardingStatus() {
    try {
      this.isLoading = true;
      const status = await AsyncStorage.getItem('onboardingCompleted');
      this.hasCompletedOnboarding = status === 'true';
    } catch (error) {
      console.error('Failed to load onboarding status:', error);
    } finally {
      this.isLoading = false;
    }
  }

  setRole(role: UserRole) {
    this.selectedRole = role;
    this.currentStep = 1;
  }

  updateProfileData(data: any) {
    this.profileData = { ...this.profileData, ...data };
    this.currentStep = 2;
  }

  async completeOnboarding() {
    try {
      this.isLoading = true;
      
      // Save onboarding status
      await AsyncStorage.setItem('onboardingCompleted', 'true');
      this.hasCompletedOnboarding = true;
      
      // Transfer role to auth store
      if (this.selectedRole) {
        this.rootStore.auth.role = this.selectedRole;
      }
      
      // Reset onboarding data
      this.currentStep = 0;
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    } finally {
      this.isLoading = false;
    }
  }
  
  resetOnboarding() {
    AsyncStorage.removeItem('onboardingCompleted');
    this.hasCompletedOnboarding = false;
    this.selectedRole = null;
    this.profileData = {};
    this.currentStep = 0;
  }
}