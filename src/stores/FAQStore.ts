import { makeAutoObservable, runInAction } from 'mobx';
import { FAQ } from '../types';
import * as FirestoreService from '../services/firebase/firestore';

class FAQStore {
  faqs: FAQ[] = [];
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Fetch all FAQs from Firestore
  fetchFAQs = async () => {
    this.isLoading = true;
    this.error = null;
    
    try {
      const faqsData = await FirestoreService.queryDocuments<FAQ>('faq', []);
      
      runInAction(() => {
        this.faqs = faqsData;
        this.isLoading = false;
      });
      
      return faqsData;
    } catch (error: any) {
      runInAction(() => {
        this.error = `Error loading FAQs: ${error.message}`;
        this.isLoading = false;
      });
      console.error('Error fetching FAQs:', error);
      throw error;
    }
  };

  // Clear error
  clearError = () => {
    runInAction(() => {
      this.error = null;
    });
  };

  // Get FAQ by slug
  getFAQBySlug = (slug: string): FAQ | undefined => {
    return this.faqs.find(faq => faq.slug === slug);
  };
}

export { FAQStore };
export default new FAQStore();