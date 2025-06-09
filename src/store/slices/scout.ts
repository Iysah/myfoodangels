import { makeAutoObservable } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { ScoutProfile, AthleteProfile, SearchFilters } from '../../types/user';

export class ScoutStore {
  profile: ScoutProfile | null = null;
  searchResults: AthleteProfile[] = [];
  savedAthletes: AthleteProfile[] = [];
  singleAthlete: AthleteProfile | null = null;
  isLoading = false;
  refreshing = false;
  loadingMore = false;
  number = 10;
  error: string | null = null;

  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async fetchProfile() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<ScoutProfile>('/scout/profile');
      this.profile = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async updateProfile(data: Partial<ScoutProfile>) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.put<ScoutProfile>('/scout/profile', data);
      this.profile = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async searchAthletes(filters: SearchFilters) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<AthleteProfile[]>('/scout/search', { params: filters });
      this.searchResults = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchAthletes(number = 10) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<any>(`/scout/athletes?number=${number}`);
      this.savedAthletes = response?.data;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchSingleAthlete(athleteId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<any>(`/scout/athlete/${athleteId}`);
      this.singleAthlete = response?.data?.athlete.data;
      console.log(response?.data)
    } catch (error: any) {
      this.error = error.response?.error?.message || 'Failed to fetch athlete details';
      console.log(error?.response.error.message)
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchSavedAthletes() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<AthleteProfile[]>('/scout/saved-athletes');
      this.savedAthletes = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async saveAthlete(athleteId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      await apiClient.post(`/scout/saved-athletes/${athleteId}`);
      await this.fetchSingleAthlete(athleteId);
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async removeSavedAthlete(athleteId: string) {
    try {
      this.isLoading = true;
      this.error = null;
      
      await apiClient.delete(`/scout/saved-athletes/${athleteId}`);
      await this.fetchSavedAthletes();
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
