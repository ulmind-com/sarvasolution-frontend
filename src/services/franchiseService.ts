import axios from 'axios';

const API_BASE_URL = 'https://sarvasolution-backend.onrender.com';

// Create a separate axios instance for franchise APIs that uses franchise token
const franchiseApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Franchise Authorization header
franchiseApi.interceptors.request.use(
  (config) => {
    const franchiseStorage = localStorage.getItem('franchise-auth-storage');
    if (franchiseStorage) {
      try {
        const { state } = JSON.parse(franchiseStorage);
        if (state?.franchiseToken) {
          config.headers.Authorization = `Bearer ${state.franchiseToken}`;
        }
      } catch (error) {
        console.error('Error parsing franchise auth storage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
franchiseApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('franchise-auth-storage');
      window.location.href = '/franchise/login';
    }
    return Promise.reject(error);
  }
);

// ===== POS Service Functions =====

/**
 * Get Member Details by Member ID
 * API: GET /api/v1/franchise/sale/user/{memberId}
 */
export const getMemberByCode = async (memberId: string) => {
  const response = await franchiseApi.get(`/api/v1/franchise/sale/user/${memberId}`);
  return response.data;
};

/**
 * Get Product Master Details by Product ID
 * API: GET /api/v1/user/products/{productId}
 */
export const getProductMasterDetails = async (productId: string) => {
  const response = await franchiseApi.get(`/api/v1/user/products/${productId}`);
  return response.data;
};

/**
 * Submit Franchise Sale
 * API: POST /api/v1/franchise/sale/sell
 */
export interface SalePayload {
  memberId: string;
  items: Array<{ productId: string; quantity: number }>;
  paymentMethod: string;
}

export const processFranchiseSale = async (payload: SalePayload) => {
  const response = await franchiseApi.post('/api/v1/franchise/sale/sell', payload);
  return response.data;
};

/**
 * Get Franchise Inventory List
 * API: GET /api/v1/franchise/inventory/list
 */
export const getFranchiseInventory = async () => {
  const response = await franchiseApi.get('/api/v1/franchise/inventory/list');
  return response.data;
};

/**
 * Create a Stock Request
 * API: POST /api/v1/franchise/requests/create
 */
export const createStockRequest = async (items: { productId: string; requestedQuantity: number }[]) => {
  const response = await franchiseApi.post('/api/v1/franchise/requests/create', { items });
  return response.data;
};

export default franchiseApi;
