# Module Development Guide

This guide covers how to create, develop, and integrate new modules into the SparkAdmin application.

## Quick Start: Module Generator

The fastest way to create a new module is using the automated generator:

```bash
# Install dependencies first
npm install

# Create a new module (e.g., "products", "orders", "customers")
npm run create-module YourModuleName

# Example: Create a "products" module
npm run create-module products
```

This will create a complete module structure with:
- ✅ Service layer (types, API, transformations, constants)
- ✅ React components (List, Detail, Edit screens)
- ✅ Authentication integration
- ✅ TypeScript interfaces
- ✅ Proper file structure and exports

## Manual Module Creation

If you prefer to create modules manually, follow these steps:

### 1. Service Layer

Create `src/services/your-module/` with these files:

#### `types.ts`
```typescript
export interface YourModuleResponse {
  id: string;
  name: string;
  // Add your fields
}

export interface YourModuleAddRequest {
  name: string;
  // Add your fields
}

export interface YourModuleListParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  // Add your filter fields
}
```

#### `api.ts`
```typescript
import { apiRequest } from '../../helpers/api';

export const yourModuleApi = {
  // Always include token and tenantId parameters
  getItems: async (params?: YourModuleListParams, token?: string, tenantId?: string) => {
    return apiRequest<YourModuleResponse>('/your-endpoint', { 
      method: 'GET', 
      token, 
      tenantId 
    });
  },
  // Add other CRUD methods...
};
```

#### `transformations.ts`
```typescript
export const transformItemResponse = (response: any): YourModuleResponse => {
  return {
    id: response.id || '',
    name: response.name || '',
    // Transform other fields
  };
};
```

#### `const.ts`
```typescript
export const INITIAL_ITEM: YourModuleAddRequest = {
  name: '',
  // Add default values
};
```

#### `index.ts`
```typescript
export * from './types';
export * from './api';
export * from './transformations';
export * from './const';
```

### 2. Module Components

Create `src/modules/your-module/` with this structure:

```
📂 your-module
  📂 YourModuleScreen
    📂 YourModuleScreenProvider.tsx  # Context and state management
    📂 YourModuleScreen.tsx          # Main screen
    📂 index.ts                      # Exports
  📂 YourModuleListScreen
    📂 YourModuleListScreen.tsx      # List view with search/pagination
    📂 index.ts
  📂 YourModuleDetailScreen
    📂 YourModuleDetailScreen.tsx    # Item details
    📂 index.ts
  📂 YourModuleEditScreen
    📂 YourModuleEditScreen.tsx      # Create/edit form
    📂 index.ts
  📂 index.ts                        # Module exports
```

### 3. Integration Steps

After creating your module:

#### Step 1: Add to Services Index
```typescript
// src/services/index.ts
export * from './your-module';
```

#### Step 2: Add to App Navigation
```typescript
// src/App.tsx
import { 
  YourModuleProvider, 
  YourModuleListScreen, 
  YourModuleDetailScreen, 
  YourModuleEditScreen 
} from './modules/your-module';

const YourModuleTab = () => {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'detail' | 'edit'>('list');
  const [selectedItem, setSelectedItem] = useState(null);

  // Handle navigation logic...

  return (
    <YourModuleProvider>
      {currentScreen === 'list' && (
        <YourModuleListScreen
          onItemPress={handleItemPress}
          onAddItem={handleAddItem}
        />
      )}
      {/* Add other screens */}
    </YourModuleProvider>
  );
};

// Add to MainTabs navigator
<Tab.Screen 
  name="YourModule" 
  component={YourModuleTab}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="cube" size={size} color={color} />
    ),
  }}
/>
```

## Authentication Pattern

All modules must follow the authentication pattern:

### 1. API Service
```typescript
// Always accept token and tenantId
getData: async (params, token, tenantId) => {
  return apiRequest('/endpoint', { method: 'GET', token, tenantId });
}
```

### 2. Component Usage
```typescript
import { useAuth } from '../../providers';

const YourScreen = () => {
  const { user } = useAuth(); // Get auth context
  
  const loadData = async () => {
    try {
      const response = await yourApi.getData(params, user?.token, user?.tenantId);
      // Handle response
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        // Auth error - will redirect to login
      }
    }
  };
};
```

## State Management Pattern

Use React Context + Reducer for module state:

### Provider Structure
```typescript
// State interface
interface YourModuleState {
  items: YourModule[];
  currentItem: YourModule | null;
  loading: boolean;
  error: string | null;
  pagination: PaginationInfo;
  filters: Record<string, any>;
  searchQuery: string;
}

// Actions
type YourModuleAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: { items: YourModule[]; pagination: any } }
  // Add other actions...

// Reducer
const yourModuleReducer = (state: YourModuleState, action: YourModuleAction) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    // Handle other actions...
  }
};

// Context Provider
export const YourModuleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(yourModuleReducer, initialState);
  
  // Action creators
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  
  return (
    <YourModuleContext.Provider value={{ state, setLoading, /* other actions */ }}>
      {children}
    </YourModuleContext.Provider>
  );
};
```

## UI Component Patterns

### List Screen
- ✅ Search functionality
- ✅ Pagination support
- ✅ Pull-to-refresh
- ✅ Loading states
- ✅ Error handling
- ✅ Empty state

### Detail Screen
- ✅ Item information display
- ✅ Edit/Delete actions
- ✅ Loading states
- ✅ Error handling
- ✅ Navigation back

### Edit Screen
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Cancel/Save actions

## Best Practices

### 1. TypeScript
- ✅ Use interfaces for all data structures
- ✅ Type all function parameters and return values
- ✅ Avoid `any` types
- ✅ Use proper generics for API responses

### 2. Error Handling
```typescript
try {
  const response = await api.getData(params, token, tenantId);
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.statusCode) {
      case 401: // Auth error
      case 404: // Not found
      case 500: // Server error
      default: // Other errors
    }
  }
}
```

### 3. Performance
- ✅ Use `useCallback` for functions passed to child components
- ✅ Use `useMemo` for expensive calculations
- ✅ Implement proper loading states
- ✅ Use FlatList for large datasets

### 4. Accessibility
- ✅ Add accessibility labels to important elements
- ✅ Ensure proper color contrast
- ✅ Test with screen readers

### 5. Testing
- ✅ Test authentication flows
- ✅ Test error scenarios
- ✅ Test loading states
- ✅ Test form validation

## File Naming Conventions

- ✅ **Services**: `your-module` (kebab-case)
- ✅ **Components**: `YourModuleScreen` (PascalCase)
- ✅ **Files**: `YourModuleScreen.tsx` (PascalCase)
- ✅ **Constants**: `YOUR_MODULE_CONSTANT` (UPPER_SNAKE_CASE)

## Common Issues & Solutions

### Issue: 401 Unauthorized Error
**Solution**: Ensure you're passing `user?.token` and `user?.tenantId` to all API calls.

### Issue: TypeScript errors with API responses
**Solution**: Check that your interfaces match the actual API response structure.

### Issue: Navigation not working
**Solution**: Ensure you've added the module tab to the MainTabs navigator in App.tsx.

### Issue: State not updating
**Solution**: Check that you're using the context provider and action creators correctly.

## Module Checklist

Before completing a module, verify:

- [ ] Service layer created with all CRUD operations
- [ ] Authentication integrated in all API calls
- [ ] TypeScript interfaces defined and typed correctly
- [ ] React Context provider implemented
- [ ] All screens (List, Detail, Edit) created
- [ ] Navigation integrated in App.tsx
- [ ] Service exported in services/index.ts
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Form validation added
- [ ] Accessibility considered
- [ ] Documentation updated

## Need Help?

- 📚 Check the `docs/AUTH_TEMPLATE.md` for authentication patterns
- 🔧 Use the module generator: `npm run create-module YourModule`
- 📖 Review existing modules (items, auth, notifications)
- 🐛 Check browser console for errors
- 🔍 Use Network tab to verify API calls
