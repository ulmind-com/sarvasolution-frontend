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
  gst?: number;
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
  data: Product;
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
