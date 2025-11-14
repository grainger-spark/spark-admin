import { apiRequest } from '../../helpers/api';
import {
  PurchaseOrderResponse,
  PurchaseOrderAddRequest,
  PurchaseOrderUpdateRequest,
  PurchaseOrderPatchRequest,
  PurchaseOrderListParams,
  PagedPurchaseOrdersResponse,
} from './types';

export const purchaseOrdersApi = {
  /**
   * Get paginated list of purchase orders
   */
  getPurchaseOrders: async (
    params?: PurchaseOrderListParams,
    token?: string,
    tenantId?: string
  ): Promise<PagedPurchaseOrdersResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object') {
            queryParams.append(key, JSON.stringify(value));
          } else {
            queryParams.append(key, String(value));
          }
        }
      });
    }
    
    const url = `/purchase-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedPurchaseOrdersResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single purchase order by ID
   */
  getPurchaseOrder: async (id: string, token?: string, tenantId?: string): Promise<PurchaseOrderResponse> => {
    return apiRequest<PurchaseOrderResponse>(`/purchase-orders/${id}`, { method: 'GET', token, tenantId });
  },

  /**
   * Create new purchase order
   */
  createPurchaseOrder: async (order: PurchaseOrderAddRequest, token?: string, tenantId?: string): Promise<PurchaseOrderResponse> => {
    return apiRequest<PurchaseOrderResponse>(`/purchase-orders`, { method: 'POST', body: order, token, tenantId });
  },

  /**
   * Update purchase order (full update)
   */
  updatePurchaseOrder: async (id: string, order: PurchaseOrderUpdateRequest, token?: string, tenantId?: string): Promise<PurchaseOrderResponse> => {
    return apiRequest<PurchaseOrderResponse>(`/purchase-orders/${id}`, { method: 'PUT', body: order, token, tenantId });
  },

  /**
   * Patch purchase order (partial update)
   */
  patchPurchaseOrder: async (id: string, order: PurchaseOrderPatchRequest, token?: string, tenantId?: string): Promise<PurchaseOrderResponse> => {
    return apiRequest<PurchaseOrderResponse>(`/purchase-orders/${id}`, { method: 'PATCH', body: order, token, tenantId });
  },

  /**
   * Delete purchase order
   */
  deletePurchaseOrder: async (id: string, token?: string, tenantId?: string): Promise<PurchaseOrderResponse> => {
    return apiRequest<PurchaseOrderResponse>(`/purchase-orders/${id}`, { method: 'DELETE', token, tenantId });
  },
};
