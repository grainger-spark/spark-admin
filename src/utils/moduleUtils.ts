/**
 * Module Utilities
 * 
 * Common utilities and patterns for module development
 */

import { useCallback, useState } from 'react';
import { useAuth } from '../providers';
import { ApiError } from '../helpers/api';

/**
 * Hook for handling API calls with authentication
 * Provides common patterns for loading, error handling, and data fetching
 */
export const useApiCall = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async <T>(
    apiCall: (token: string, tenantId: string) => Promise<T>
  ): Promise<T | null> => {
    if (!user?.token || !user?.tenantId) {
      setError('User not authenticated');
      return null;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await apiCall(user.token, user.tenantId);
      return result;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'An unknown error occurred';
      
      setError(errorMessage);
      
      // Log specific error types for debugging
      if (err instanceof ApiError) {
        console.error(`API Error (${err.statusCode}):`, errorMessage);
      } else {
        console.error('Unexpected error:', err);
      }
      
      return null;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    loading,
    error,
    execute,
    clearError,
  };
};

/**
 * Hook for paginated data fetching
 * Common pattern for list screens
 */
export const usePaginatedData = <T>(
  fetchFunction: (params: any, token: string, tenantId: string) => Promise<{
    data: T[];
    meta: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }>
) => {
  const { user } = useAuth();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async (page = 1, search = '', currentFilters = filters) => {
    if (!user?.token || !user?.tenantId) {
      setError('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params = {
        Page: page,
        PageSize: pagination.pageSize,
        Search: search || undefined,
        ...currentFilters,
      };

      const response = await fetchFunction(params, user.token, user.tenantId);
      setData(response.data);
      setPagination(response.meta);
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : err instanceof Error 
        ? err.message 
        : 'Failed to fetch data';
      
      setError(errorMessage);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user, pagination.pageSize, filters, fetchFunction]);

  const refresh = useCallback(() => {
    return fetchData(pagination.currentPage, searchQuery, filters);
  }, [fetchData, pagination.currentPage, searchQuery, filters]);

  const loadNext = useCallback(() => {
    if (pagination.hasNext && !loading) {
      return fetchData(pagination.currentPage + 1, searchQuery, filters);
    }
  }, [fetchData, pagination.hasNext, pagination.currentPage, searchQuery, filters, loading]);

  const updateFilters = useCallback((newFilters: Record<string, any>) => {
    setFilters(newFilters);
    return fetchData(1, searchQuery, newFilters);
  }, [fetchData, searchQuery]);

  const updateSearch = useCallback((search: string) => {
    setSearchQuery(search);
    return fetchData(1, search, filters);
  }, [fetchData, filters]);

  return {
    data,
    loading,
    error,
    pagination,
    filters,
    searchQuery,
    fetchData,
    refresh,
    loadNext,
    updateFilters,
    updateSearch,
    setError,
  };
};

/**
 * Common form validation patterns
 */
export const ValidationRules = {
  required: (value: any) => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return 'This field is required';
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  minLength: (min: number) => (value: string) => {
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max: number) => (value: string) => {
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return null;
  },

  numeric: (value: string) => {
    if (isNaN(Number(value))) {
      return 'Must be a valid number';
    }
    return null;
  },

  positive: (value: string) => {
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      return 'Must be a positive number';
    }
    return null;
  },
};

/**
 * Form validation helper
 */
export const validateForm = <T extends Record<string, any>>(
  data: T,
  rules: Partial<Record<keyof T, (value: any) => string | null>>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors = {} as Partial<Record<keyof T, string>>;
  let isValid = true;

  Object.entries(rules).forEach(([field, rule]) => {
    const error = rule(data[field as keyof T]);
    if (error) {
      errors[field as keyof T] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Common form field configurations
 */
export const FormFields = {
  text: (label: string, placeholder: string, required = false) => ({
    type: 'text' as const,
    label,
    placeholder,
    required,
  }),

  textarea: (label: string, placeholder: string, required = false) => ({
    type: 'textarea' as const,
    label,
    placeholder,
    required,
  }),

  number: (label: string, placeholder: string, required = false) => ({
    type: 'number' as const,
    label,
    placeholder,
    required,
  }),

  email: (label: string, placeholder: string, required = false) => ({
    type: 'email' as const,
    label,
    placeholder,
    required,
  }),

  select: (label: string, options: { value: string; label: string }[], required = false) => ({
    type: 'select' as const,
    label,
    options,
    required,
  }),
};

/**
 * Common screen styles
 */
export const ScreenStyles = {
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#333',
  },

  content: {
    flex: 1,
  },

  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 16,
    color: '#333',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f5f5f5',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#f5f5f5',
    padding: 32,
  },

  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center' as const,
    marginBottom: 16,
  },

  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center' as const,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600' as const,
  },

  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center' as const,
  },

  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600' as const,
  },

  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
  },

  textArea: {
    height: 100,
    paddingTop: 12,
    textAlignVertical: 'top' as const,
  },

  label: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: '#333',
    marginBottom: 8,
  },

  fieldContainer: {
    marginBottom: 16,
  },
};

/**
 * Common navigation patterns
 */
export const NavigationHelpers = {
  createTabScreen: (name: string, component: React.ComponentType, iconName: string) => ({
    name,
    component,
    options: {
      tabBarIcon: ({ color, size }: { color: string; size: number }) => {
        // Import Ionicons dynamically to avoid circular dependencies
        const { Ionicons } = require('@expo/vector-icons');
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    },
  }),

  createStackScreen: (name: string, component: React.ComponentType, options: any = {}) => ({
    name,
    component,
    options,
  }),
};

/**
 * Common date formatting utilities
 */
export const DateUtils = {
  format: (date: string | Date, format: 'short' | 'long' | 'time' = 'short') => {
    const d = new Date(date);
    
    switch (format) {
      case 'short':
        return d.toLocaleDateString();
      case 'long':
        return d.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return d.toLocaleTimeString();
      default:
        return d.toLocaleDateString();
    }
  },

  relative: (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  },
};

/**
 * Common number formatting utilities
 */
export const NumberUtils = {
  format: (num: number, decimals = 2) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  },

  currency: (num: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(num);
  },

  percentage: (num: number, decimals = 1) => {
    return `${NumberUtils.format(num * 100, decimals)}%`;
  },

  compact: (num: number) => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
  },
};
