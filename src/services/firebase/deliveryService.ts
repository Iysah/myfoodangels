import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { firestore } from './config';
import { DeliveryLocation } from '../../types/Delivery';

export class DeliveryService {
  private static instance: DeliveryService;
  private deliveryLocationsCache: DeliveryLocation[] = [];
  private lastFetchTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): DeliveryService {
    if (!DeliveryService.instance) {
      DeliveryService.instance = new DeliveryService();
    }
    return DeliveryService.instance;
  }

  async getDeliveryLocations(): Promise<DeliveryLocation[]> {
    const now = Date.now();
    
    // Return cached data if it's still fresh
    if (this.deliveryLocationsCache.length > 0 && (now - this.lastFetchTime) < this.CACHE_DURATION) {
      return this.deliveryLocationsCache;
    }

    try {
      const locationsRef = collection(firestore, 'deliveryFee');
      const q = query(
        locationsRef,
        orderBy('location', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const locations: DeliveryLocation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        locations.push({
          id: doc.id,
          location: data.location,
          price: data.price,
          slug: data.slug,
          isActive: true, // Default to true since all documents in collection are active
          estimatedDeliveryTime: '30-45 minutes', // Default delivery time
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      });

      this.deliveryLocationsCache = locations;
      this.lastFetchTime = now;
      
      return locations;
    } catch (error) {
      console.error('Error fetching delivery locations:', error);
      throw new Error('Failed to fetch delivery locations');
    }
  }

  async getDeliveryLocationBySlug(slug: string): Promise<DeliveryLocation | null> {
    const locations = await this.getDeliveryLocations();
    return locations.find(location => location.slug === slug) || null;
  }

  clearCache(): void {
    this.deliveryLocationsCache = [];
    this.lastFetchTime = 0;
  }
}

export const deliveryService = DeliveryService.getInstance();