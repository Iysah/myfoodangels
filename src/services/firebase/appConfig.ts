import { getDocument, listenToDocument } from './firestore';
import { Timestamp } from 'firebase/firestore';

export interface AppConfig {
  id?: string;
  showSections: {
    FarmOffTakeAvailable: Timestamp;
    FlashSaleAvailable: Timestamp;
  };
  showFlashSales: boolean;
  showOfftakes: boolean;
}

// Default configuration
const defaultConfig: AppConfig = {
  showSections: {
    FarmOffTakeAvailable: Timestamp.fromDate(new Date('2025-08-21T00:00:00Z')),
    FlashSaleAvailable: Timestamp.fromDate(new Date('2025-08-21T00:00:00Z')),
  },
  showFlashSales: true,
  showOfftakes: true,
};

/**
 * Fetch app configuration from Firebase
 * @returns Promise<AppConfig>
 */
export const fetchAppConfig = async (): Promise<AppConfig> => {
  try {
    const config = await getDocument<AppConfig>('appConfig', 'main');
    return config || defaultConfig;
  } catch (error) {
    console.error('Error fetching app config:', error);
    return defaultConfig;
  }
};

/**
 * Listen to app configuration changes in real-time
 * @param callback Function to call when config changes
 * @returns Unsubscribe function
 */
export const listenToAppConfig = (callback: (config: AppConfig) => void) => {
  return listenToDocument<AppConfig>('appConfig', 'main', (config) => {
    callback(config || defaultConfig);
  });
};

/**
 * Check if Farm Offtake section should be visible
 * @param config App configuration
 * @returns boolean
 */
export const shouldShowFarmOfftake = (config: AppConfig): boolean => {
  if (!config.showOfftakes) return false;
  
  const now = new Date();
  const farmOfftakeDate = config.showSections.FarmOffTakeAvailable.toDate();
  
  return now >= farmOfftakeDate;
};

/**
 * Check if Flash Sales section should be visible
 * @param config App configuration
 * @returns boolean
 */
export const shouldShowFlashSales = (config: AppConfig): boolean => {
  if (!config.showFlashSales) return false;
  
  const now = new Date();
  const flashSaleDate = config.showSections.FlashSaleAvailable.toDate();
  
  return now >= flashSaleDate;
};