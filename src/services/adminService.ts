import api from '@/lib/api';

// ===== Franchise Request Types =====

export interface FranchiseRequestProduct {
  _id: string;
  productName: string;
  productDP: number;
  mrp: number;
  cgst: number;
  sgst: number;
}

export interface FranchiseRequestItem {
  product: FranchiseRequestProduct;
  requestedQuantity: number;
  _id: string;
}

export interface FranchiseInfo {
  _id: string;
  name: string;
  shopName: string;
  vendorId: string;
  city: string;
}

export interface FranchiseRequest {
  _id: string;
  requestNo: string;
  franchise: FranchiseInfo;
  items: FranchiseRequestItem[];
  status: 'pending' | 'approved' | 'rejected';
  estimatedTotal: number;
  requestDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface FranchiseRequestsResponse {
  requests: FranchiseRequest[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRequests: number;
    limit: number;
  };
}

// ===== API Functions =====

/**
 * Fetch all franchise product requests
 * API: GET /api/v1/admin/requests/list
 */
export const getFranchiseRequests = async (page = 1, limit = 10): Promise<FranchiseRequestsResponse> => {
  const response = await api.get('/api/v1/admin/requests/list', {
    params: { page, limit },
  });
  return response.data;
};

/**
 * Approve a franchise product request
 * API: PATCH /api/v1/admin/requests/{requestId}/approve
 */
export const approveFranchiseRequest = async (requestId: string) => {
  const response = await api.patch(`/api/v1/admin/requests/${requestId}/approve`);
  return response.data;
};

// ===== Product Management =====

/**
 * Update a product
 * API: PUT /api/v1/admin/product/update/{productId}
 */
export const updateProduct = async (productId: string, formData: FormData) => {
  const response = await api.put(`/api/v1/admin/product/update/${productId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * Delete a product
 * API: DELETE /api/v1/admin/product/{productId}
 */
export const deleteProduct = async (productId: string) => {
  const response = await api.delete(`/api/v1/admin/product/${productId}`);
  return response.data;
};
