# Authentication Template for New Modules

This template demonstrates the proper authentication pattern for new modules in SparkAdmin.

## Quick Copy-Paste Examples

### 1. API Service Template

```typescript
// src/services/your-module/api.ts
import { apiRequest } from '../../helpers/api';
import { YourResponse, YourRequest } from './types';

/**
 * Your Module API Service
 * 
 * IMPORTANT: All methods require authentication token and tenantId
 */
export const yourApi = {
  /**
   * Get data with authentication
   */
  getData: async (params?: YourParams, token?: string, tenantId?: string): Promise<YourResponse> => {
    return apiRequest<YourResponse>('/your-endpoint', { 
      method: 'GET', 
      token, 
      tenantId 
    });
  },

  /**
   * Create data with authentication
   */
  createData: async (data: YourRequest, token?: string, tenantId?: string): Promise<YourResponse> => {
    return apiRequest<YourResponse>('/your-endpoint', { 
      method: 'POST', 
      body: data, 
      token, 
      tenantId 
    });
  },

  /**
   * Update data with authentication
   */
  updateData: async (id: string, data: YourRequest, token?: string, tenantId?: string): Promise<YourResponse> => {
    return apiRequest<YourResponse>(`/your-endpoint/${id}`, { 
      method: 'PUT', 
      body: data, 
      token, 
      tenantId 
    });
  },

  /**
   * Delete data with authentication
   */
  deleteData: async (id: string, token?: string, tenantId?: string): Promise<YourResponse> => {
    return apiRequest<YourResponse>(`/your-endpoint/${id}`, { 
      method: 'DELETE', 
      token, 
      tenantId 
    });
  },
};
```

### 2. Component Template

```typescript
// src/modules/your-module/YourScreen.tsx
import React, { useEffect, useCallback } from 'react';
import { useAuth } from '../../providers';
import { yourApi } from '../../services/your-module';

const YourScreen: React.FC = () => {
  // Get authentication context
  const { user } = useAuth();
  
  // Your state management here
  const [data, setData] = useState<YourResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Load data with authentication
  const loadData = useCallback(async () => {
    if (!user?.token) {
      console.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);
      const response = await yourApi.getData(params, user.token, user.tenantId);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      if (error instanceof ApiError && error.statusCode === 401) {
        // Handle authentication error
        console.error('Authentication failed - will redirect to login');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    // Your UI here
  );
};
```

### 3. Error Handling Template

```typescript
const handleApiCall = async () => {
  try {
    const response = await yourApi.getData(params, user?.token, user?.tenantId);
    // Handle success
  } catch (error) {
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          // Authentication failed - user will be redirected to login
          console.error('Authentication required');
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Insufficient permissions');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        default:
          console.error('API error:', error.message);
      }
    }
  }
};
```

## Checklist for New Modules

- [ ] Import `useAuth` hook in components
- [ ] Add `token` and `tenantId` parameters to all API methods
- [ ] Pass `user?.token` and `user?.tenantId` to API calls
- [ ] Handle 401 errors appropriately
- [ ] Add authentication documentation to API service
- [ ] Test with both authenticated and unauthenticated states

## Common Mistakes to Avoid

1. **Forgetting token parameters**: Always add `token?: string, tenantId?: string` to API methods
2. **Missing auth context**: Always use `const { user } = useAuth()` in components
3. **Not handling 401 errors**: Always check for authentication failures
4. **Hardcoding tokens**: Never hardcode authentication tokens
5. **Skipping tenant ID**: Always pass tenant ID for multi-tenant APIs

## Testing Authentication

```typescript
// Debug logging for authentication
console.log('Auth status:', user ? 'authenticated' : 'not authenticated');
console.log('Token available:', !!user?.token);
console.log('Tenant ID available:', !!user?.tenantId);

// Test API call with debugging
const testApiCall = async () => {
  console.log('Making API call with auth:', { 
    hasToken: !!user?.token, 
    hasTenantId: !!user?.tenantId 
  });
  
  try {
    const response = await yourApi.getData({}, user?.token, user?.tenantId);
    console.log('API call successful:', response);
  } catch (error) {
    console.error('API call failed:', error);
  }
};
```

## Need Help?

- Check the Items module implementation for a complete example
- Review the main README.md for detailed authentication guide
- Look at existing modules (chat, notifications) for patterns
- Check browser Network tab for Authorization headers
