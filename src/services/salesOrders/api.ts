import { apiRequest } from '../../helpers/api';
import { 
  SalesOrderResponse, 
  SalesOrderAddRequest, 
  SalesOrderUpdateRequest, 
  SalesOrderPatchRequest,
  SalesOrderListParams,
  PagedSalesOrdersResponse 
} from './types';

/**
 * Sales Orders API Service
 * 
 * IMPORTANT: All methods require authentication token and tenantId for secure API access.
 * 
 * Authentication Pattern:
 * - Always pass user?.token and user?.tenantId from useAuth() hook
 * - Handle 401 errors gracefully (will redirect to login)
 * 
 * Example Usage:
 * ```typescript
 * const { user } = useAuth();
 * const orders = await salesOrdersApi.getSalesOrders(params, user?.token, user?.tenantId);
 * ```
 */
export const salesOrdersApi = {
  /**
   * Get all sales orders with pagination and filtering
   */
  getSalesOrders: async (params?: SalesOrderListParams, token?: string, tenantId?: string): Promise<PagedSalesOrdersResponse> => {
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
    
    const url = `/sales-orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedSalesOrdersResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single sales order by ID
   */
  getSalesOrder: async (id: string, token?: string, tenantId?: string): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(`/sales-orders/${id}`, { method: 'GET', token, tenantId });
  },

  /**
   * Create new sales order
   */
  createSalesOrder: async (order: SalesOrderAddRequest, token?: string, tenantId?: string): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(`/sales-orders`, { method: 'POST', body: order, token, tenantId });
  },

  /**
   * Update sales order (full update)
   */
  updateSalesOrder: async (id: string, order: SalesOrderUpdateRequest, token?: string, tenantId?: string): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(`/sales-orders/${id}`, { method: 'PUT', body: order, token, tenantId });
  },

  /**
   * Patch sales order (partial update)
   */
  patchSalesOrder: async (id: string, order: SalesOrderPatchRequest, token?: string, tenantId?: string): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(`/sales-orders/${id}`, { method: 'PATCH', body: order, token, tenantId });
  },

  /**
   * Delete sales order
   */
  deleteSalesOrder: async (id: string, token?: string, tenantId?: string): Promise<SalesOrderResponse> => {
    return apiRequest<SalesOrderResponse>(`/sales-orders/${id}`, { method: 'DELETE', token, tenantId });
  },
};
