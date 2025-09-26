// onboardingStore.ts
import { makeAutoObservable, runInAction } from "mobx";
import AsyncStorage from "@react-native-async-storage/async-storage";

class OnboardingStore {
  hasSeenOnboarding: boolean | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadOnboardingState();
  }

  async loadOnboardingState() {
    const value = await AsyncStorage.getItem("hasSeenOnboarding");
    runInAction(() => {
      this.hasSeenOnboarding = value === "true";
    });
  }

  async completeOnboarding() {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    runInAction(() => {
      this.hasSeenOnboarding = true;
    });
  }
}

export const onboardingStore = new OnboardingStore();