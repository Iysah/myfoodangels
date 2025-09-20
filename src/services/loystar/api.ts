import axios, { AxiosInstance, AxiosResponse } from 'axios';

const LOYSTAR_BASE_URL = process.env.EXPO_PUBLIC_LOYSTAR_BASE_URL;
const MERCHANT_ID = process.env.EXPO_PUBLIC_MERCHANT_ID;

export interface LoystarCustomer {
  id: number;
  user_id: number;
  merchant_id: number;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  token: string;
  date_of_birth: string;
  local_db_created_at: string | null;
  sex: string;
  deleted: boolean;
  address_line1: string;
  address_line2: string | null;
  postcode: string;
  state: string;
  country: string;
  notes: string | null;
  bank_ussd_code: string | null;
  source: string | null;
  bvn: string | null;
  allow_overdraft: boolean;
  is_fake_phone_number: boolean;
}

export interface LoystarUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  token: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
  deleted: string | null;
  sex: string;
  points_readjusted: boolean;
  local_db_created_at: string | null;
  firebase_uid: string | null;
  provider: string;
  uid: string;
  firebase_registration_token: string | null;
  address_line1: string;
  address_line2: string | null;
  postcode: string;
  state: string;
  country: string;
  bank_ussd_code: string | null;
  source: string | null;
}

export interface LoystarAuthResponse {
  customer: LoystarCustomer;
  user: LoystarUser;
  token: string;
}

export interface LoystarLoginRequest {
  email: string;
  merchant_id: string;
}

export interface LoystarProduct {
  id: number;
  merchant_product_category_id: number;
  name: string;
  description: string | null;
  price: string;
  cost_price: string | null;
  created_at: string;
  updated_at: string;
  picture: string;
  merchant_id: number;
  deleted: boolean;
  merchant_loyalty_program_id: number;
  track_inventory: boolean;
  sku: string | null;
  unit: string | null;
  quantity: string | null;
  tax: boolean;
  tax_type: string;
  tax_rate: string;
  original_price: string;
  product_sku: string | null;
  has_custom_qty: boolean;
  publish_to_loystar_shop: boolean;
  extra_pictures: string[];
  start_expiration_notification: string | null;
  expiry_date: string | null;
  dimensions: string | null;
  weight: string | null;
  markup_percentage: string | null;
  net_vat: number;
  custom_quantities: any[];
  bundle_products: any[];
  bundles: any[];
  stock_notification: any;
  variants: any[];
  supplier_products: any[];
  suppliers: any[];
}

export interface LoystarProductsResponse {
  data: LoystarProduct[];
  meta: {
    current_page: number;
    total_pages: number;
    total_count: number;
    per_page: number;
  };
}

export class LoystarAPI {
  private static baseURL = LOYSTAR_BASE_URL;
  private static merchantId = MERCHANT_ID;
  private static authToken: string | null = null;
  private static _axiosInstance: AxiosInstance | null = null;

  private static get axiosInstance(): AxiosInstance {
    if (!this._axiosInstance) {
      this._axiosInstance = this.initializeAxios();
    }
    return this._axiosInstance;
  }

  private static initializeAxios(): AxiosInstance {
    // Initialize Axios instance
    const instance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add authentication headers
    instance.interceptors.request.use(
      (config) => {
        // Add the standard headers for Loystar API
        config.headers.set('token', 'AsAVo8qbTfNbSaWHFt91fg');
        config.headers.set('uid', 'myfoodangels@gmail.com');
        config.headers.set('Authorization', 'Bearer eyJhY2Nlc3MtdG9rZW4iOiJBc0FWbzhxYlRmTmJTYVdIRnQ5MWZnIiwidG9rZW4tdHlwZSI6IkJlYXJlciIsImNsaWVudCI6InFFQVg5SjVjVlk3aVEzanZxRVpNQVEiLCJleHBpcnkiOiIxODE5OTE1NjA5IiwidWlkIjoibXlmb29kYW5nZWxzQGdtYWlsLmNvbSJ9');
        config.headers.set('expiry', '1819915609');
        config.headers.set('client', 'qEAX9J5cVY7iQ3jvqEZMAQ');
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    instance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('Loystar API response:', response.config.url, response.status);
        return response;
      },
      (error) => {
        console.error('Loystar API error:', error.config?.url, error.response?.status, error.message);
        
        if (error.response) {
          // Server responded with error status
          throw new Error(`API Error ${error.response.status}: ${error.response.data || error.message}`);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Network error: No response from server');
        } else {
          // Something else happened
          throw new Error(`Request error: ${error.message}`);
        }
      }
    );

    return instance;
  }

  static setAuthToken(token: string) {
    this.authToken = token;
  }

  static getAuthToken(): string | null {
    return this.authToken;
  }

  static async loginWithEmail(email: string): Promise<LoystarAuthResponse> {
    if (!this.baseURL || !this.merchantId) {
      throw new Error('Loystar configuration is missing. Please check your environment variables.');
    }

    const endpoint = '/customer_phone_auth_session';
    const requestBody: LoystarLoginRequest = {
      email,
      merchant_id: this.merchantId,
    };

    try {
      console.log('Loystar login request:', { endpoint, body: requestBody });
      
      const response: AxiosResponse<LoystarAuthResponse> = await this.axiosInstance.post(endpoint, requestBody);
      
      console.log('Loystar login success:', response.data);
      
      // Store the auth token for future requests
      this.setAuthToken(response.data.token);
      
      return response.data;
    } catch (error) {
      console.error('Loystar login error:', error);
      throw error;
    }
  }

  // signup or add user

  static async fetchProducts(
    categoryId?: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LoystarProduct[]> {
    if (!this.baseURL) {
      throw new Error('Loystar base URL is not configured');
    }

    let endpoint = `/get_latest_merchant_products?page[number]=${page}&page[size]=${pageSize}`;
    if (categoryId) {
      endpoint += `&category_id=${categoryId}`;
    }

    try {
      console.log('Fetching Loystar products:', { endpoint, categoryId, page, pageSize });
      
      const response: AxiosResponse<LoystarProduct[]> = await this.axiosInstance.get(endpoint);
      
      console.log('Loystar products fetched successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Loystar products fetch error:', error);
      throw error;
    }
  }

  static async searchProducts(
    productName?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LoystarProduct[]> {
    if (!this.baseURL) {
      throw new Error('Loystar base URL is not configured');
    }

    const endpoint = `/search_product/${productName}`;

    try {
      console.log('Searching Loystar products:', { endpoint, productName, page, pageSize });
      
      const response: AxiosResponse<LoystarProduct[]> = await this.axiosInstance.get(endpoint);
      
      console.log('Loystar products search successful:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Loystar products search error:', error);
      throw error;
    }
  }

  static async fetchSingleProduct(
    productId: number,
  ): Promise<LoystarProduct[]> {
    if (!this.baseURL) {
      throw new Error('Loystar base URL is not configured');
    }

    const endpoint = `/get_product_by_id?product_id=${productId}`;

    try {
      console.log('Fetching Loystar product:', { endpoint, productId });
      
      const response: AxiosResponse<LoystarProduct[]> = await this.axiosInstance.get(endpoint);
      
      console.log('Loystar product fetched successfully:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Loystar product fetch error:', error);
      throw error;
    }
  }

  // Fetch Farm Offtake products (category_id = 7486)
  static async fetchFarmOfftakeProducts(page: number = 1, pageSize: number = 6): Promise<LoystarProduct[]> {
    return this.fetchProducts(7486, page, pageSize);
  }
}