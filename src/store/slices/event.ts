import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from '../root';
import { apiClient } from '../../services/apiClient';

export interface Event {
  _id: string;
  scout: string;
  name: string;
  trialType: string;
  organizerName: string;
  trialDate: string;
  registrationDeadline: string;
  location: string;
  eligibility: string;
  skillLevel: string;
  specificRequirement: string;
  trialFees: number;
  free: boolean;
  refoundPolicy: string;
  documentRequirement: string[];
  equipmentNeeded: string[];
  description: string;
  file: string;
  updatedAt: string;
  createdAt: string;
}

export class EventsStore {
  events: Event[] = [];
  currentEvent: Event | null = null;
  loading = false;
  refreshing = false;
  loadingMore = false;
  page = 1;
  hasMoreData = true;
  error: string | null = null;
  
  constructor(private rootStore: RootStore) {
    makeAutoObservable(this);
  }
  
  async fetchEvents(pageNumber = 1, shouldRefresh = false) {
    if (shouldRefresh) {
      this.refreshing = true;
    } else if (pageNumber === 1) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }
    
    try {
      // Use your existing API client
      const response = await apiClient.get<any>(`/athlete/trials?page=${pageNumber}&limit=10`);
      
      runInAction(() => {
        const newEvents = response.data.trials;

        console.log("trials:", newEvents)
        
        // Check if we've reached the end of the data
        if (newEvents.length === 0) {
          this.hasMoreData = false;
        }
        
        // If refreshing or first page, replace the data
        // Otherwise append to existing data
        if (shouldRefresh || pageNumber === 1) {
          this.events = newEvents;
          this.page = 1;
        } else {
          this.events = [...this.events, ...newEvents];
        }
        this.loading = false;
        this.error = null;
      });
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
      });
      console.error('Error fetching events:', error);
    } finally {
      runInAction(() => {
        this.loading = false;
        this.refreshing = false;
        this.loadingMore = false;
      });
    }
  }

  async fetchSingleEvent(trialId: string) {
    try {
      this.loading = true;
      this.error = null;
      
      const response = await apiClient.get<any>(`/athlete/trials/${trialId}`);
      
      runInAction(() => {
        this.currentEvent = response.data;
        this.loading = false;
      });
      console.log(response.data)
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.loading = false;
      });
      throw error;
    }
  }

  // async fetchMyEvents(pageNumber = 1, shouldRefresh = false) {
  //   if (shouldRefresh) {
  //     this.refreshing = true;
  //   } else if (pageNumber === 1) {
  //     this.loading = true;
  //   } else {
  //     this.loadingMore = true;
  //   }
    
  //   try {
  //     // Use your existing API client
  //     const response = await apiClient.get<any>(`/athlete/trials/activity?page=${pageNumber}&limit=20`);
      
  //     runInAction(() => {
  //       const newEvents = response.data.trials;

  //       console.log("My events:", newEvents)
        
  //       // Check if we've reached the end of the data
  //       if (newEvents.length === 0) {
  //         this.hasMoreData = false;
  //       }
        
  //       // If refreshing or first page, replace the data
  //       // Otherwise append to existing data
  //       if (shouldRefresh || pageNumber === 1) {
  //         this.events = newEvents;
  //         this.page = 1;
  //       } else {
  //         this.events = [...this.events, ...newEvents];
  //       }
  //       this.loading = false;
  //       this.error = null;
  //     });
  //   } catch (error: any) {
  //     runInAction(() => {
  //       this.error = error.message;
  //     });
  //     console.error('Error fetching events:', error);
  //   } finally {
  //     runInAction(() => {
  //       this.loading = false;
  //       this.refreshing = false;
  //       this.loadingMore = false;
  //     });
  //   }
  // }
  
  refresh() {
    if (!this.refreshing) {
      this.page = 1;
      this.hasMoreData = true;
      this.fetchEvents(1, true);
    }
  }
  
  loadMore() {
    if (this.hasMoreData && !this.loadingMore && !this.refreshing) {
      const nextPage = this.page + 1;
      this.page = nextPage;
      this.fetchEvents(nextPage);
    }
  }
}