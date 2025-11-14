import { apiRequest } from '../../helpers/api';
import { 
  WarehouseResponse, 
  WarehouseAddRequest, 
  WarehouseUpdateRequest, 
  WarehousePatchRequest,
  WarehouseListParams,
  PagedWarehousesResponse 
} from './types';

/**
 * Warehouse API Service
 * 
 * IMPORTANT: All methods require authentication token and tenantId for secure API access.
 * 
 * Authentication Pattern:
 * - Always pass user?.token and user?.tenantId from useAuth() hook
 * - Handle 401 errors gracefully (will redirect to login)
 * - See README.md for complete authentication guide
 * 
 * Example Usage:
 * ```typescript
 * const { user } = useAuth();
 * const items = await warehouseApi.getWarehouses(params, user?.token, user?.tenantId);
 * ```
 */
export const warehouseApi = {
  /**
   * Get all warehouses with pagination and filtering
   * @param params - Query parameters for pagination and filtering
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Paginated list of warehouses
   */
  getWarehouses: async (params?: WarehouseListParams, token?: string, tenantId?: string): Promise<PagedWarehousesResponse> => {
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
    
    const url = `/warehouses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedWarehousesResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single warehouse by ID
   * @param id - Warehouse ID to retrieve
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Single warehouse data
   */
  getWarehouse: async (id: string, token?: string, tenantId?: string): Promise<WarehouseResponse> => {
    return apiRequest<WarehouseResponse>(`/warehouses/${id}`, { method: 'GET', token, tenantId });
  },

  /**
   * Create new warehouse
   * @param warehouse - Warehouse data to create
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Created warehouse data
   */
  createWarehouse: async (warehouse: WarehouseAddRequest, token?: string, tenantId?: string): Promise<WarehouseResponse> => {
    return apiRequest<WarehouseResponse>(`/warehouses`, { method: 'POST', body: warehouse, token, tenantId });
  },

  /**
   * Update warehouse (full update)
   * @param id - Warehouse ID to update
   * @param warehouse - Complete warehouse data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated warehouse data
   */
  updateWarehouse: async (id: string, warehouse: WarehouseUpdateRequest, token?: string, tenantId?: string): Promise<WarehouseResponse> => {
    return apiRequest<WarehouseResponse>(`/warehouses/${id}`, { method: 'PUT', body: warehouse, token, tenantId });
  },

  /**
   * Patch warehouse (partial update)
   * @param id - Warehouse ID to patch
   * @param warehouse - Partial warehouse data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated warehouse data
   */
  patchWarehouse: async (id: string, warehouse: WarehousePatchRequest, token?: string, tenantId?: string): Promise<WarehouseResponse> => {
    return apiRequest<WarehouseResponse>(`/warehouses/${id}`, { method: 'PATCH', body: warehouse, token, tenantId });
  },

  /**
   * Delete warehouse
   * @param id - Warehouse ID to delete
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Deleted warehouse data
   */
  deleteWarehouse: async (id: string, token?: string, tenantId?: string): Promise<WarehouseResponse> => {
    return apiRequest<WarehouseResponse>(`/warehouses/${id}`, { method: 'DELETE', token, tenantId });
  },
};