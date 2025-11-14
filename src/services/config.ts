// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_BASE_URL,
  API_VERSION: process.env.API_VERSION || 'v1',
  TIMEOUT: parseInt(process.env.API_TIMEOUT || '30000'), // 30 seconds
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};
