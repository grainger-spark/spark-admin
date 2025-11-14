import { API_BASE_URL, API_VERSION, API_TIMEOUT } from '@env';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_VERSION: API_VERSION || 'v1',
  TIMEOUT: parseInt(API_TIMEOUT || '30000'), // 30 seconds
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};
