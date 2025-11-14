# Module Example: Using the New Utilities

This document shows how to use the reusable utilities and patterns when creating new modules.

## Example: Products Module using Utilities

### 1. Simplified API Service

```typescript
// src/services/products/api.ts
import { apiRequest } from '../../helpers/api';
import { ProductResponse, ProductListParams } from './types';

export const productsApi = {
  getProducts: async (params?: ProductListParams, token?: string, tenantId?: string) => {
    return apiRequest<{ data: ProductResponse[]; meta: any }>('/products', { 
      method: 'GET', 
      token, 
      tenantId 
    });
  },
  // ... other methods
};
```

### 2. Simplified List Screen using Utilities

```typescript
// src/modules/products/ProductsListScreen/ProductsListScreen.tsx
import React from 'react';
import { usePaginatedData } from '../../../utils/moduleUtils';
import { productsApi } from '../../../services/products';
import { Product } from '../../../services/products';

const ProductsListScreen: React.FC = () => {
  // Use the paginated data hook - handles auth, loading, errors, pagination
  const {
    data: products,
    loading,
    error,
    pagination,
    searchQuery,
    refresh,
    updateSearch,
  } = usePaginatedData<Product>(productsApi.getProducts);

  // Render your UI using the provided state
  return (
    <View>
      {/* Search input */}
      <TextInput
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={updateSearch}
      />
      
      {/* Loading state */}
      {loading && <ActivityIndicator />}
      
      {/* Error state */}
      {error && <Text>{error}</Text>}
      
      {/* Product list */}
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductItem product={item} />}
        refreshing={loading}
        onRefresh={refresh}
      />
    </View>
  );
};
```

### 3. Simplified Form Handling

```typescript
// src/modules/products/ProductEditScreen/ProductEditScreen.tsx
import React, { useState } from 'react';
import { validateForm, ValidationRules, FormFields, ScreenStyles } from '../../../utils/moduleUtils';
import { ProductAddRequest } from '../../../services/products';

const ProductEditScreen: React.FC = () => {
  const [formData, setFormData] = useState<ProductAddRequest>({
    name: '',
    description: '',
    price: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProductAddRequest, string>>>({});

  const validationRules = {
    name: ValidationRules.required,
    price: [ValidationRules.required, ValidationRules.positive],
  };

  const handleSave = () => {
    // Validate form using utility
    const { isValid, errors: validationErrors } = validateForm(formData, validationRules);
    
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    // Save logic here...
  };

  return (
    <View style={ScreenStyles.container}>
      <View style={ScreenStyles.section}>
        <Text style={ScreenStyles.sectionTitle}>Product Information</Text>
        
        <View style={ScreenStyles.fieldContainer}>
          <Text style={ScreenStyles.label}>Name *</Text>
          <TextInput
            style={ScreenStyles.input}
            value={formData.name}
            onChangeText={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter product name"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={ScreenStyles.fieldContainer}>
          <Text style={ScreenStyles.label}>Price *</Text>
          <TextInput
            style={ScreenStyles.input}
            value={formData.price.toString()}
            onChangeText={(value) => setFormData({ ...formData, price: Number(value) })}
            placeholder="0.00"
            keyboardType="numeric"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>
      </View>
    </View>
  );
};
```

### 4. Simplified API Calls

```typescript
// Using the useApiCall hook for single operations
import { useApiCall } from '../../../utils/moduleUtils';

const ProductDetailScreen: React.FC = ({ productId }) => {
  const { loading, error, execute } = useApiCall();

  const loadProduct = async () => {
    const product = await execute(async (token, tenantId) => {
      return productsApi.getProduct(productId, token, tenantId);
    });
    
    if (product) {
      // Handle success
      console.log('Product loaded:', product);
    }
  };

  // The hook automatically handles:
  // - Authentication checks
  // - Loading states
  // - Error handling
  // - Token/tenantId passing
};
```

### 5. Reusable UI Components

```typescript
// Using common styles and patterns
import { ScreenStyles, DateUtils, NumberUtils } from '../../../utils/moduleUtils';

const ProductItem: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <View style={ScreenStyles.section}>
      <Text style={ScreenStyles.sectionTitle}>{product.name}</Text>
      
      <Text>Price: {NumberUtils.currency(product.price)}</Text>
      <Text>Created: {DateUtils.relative(product.createdAt)}</Text>
      <Text>Stock: {NumberUtils.compact(product.stockQuantity)} units</Text>
    </View>
  );
};
```

## Benefits of Using Utilities

### 1. **Reduced Boilerplate**
- No need to rewrite authentication logic
- Common patterns are abstracted away
- Consistent error handling across modules

### 2. **Type Safety**
- All utilities are fully typed
- Better IDE support and autocomplete
- Fewer runtime errors

### 3. **Consistency**
- All modules follow the same patterns
- Consistent UI/UX across the app
- Easier maintenance and debugging

### 4. **Performance**
- Optimized hooks with proper dependencies
- Efficient re-rendering patterns
- Built-in loading states

### 5. **Maintainability**
- Centralized common logic
- Easy to update patterns globally
- Clear separation of concerns

## Migration Guide

To convert an existing module to use the new utilities:

### Before (Manual Pattern)
```typescript
const OldScreen = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.getData(params, user?.token, user?.tenantId);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of component
};
```

### After (Utilities Pattern)
```typescript
const NewScreen = () => {
  const { data, loading, error, refresh } = usePaginatedData(api.getData);

  // ... rest of component (much cleaner!)
};
```

## Available Utilities

### Hooks
- `useApiCall()` - For single API operations
- `usePaginatedData()` - For list screens with pagination

### Validation
- `ValidationRules` - Common validation functions
- `validateForm()` - Form validation helper
- `FormFields` - Field configuration helpers

### UI Helpers
- `ScreenStyles` - Common screen styles
- `NavigationHelpers` - Navigation patterns
- `DateUtils` - Date formatting utilities
- `NumberUtils` - Number formatting utilities

### Best Practices
1. Use `usePaginatedData` for any list screen
2. Use `useApiCall` for single operations (get, create, update, delete)
3. Use `validateForm` for all form validations
4. Use `ScreenStyles` for consistent UI
5. Always handle loading and error states

This approach makes module development much faster and more consistent across the application!
