import { apiRequest } from '../../helpers/api';
import { DashboardParams } from './types';

export const dashboardApi = {
  /**
   * Get sales overview metrics
   */
  getSales: async (params?: DashboardParams, token?: string, tenantId?: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/reporting/sales${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<any>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get detailed sales breakdown
   */
  getSalesDetails: async (params?: DashboardParams, token?: string, tenantId?: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/reporting/sales-details${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<any>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get recent sales activity
   */
  getSalesRecent: async (token?: string, tenantId?: string): Promise<any> => {
    const url = '/reporting/sales-recent';
    return apiRequest<any>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get top selling products
   */
  getSalesProducts: async (params?: DashboardParams, token?: string, tenantId?: string): Promise<any> => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const url = `/reporting/sales-products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<any>(url, { method: 'GET', token, tenantId });
  },
};
