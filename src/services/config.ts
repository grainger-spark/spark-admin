// API Configuration
export const API_CONFIG = {
  // Use ngrok for development, production URL for release
  BASE_URL: __DEV__ ? 'https://sparkbackend.ngrok.app' : 'https://api.sparkinventory.com',
  API_VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
};

export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}/api/${API_CONFIG.API_VERSION}${endpoint}`;
};
