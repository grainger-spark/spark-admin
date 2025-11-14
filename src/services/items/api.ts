import { apiRequest } from '../../helpers/api';
import { 
  ItemResponse, 
  ItemAddRequest, 
  ItemUpdateRequest, 
  ItemPatchRequest,
  ItemsListParams,
  PagedItemsResponse 
} from './types';

/**
 * Items API Service
 * 
 * This service handles all CRUD operations for items.
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
 * const items = await itemsApi.getItems(params, user?.token, user?.tenantId);
 * ```
 */
export const itemsApi = {
  /**
   * Get all items with pagination and filtering
   * @param params - Query parameters for pagination and filtering
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Paginated list of items
   */
  getItems: async (params?: ItemsListParams, token?: string, tenantId?: string): Promise<PagedItemsResponse> => {
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
    
    const url = `/items${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedItemsResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single item by ID
   * @param id - Item ID to retrieve
   * @param includeTranslations - Whether to include translation data
   * @param warehouseId - Optional warehouse ID filter
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Single item data
   */
  getItem: async (id: string, includeTranslations?: boolean, warehouseId?: string, token?: string, tenantId?: string): Promise<ItemResponse> => {
    const queryParams = new URLSearchParams();
    
    if (includeTranslations !== undefined) {
      queryParams.append('includeTranslations', String(includeTranslations));
    }
    
    if (warehouseId) {
      queryParams.append('warehouseId', warehouseId);
    }
    
    const url = `/items/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<ItemResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Create new item
   * @param item - Item data to create
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Created item data
   */
  createItem: async (item: ItemAddRequest, token?: string, tenantId?: string): Promise<ItemResponse> => {
    return apiRequest<ItemResponse>('/items', { method: 'POST', body: item, token, tenantId });
  },

  /**
   * Update item (full update)
   * @param id - Item ID to update
   * @param item - Complete item data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated item data
   */
  updateItem: async (id: string, item: ItemUpdateRequest, token?: string, tenantId?: string): Promise<ItemResponse> => {
    return apiRequest<ItemResponse>(`/items/${id}`, { method: 'PUT', body: item, token, tenantId });
  },

  /**
   * Patch item (partial update)
   * @param id - Item ID to patch
   * @param item - Partial item data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated item data
   */
  patchItem: async (id: string, item: ItemPatchRequest, token?: string, tenantId?: string): Promise<ItemResponse> => {
    return apiRequest<ItemResponse>(`/items/${id}`, { method: 'PATCH', body: item, token, tenantId });
  },

  /**
   * Delete item
   * @param id - Item ID to delete
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Deleted item data
   */
  deleteItem: async (id: string, token?: string, tenantId?: string): Promise<ItemResponse> => {
    return apiRequest<ItemResponse>(`/items/${id}`, { method: 'DELETE', token, tenantId });
  },
};
