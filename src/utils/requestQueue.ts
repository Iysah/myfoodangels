import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../services/apiClient';

const QUEUE_KEY = 'offline_request_queue';

export interface QueuedRequest {
  id: string;
  type: 'POST' | 'GET';
  url: string;
  data?: any;
  retries?: number;
}

export const addToQueue = async (request: QueuedRequest) => {
  const queue = await getQueue();
  queue.push(request);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getQueue = async (): Promise<QueuedRequest[]> => {
  const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
  return queueStr ? JSON.parse(queueStr) : [];
};

export const removeFromQueue = async (id: string) => {
  const queue = await getQueue();
  const newQueue = queue.filter((req) => req.id !== id);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(newQueue));
};

export const processQueue = async () => {
  const queue = await getQueue();
  for (const req of queue) {
    try {
      if (req.type === 'POST') {
        await apiClient.post(req.url, req.data);
      } else if (req.type === 'GET') {
        await apiClient.get(req.url);
      }
      await removeFromQueue(req.id);
    } catch (err) {
      // Exponential backoff: increase retries, requeue if not too many attempts
      req.retries = (req.retries || 0) + 1;
      if (req.retries < 5) {
        const delay = Math.pow(2, req.retries ?? 0) * 1000;
        await new Promise(res => setTimeout(res, delay));
      } else {
        // Give up after 5 tries
        await removeFromQueue(req.id);
      }
    }
  }
}; 