import { makeAutoObservable } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { ScoutProfile, AthleteProfile, SearchFilters } from '../../types/user';

export class ScoutStore {
  profile: ScoutProfile | null = null;
  searchResults: AthleteProfile[] = [];
  savedAthletes: AthleteProfile[] = [];
  singleAthlete: AthleteProfile | null = null;
  athletePerformance = null;
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
      
      console.log('Fetching scout profile...');
      const response = await apiClient.get<{ data: ScoutProfile }>('/scout/profile');
      console.log('Scout profile response:', response);
      console.log('Response data:', response.data);
      this.profile = response.data;
      console.log('Profile set to:', this.profile);
    } catch (error: any) {
      console.error('Error fetching scout profile:', error);
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
      
      const response = await apiClient.put<{ data: ScoutProfile; code: number; status: boolean }>('/scout/profile', data);
      this.profile = response.data;
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
      this.athletePerformance = response?.data.performance
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

  async updateProfileBio(data: {
    name: string;
    title: string;
    position: string;
    country: string;
    city: string;
  }) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.put<any>('/scout/profile-bio', data);
      return response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async updateProfileSports(newSports: string[]) {
    try {
      this.isLoading = true;
      this.error = null;
      console.log('newSports', newSports);
      const response = await apiClient.post<any>('/scout/profile/add-sports', {
        newSports
      });
      console.log('response', response);
      return response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async addLookFor(newLookFor: string[]) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/scout/profile/add-look-for', {
        newLookFor
      });
      return response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
