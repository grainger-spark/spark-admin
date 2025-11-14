import { apiRequest } from '../../helpers/api';
import { 
  LocationResponse, 
  LocationAddRequest, 
  LocationUpdateRequest, 
  LocationPatchRequest,
  LocationListParams,
  PagedLocationsResponse 
} from './types';

/**
 * Location API Service
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
 * const locations = await locationApi.getLocations(params, user?.token, user?.tenantId);
 * ```
 */
export const locationApi = {
  /**
   * Get all locations with pagination and filtering
   * @param params - Query parameters for pagination and filtering
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Paginated list of locations
   */
  getLocations: async (params?: LocationListParams, token?: string, tenantId?: string): Promise<PagedLocationsResponse> => {
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
    
    const url = `/locations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PagedLocationsResponse>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single location by ID
   * @param id - Location ID to retrieve
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Single location data
   */
  getLocation: async (id: string, token?: string, tenantId?: string): Promise<LocationResponse> => {
    return apiRequest<LocationResponse>(`/locations/${id}`, { method: 'GET', token, tenantId });
  },

  /**
   * Create new location
   * @param location - Location data to create
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Created location data
   */
  createLocation: async (location: LocationAddRequest, token?: string, tenantId?: string): Promise<LocationResponse> => {
    return apiRequest<LocationResponse>(`/locations`, { method: 'POST', body: location, token, tenantId });
  },

  /**
   * Update location (full update)
   * @param id - Location ID to update
   * @param location - Complete location data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated location data
   */
  updateLocation: async (id: string, location: LocationUpdateRequest, token?: string, tenantId?: string): Promise<LocationResponse> => {
    return apiRequest<LocationResponse>(`/locations/${id}`, { method: 'PUT', body: location, token, tenantId });
  },

  /**
   * Patch location (partial update)
   * @param id - Location ID to patch
   * @param location - Partial location data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated location data
   */
  patchLocation: async (id: string, location: LocationPatchRequest, token?: string, tenantId?: string): Promise<LocationResponse> => {
    return apiRequest<LocationResponse>(`/locations/${id}`, { method: 'PATCH', body: location, token, tenantId });
  },

  /**
   * Delete location
   * @param id - Location ID to delete
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Deleted location data
   */
  deleteLocation: async (id: string, token?: string, tenantId?: string): Promise<LocationResponse> => {
    return apiRequest<LocationResponse>(`/locations/${id}`, { method: 'DELETE', token, tenantId });
  },
};
