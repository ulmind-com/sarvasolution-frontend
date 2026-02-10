import api from '@/lib/api';

export interface Product {
  _id: string;
  productId: string;
  productName: string;
  productImage?: {
    url?: string;
  };
  category?: string;
  description?: string;
  mrp: number;
  productDP: number;
  bv: number;
  pv: number;
  stockQuantity: number;
  isInStock: boolean;
  hsnCode?: string;
  cgst?: number;
  sgst?: number;
}

export interface ProductsResponse {
  success: boolean;
  message: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

export interface ProductDetailsResponse {
  success: boolean;
  message: string;
  data: {
    product: Product;
  };
}

// Fetch all products with pagination
export const getAllProducts = async (page = 1, limit = 12): Promise<ProductsResponse> => {
  const response = await api.get('/api/v1/user/products', {
    params: { page, limit }
  });
  return response.data;
};

// Fetch single product details
export const getProductDetails = async (productId: string): Promise<ProductDetailsResponse> => {
  const response = await api.get(`/api/v1/user/products/${productId}`);
  return response.data;
};

// Fetch wallet summary
export const getWalletSummary = async () => {
  const response = await api.get('/api/v1/user/wallet');
  const body = response.data;
  // Handle nested response structures
  if (body?.data?.wallet) return body.data.wallet;
  if (body?.wallet) return body.wallet;
  return body;
};

// Fetch payout history
export const getPayoutHistory = async () => {
  const response = await api.get('/api/v1/user/payouts');
  const body = response.data;
  if (body?.data && Array.isArray(body.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (body?.data?.payouts) return body.data.payouts;
  if (body?.payouts) return body.payouts;
  return [];
};
