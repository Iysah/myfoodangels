import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';
import { AthleteProfile, AthleteStats, Achievement, Video, SearchFilters, ScoutProfile } from '../../types/user';

export class AthleteStore {
  profile: AthleteProfile | null = null;
  stats: AthleteStats | null = null;
  searchResults: ScoutProfile[] = [];
  achievements: Achievement[] = [];
  videos: Video[] = [];
  refreshing = false;
  loadingMore = false;
  hasMoreData = true;
  page = 1;
  isLoading = false;
  error: string | null = null;

  constructor(rootStore: RootStore) {
    makeAutoObservable(this);
  }

  async fetchProfile() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<AthleteProfile>('/athlete/profile');
      this.profile = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async updateProfile(data: Partial<AthleteProfile>) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.put<AthleteProfile>('/athlete/profile', data);
      this.profile = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchMyPerfomance (pageNumber = 1, shouldRefresh = false) {
    if (shouldRefresh) {
      this.refreshing = true;
    } else if (pageNumber === 1) {
      this.isLoading = true;
    } else {
      this.loadingMore = true;
    }
    
    try {
      const response = await apiClient.get<any>(`/athlete/performance/ur?page=${pageNumber}&limit=10`);
      
      runInAction(() => {
        // Safely access performances, defaulting to an empty array if data.data or performances is missing
        const newVideos = response.data?.performances || [];

        // Check if we've reached the end of the data
        if (newVideos.length === 0) {
          this.hasMoreData = false;
        }
        
        // If refreshing or first page, replace the data
        // Otherwise append to existing data
        if (shouldRefresh || pageNumber === 1) {
          this.videos = newVideos;
          this.page = 1;
        } else {
          this.videos = [...this.videos, ...newVideos];
        }
        this.isLoading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      console.error('Error fetching perfomance videos:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
        this.refreshing = false;
        this.loadingMore = false;
      });
    }
  }

  async searchScouts(filters: SearchFilters) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<AthleteProfile[]>('/athlete/search', { params: filters });
      this.searchResults = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchStats() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<AthleteStats>('/athlete/stats');
      this.stats = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchAchievements() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<Achievement[]>('/athlete/achievements');
      this.achievements = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async fetchVideos() {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.get<Video[]>('/athlete/videos');
      this.videos = response;
    } catch (error: any) {
      this.error = error.message;
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async uploadVideo(data: FormData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/performance', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload Response:', response.data);
      // Assuming the response contains the new performance data, including the ID
      // We might need to adjust this based on the actual API response structure
      runInAction(() => {
        // This is a placeholder, you might want to update the videos list differently
        // based on how you manage it (e.g., refetching, prepending)
        // For now, we'll just return the relevant data.
      });

      return response.data; // Return the response data
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
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async applyForTrial(data: FormData) {
    try {
      this.isLoading = true;
      this.error = null;
      
      const response = await apiClient.post<any>('/athlete/trials/apply', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data?.status === 'success') {
        return response.data;
      } else {
        throw new Error(response.data?.message || 'Failed to apply for trial');
      }

    } catch (error: any) {
      this.error = error.response?.data?.message || error.message || 'Failed to apply for trial';
      throw error;
    } finally {
      this.isLoading = false;
    }
  }
}
