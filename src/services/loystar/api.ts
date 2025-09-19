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

    const url = `${this.baseURL}/customer_phone_auth_session`;
    const requestBody: LoystarLoginRequest = {
      email,
      merchant_id: this.merchantId,
    };

    try {
      console.log('Loystar login request:', { url, body: requestBody });
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loystar login error:', response.status, errorText);
        throw new Error(`Loystar login failed: ${response.status} ${errorText}`);
      }

      const data: LoystarAuthResponse = await response.json();
      console.log('Loystar login success:', data);
      
      // Store the auth token for future requests
      this.setAuthToken(data.token);
      
      return data;
    } catch (error) {
      console.error('Loystar login error:', error);
      throw error;
    }
  }

  // signup or add user

  static async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.baseURL) {
      throw new Error('Loystar base URL is not configured');
    }

    if (!this.authToken) {
      throw new Error('No authentication token available. Please login first.');
    }

    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.authToken}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loystar API error:', response.status, errorText);
        throw new Error(`Loystar API request failed: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Loystar API request error:', error);
      throw error;
    }
  }

  static async fetchProducts(
    categoryId?: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<LoystarProduct[]> {
    if (!this.baseURL) {
      throw new Error('Loystar base URL is not configured');
    }

    // if (!this.authToken) {
    //   throw new Error('No authentication token available. Please login first.');
    // }

    let endpoint = `/get_latest_merchant_products?page[number]=${page}&page[size]=${pageSize}`;
    if (categoryId) {
      endpoint += `&category_id=${categoryId}`;
    }

    const headers = {
      'token': 'AsAVo8qbTfNbSaWHFt91fg',
      'client': 'qEAX9J5cVY7iQ3jvqEZMAQ',
      'uid': 'myfoodangels@gmail.com',
      'token-type': 'Bearer',
      'authorization': 'Bearer eyJhY2Nlc3MtdG9rZW4iOiJBc0FWbzhxYlRmTmJTYVdIRnQ5MWZnIiwidG9rZW4tdHlwZSI6IkJlYXJlciIsImNsaWVudCI6InFFQVg5SjVjVlk3aVEzanZxRVpNQVEiLCJleHBpcnkiOiIxODE5OTE1NjA5IiwidWlkIjoibXlmb29kYW5nZWxzQGdtYWlsLmNvbSJ9',
      'expiry': '1819915609',
    };

    try {
      console.log('Fetching Loystar products:', { endpoint, categoryId, page, pageSize });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loystar products fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
      }

      const data: LoystarProduct[] = await response.json();
      console.log('Loystar products fetched successfully:', data);
      
      return data;
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

    // if (!this.authToken) {
    //   throw new Error('No authentication token available. Please login first.');
    // }

    let endpoint = `/search_product/${productName}`;

    const headers = {
      'token': 'AsAVo8qbTfNbSaWHFt91fg',
      'client': 'qEAX9J5cVY7iQ3jvqEZMAQ',
      'uid': 'myfoodangels@gmail.com',
      'token-type': 'Bearer',
      'authorization': 'Bearer eyJhY2Nlc3MtdG9rZW4iOiJBc0FWbzhxYlRmTmJTYVdIRnQ5MWZnIiwidG9rZW4tdHlwZSI6IkJlYXJlciIsImNsaWVudCI6InFFQVg5SjVjVlk3aVEzanZxRVpNQVEiLCJleHBpcnkiOiIxODE5OTE1NjA5IiwidWlkIjoibXlmb29kYW5nZWxzQGdtYWlsLmNvbSJ9',
      'expiry': '1819915609',
    };

    try {
      console.log('Fetching Loystar products:', { endpoint, productName, page, pageSize });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loystar products fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
      }

      const data: LoystarProduct[] = await response.json();
      console.log('Loystar products fetched successfully:', data);
      
      return data;
    } catch (error) {
      console.error('Loystar products fetch error:', error);
      throw error;
    }
  }

  static async fetchAllProducts(
    page: number = 1,
    pageSize: number = 100
  ): Promise<LoystarProduct[]> {
    if (!this.baseURL) {
      throw new Error('Loystar base URL is not configured');
    }

    if (!this.authToken) {
      throw new Error('No authentication token available. Please login first.');
    }

    let endpoint = `/get_products_of_merchant_urewards?page[number]=${page}&page[size]=${pageSize}`;

    const headers = {
      'authorization': `Bearer ${this.authToken}`,
    };

    try {
      console.log('Fetching Loystar products:', { endpoint, page, pageSize });
      
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Loystar products fetch error:', response.status, errorText);
        throw new Error(`Failed to fetch products: ${response.status} ${errorText}`);
      }

      const data: LoystarProduct[] = await response.json();
      console.log('Loystar products fetched successfully:', data);
      
      return data;
    } catch (error) {
      console.error('Loystar products fetch error:', error);
      throw error;
    }
  }

  // Fetch Farm Offtake products (category_id = 7486)
  static async fetchFarmOfftakeProducts(page: number = 1, pageSize: number = 6): Promise<LoystarProduct[]> {
    return this.fetchProducts(7486, page, pageSize);
  }
}