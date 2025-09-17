import { makeAutoObservable, runInAction } from 'mobx';
import { Order, OrderStatus, StatusUpdate } from '../types';
import * as FirestoreService from '../services/firebase/firestore';

class OrderStore {
  orders: Order[] = [];
  currentOrder: Order | null = null;
  isLoading: boolean = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  // Fetch user orders
  fetchUserOrders = async (userId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const constraints = [
        FirestoreService.createWhereConstraint('userId', '==', userId),
        FirestoreService.createOrderByConstraint('createdAt', 'desc')
      ];
      
      const orders = await FirestoreService.queryDocuments<Order>('orders', constraints);
      
      runInAction(() => {
        this.orders = orders;
        this.isLoading = false;
      });
      
      return orders;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Fetch a single order by ID
  fetchOrderById = async (orderId: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const order = await FirestoreService.getDocument<Order>('orders', orderId);
      
      runInAction(() => {
        this.currentOrder = order;
        this.isLoading = false;
      });
      
      return order;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Create a new order
  createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'statusHistory'>) => {
    this.isLoading = true;
    this.error = null;
    try {
      const statusUpdate: StatusUpdate = {
        status: 'pending',
        timestamp: new Date(),
        note: 'Order created'
      };
      
      const newOrder: Order = {
        ...order,
        id: '', // Will be set by Firestore
        createdAt: new Date(),
        updatedAt: new Date(),
        statusHistory: [statusUpdate]
      };
      
      const orderId = await FirestoreService.addDocument('orders', newOrder);
      
      // Get the created order
      const createdOrder = await FirestoreService.getDocument<Order>('orders', orderId);
      
      runInAction(() => {
        if (createdOrder) {
          this.orders = [createdOrder, ...this.orders];
          this.currentOrder = createdOrder;
        }
        this.isLoading = false;
      });
      
      return orderId;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Cancel an order
  cancelOrder = async (orderId: string, reason?: string) => {
    this.isLoading = true;
    this.error = null;
    try {
      const order = await FirestoreService.getDocument<Order>('orders', orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      if (order.status === 'delivered' || order.status === 'shipped') {
        throw new Error('Cannot cancel an order that has been shipped or delivered');
      }
      
      const statusUpdate: StatusUpdate = {
        status: 'cancelled',
        timestamp: new Date(),
        note: reason || 'Order cancelled by user'
      };
      
      const updatedStatusHistory = [...order.statusHistory, statusUpdate];
      
      await FirestoreService.updateDocument('orders', orderId, {
        status: 'cancelled',
        updatedAt: new Date(),
        statusHistory: updatedStatusHistory
      });
      
      runInAction(() => {
        // Update orders list
        this.orders = this.orders.map(o => {
          if (o.id === orderId) {
            return {
              ...o,
              status: 'cancelled',
              updatedAt: new Date(),
              statusHistory: updatedStatusHistory
            };
          }
          return o;
        });
        
        // Update current order if it's the one being cancelled
        if (this.currentOrder?.id === orderId) {
          this.currentOrder = {
            ...this.currentOrder,
            status: 'cancelled',
            updatedAt: new Date(),
            statusHistory: updatedStatusHistory
          };
        }
        
        this.isLoading = false;
      });
      
      return true;
    } catch (error: any) {
      runInAction(() => {
        this.error = error.message;
        this.isLoading = false;
      });
      throw error;
    }
  };

  // Clear current order
  clearCurrentOrder = () => {
    this.currentOrder = null;
  };
}

// Export both the class and a default instance
export { OrderStore };
export default new OrderStore();