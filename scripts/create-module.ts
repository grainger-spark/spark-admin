#!/usr/bin/env node

/**
 * Module Generator Script
 * 
 * Usage: npx ts-node scripts/create-module.ts YourModuleName
 * 
 * This script creates a complete module structure with:
 * - Service layer (types, api, transformations, const, index)
 * - Module components (ScreenProvider, Screen, ListScreen, DetailScreen, EditScreen)
 * - Proper authentication integration
 * - TypeScript interfaces
 * - Index files for clean exports
 */

import * as fs from 'fs';
import * as path from 'path';

const moduleName = process.argv[2];
if (!moduleName) {
  console.error('❌ Please provide a module name');
  console.log('Usage: npx ts-node scripts/create-module.ts YourModuleName');
  process.exit(1);
}

// Convert to proper naming conventions
const moduleNamePascal = moduleName.charAt(0).toUpperCase() + moduleName.slice(1);
const moduleNameLower = moduleName.toLowerCase();
const moduleNameCamel = moduleName.charAt(0).toLowerCase() + moduleName.slice(1);
const moduleNameUpper = moduleName.toUpperCase();

const baseDir = path.join(process.cwd(), 'src');

// Templates
const templates = {
  // Service Types
  types: `export interface ${moduleNamePascal}Response {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ${moduleNamePascal}AddRequest {
  name: string;
  description?: string;
}

export interface ${moduleNamePascal}UpdateRequest extends ${moduleNamePascal}AddRequest {}

export interface ${moduleNamePascal}PatchRequest {
  name?: string | null;
  description?: string | null;
}

export interface ${moduleNamePascal}ListParams {
  Page?: number;
  PageSize?: number;
  Search?: string;
  SortBy?: string;
  SortDirection?: string;
}

export interface ${moduleNamePascal}Response {
  data: ${moduleNamePascal}Response[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export type ${moduleNamePascal} = ${moduleNamePascal}Response;`,

  // Service API
  api: `import { apiRequest } from '../../helpers/api';
import { 
  ${moduleNamePascal}Response, 
  ${moduleNamePascal}AddRequest, 
  ${moduleNamePascal}UpdateRequest, 
  ${moduleNamePascal}PatchRequest,
  ${moduleNamePascal}ListParams,
  ${moduleNamePascal}Response 
} from './types';

/**
 * ${moduleNamePascal} API Service
 * 
 * IMPORTANT: All methods require authentication token and tenantId for secure API access.
 * 
 * Authentication Pattern:
 * - Always pass user?.token and user?.tenantId from useAuth() hook
 * - Handle 401 errors gracefully (will redirect to login)
 * - See README.md for complete authentication guide
 * 
 * Example Usage:
 * \`\`\`typescript
 * const { user } = useAuth();
 * const items = await ${moduleNameLower}Api.get${moduleNamePascal}s(params, user?.token, user?.tenantId);
 * \`\`\`
 */
export const ${moduleNameLower}Api = {
  /**
   * Get all ${moduleNameLower}s with pagination and filtering
   * @param params - Query parameters for pagination and filtering
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Paginated list of ${moduleNameLower}s
   */
  get${moduleNamePascal}s: async (params?: ${moduleNamePascal}ListParams, token?: string, tenantId?: string): Promise<${moduleNamePascal}Response> => {
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
    
    const url = \`/${moduleNameLower}s\${queryParams.toString() ? \`?\${queryParams.toString()}\` : ''}\`;
    return apiRequest<${moduleNamePascal}Response>(url, { method: 'GET', token, tenantId });
  },

  /**
   * Get single ${moduleNameLower} by ID
   * @param id - ${moduleNamePascal} ID to retrieve
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Single ${moduleNameLower} data
   */
  get${moduleNamePascal}: async (id: string, token?: string, tenantId?: string): Promise<${moduleNamePascal}Response> => {
    return apiRequest<${moduleNamePascal}Response>(\`/${moduleNameLower}s/\${id}\`, { method: 'GET', token, tenantId });
  },

  /**
   * Create new ${moduleNameLower}
   * @param ${moduleNameLower} - ${moduleNamePascal} data to create
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Created ${moduleNameLower} data
   */
  create${moduleNamePascal}: async (${moduleNameLower}: ${moduleNamePascal}AddRequest, token?: string, tenantId?: string): Promise<${moduleNamePascal}Response> => {
    return apiRequest<${moduleNamePascal}Response>(\`/${moduleNameLower}s\`, { method: 'POST', body: ${moduleNameLower}, token, tenantId });
  },

  /**
   * Update ${moduleNameLower} (full update)
   * @param id - ${moduleNamePascal} ID to update
   * @param ${moduleNameLower} - Complete ${moduleNameLower} data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated ${moduleNameLower} data
   */
  update${moduleNamePascal}: async (id: string, ${moduleNameLower}: ${moduleNamePascal}UpdateRequest, token?: string, tenantId?: string): Promise<${moduleNamePascal}Response> => {
    return apiRequest<${moduleNamePascal}Response>(\`/${moduleNameLower}s/\${id}\`, { method: 'PUT', body: ${moduleNameLower}, token, tenantId });
  },

  /**
   * Patch ${moduleNameLower} (partial update)
   * @param id - ${moduleNamePascal} ID to patch
   * @param ${moduleNameLower} - Partial ${moduleNameLower} data to update
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Updated ${moduleNameLower} data
   */
  patch${moduleNamePascal}: async (id: string, ${moduleNameLower}: ${moduleNamePascal}PatchRequest, token?: string, tenantId?: string): Promise<${moduleNamePascal}Response> => {
    return apiRequest<${moduleNamePascal}Response>(\`/${moduleNameLower}s/\${id}\`, { method: 'PATCH', body: ${moduleNameLower}, token, tenantId });
  },

  /**
   * Delete ${moduleNameLower}
   * @param id - ${moduleNamePascal} ID to delete
   * @param token - Authentication token from user context
   * @param tenantId - Tenant ID from user context
   * @returns Deleted ${moduleNameLower} data
   */
  delete${moduleNamePascal}: async (id: string, token?: string, tenantId?: string): Promise<${moduleNamePascal}Response> => {
    return apiRequest<${moduleNamePascal}Response>(\`/${moduleNameLower}s/\${id}\`, { method: 'DELETE', token, tenantId });
  },
};`,

  // Service Transformations
  transformations: `import { ${moduleNamePascal}Response, ${moduleNamePascal}AddRequest, ${moduleNamePascal}UpdateRequest } from './types';

export const transform${moduleNamePascal}Response = (response: any): ${moduleNamePascal}Response => {
  return {
    id: response.id || '',
    name: response.name || '',
    description: response.description || '',
    createdAt: response.createdAt || new Date().toISOString(),
    updatedAt: response.updatedAt || new Date().toISOString(),
  };
};

export const transform${moduleNamePascal}ForCreate = (${moduleNameLower}: Partial<${moduleNamePascal}AddRequest>): ${moduleNamePascal}AddRequest => {
  return {
    name: ${moduleNameLower}.name || '',
    description: ${moduleNameLower}.description || '',
  };
};

export const transform${moduleNamePascal}ForUpdate = (${moduleNameLower}: Partial<${moduleNamePascal}UpdateRequest>): ${moduleNamePascal}UpdateRequest => {
  return {
    name: ${moduleNameLower}.name || '',
    description: ${moduleNameLower}.description || '',
  };
};`,

  // Service Constants
  constants: `import { ${moduleNamePascal}AddRequest } from './types';

export const INITIAL_${moduleNamePascal.toUpperCase()}: ${moduleNamePascal}AddRequest = {
  name: '',
  description: '',
};

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const ${moduleNameUpper}_SORT_OPTIONS = {
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  CREATED_ASC: 'created_asc',
  CREATED_DESC: 'created_desc',
} as const;

export const ${moduleNameUpper}_FILTER_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;`,

  // Service Index
  serviceIndex: `// Export all from modules
export * from './types';
export * from './api';
export * from './transformations';
export * from './const';`,

  // Module Provider
  provider: `import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { ${moduleNamePascal}, ${moduleNamePascal}Response } from '../../../services/${moduleNameLower}';
import { ${moduleNameLower}Api } from '../../../services/${moduleNameLower}';

// State interface
interface ${moduleNamePascal}State {
  ${moduleNameLower}s: ${moduleNamePascal}[];
  current${moduleNamePascal}: ${moduleNamePascal} | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalCount: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: Record<string, any>;
  searchQuery: string;
}

// Action types
type ${moduleNamePascal}Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_${moduleNameUpper}_S'; payload: { ${moduleNameLower}s: ${moduleNamePascal}[]; pagination: any } }
  | { type: 'SET_CURRENT_${moduleNameUpper}'; payload: ${moduleNamePascal} | null }
  | { type: 'ADD_${moduleNameUpper}'; payload: ${moduleNamePascal} }
  | { type: 'UPDATE_${moduleNameUpper}'; payload: ${moduleNamePascal} }
  | { type: 'REMOVE_${moduleNameUpper}'; payload: string }
  | { type: 'SET_FILTERS'; payload: Record<string, any> }
  | { type: 'SET_SEARCH_QUERY'; payload: string };

// Initial state
const initialState: ${moduleNamePascal}State = {
  ${moduleNameLower}s: [],
  current${moduleNamePascal}: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  },
  filters: {},
  searchQuery: '',
};

// Reducer
const ${moduleNameLower}Reducer = (state: ${moduleNamePascal}State, action: ${moduleNamePascal}Action): ${moduleNamePascal}State => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_${moduleNameUpper}_S':
      return {
        ...state,
        ${moduleNameLower}s: action.payload.${moduleNameLower}s,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_${moduleNameUpper}':
      return { ...state, current${moduleNamePascal}: action.payload };
    case 'ADD_${moduleNameUpper}':
      return {
        ...state,
        ${moduleNameLower}s: [action.payload, ...state.${moduleNameLower}s],
        loading: false,
        error: null,
      };
    case 'UPDATE_${moduleNameUpper}':
      return {
        ...state,
        ${moduleNameLower}s: state.${moduleNameLower}s.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        current${moduleNamePascal}: action.payload,
        loading: false,
        error: null,
      };
    case 'REMOVE_${moduleNameUpper}':
      return {
        ...state,
        ${moduleNameLower}s: state.${moduleNameLower}s.filter(item => item.id !== action.payload),
        current${moduleNamePascal}: null,
        loading: false,
        error: null,
      };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    default:
      return state;
  }
};

// Context
interface ${moduleNamePascal}ContextType {
  state: ${moduleNamePascal}State;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  set${moduleNamePascal}s: (response: ${moduleNamePascal}Response) => void;
  setCurrent${moduleNamePascal}: (${moduleNameLower}: ${moduleNamePascal} | null) => void;
  add${moduleNamePascal}: (${moduleNameLower}: ${moduleNamePascal}) => void;
  update${moduleNamePascal}: (${moduleNameLower}: ${moduleNamePascal}) => void;
  remove${moduleNamePascal}: (id: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const ${moduleNamePascal}Context = createContext<${moduleNamePascal}ContextType | undefined>(undefined);

export const ${moduleNamePascal}Provider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(${moduleNameLower}Reducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const set${moduleNamePascal}s = (response: ${moduleNamePascal}Response) => 
    dispatch({ type: 'SET_${moduleNameUpper}_S', payload: { ${moduleNameLower}s: response.data, pagination: response.meta } });
  const setCurrent${moduleNamePascal} = (${moduleNameLower}: ${moduleNamePascal} | null) => dispatch({ type: 'SET_CURRENT_${moduleNameUpper}', payload: ${moduleNameLower} });
  const add${moduleNamePascal} = (${moduleNameLower}: ${moduleNamePascal}) => dispatch({ type: 'ADD_${moduleNameUpper}', payload: ${moduleNameLower} });
  const update${moduleNamePascal} = (${moduleNameLower}: ${moduleNamePascal}) => dispatch({ type: 'UPDATE_${moduleNameUpper}', payload: ${moduleNameLower} });
  const remove${moduleNamePascal} = (id: string) => dispatch({ type: 'REMOVE_${moduleNameUpper}', payload: id });
  const setFilters = (filters: Record<string, any>) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const setSearchQuery = (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  const resetFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: {} });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
  };

  return (
    <${moduleNamePascal}Context.Provider value={{
      state,
      setLoading,
      setError,
      set${moduleNamePascal}s,
      setCurrent${moduleNamePascal},
      add${moduleNamePascal},
      update${moduleNamePascal},
      remove${moduleNamePascal},
      setFilters,
      setSearchQuery,
      resetFilters,
    }}>
      {children}
    </${moduleNamePascal}Context.Provider>
  );
};

export const use${moduleNamePascal}s = () => {
  const context = useContext(${moduleNamePascal}Context);
  if (!context) {
    throw new Error(\`use${moduleNamePascal}s must be used within ${moduleNamePascal}Provider\`);
  }
  return context;
};`,

  // Main Screen
  screen: `import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { use${moduleNamePascal}s } from './${moduleNamePascal}ScreenProvider';

const ${moduleNamePascal}Screen: React.FC = () => {
  const { state } = use${moduleNamePascal}s();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>${moduleNamePascal}s</Text>
      <Text style={styles.subtitle}>
        Total: {state.pagination.totalCount} ${moduleNameLower}s
      </Text>
      
      {state.loading && (
        <Text style={styles.loadingText}>Loading...</Text>
      )}
      
      {state.error && (
        <Text style={styles.errorText}>{state.error}</Text>
      )}
      
      {/* ${moduleNamePascal} list will be rendered here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#ff0000',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ${moduleNamePascal}Screen;`,

  // List Screen
  listScreen: `import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { use${moduleNamePascal}s } from '../${moduleNamePascal}Screen/${moduleNamePascal}ScreenProvider';
import { useAuth } from '../../../providers';
import { ${moduleNameLower}Api, ${moduleNamePascal} } from '../../../services/${moduleNameLower}';

interface ${moduleNamePascal}ListScreenProps {
  on${moduleNamePascal}Press: (${moduleNameLower}: ${moduleNamePascal}) => void;
  onAdd${moduleNamePascal}: () => void;
}

const ${moduleNamePascal}ListScreen: React.FC<${moduleNamePascal}ListScreenProps> = ({ on${moduleNamePascal}Press, onAdd${moduleNamePascal} }) => {
  const { state, setLoading, setError, set${moduleNamePascal}s, setSearchQuery } = use${moduleNamePascal}s();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const load${moduleNamePascal}s = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const params = {
        Page: page,
        PageSize: state.pagination.pageSize,
        Search: search || undefined,
        ...state.filters,
      };
      const response = await ${moduleNameLower}Api.get${moduleNamePascal}s(params, user?.token, user?.tenantId);
      set${moduleNamePascal}s(response);
    } catch (error) {
      console.error('Failed to load ${moduleNameLower}s:', error);
      setError(error instanceof Error ? error.message : 'Failed to load ${moduleNameLower}s');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [state.filters, state.pagination.pageSize, setLoading, set${moduleNamePascal}s, setError, user]);

  useEffect(() => {
    load${moduleNamePascal}s(1, state.searchQuery);
  }, [state.filters, state.searchQuery, load${moduleNamePascal}s]);

  const handleRefresh = () => {
    setRefreshing(true);
    load${moduleNamePascal}s(1, state.searchQuery);
  };

  const render${moduleNamePascal} = ({ item }: { item: ${moduleNamePascal} }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => on${moduleNamePascal}Press(item)}
    >
      <Text style={styles.itemName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.itemDescription}>{item.description}</Text>
      )}
      <Text style={styles.itemDate}>
        Created: {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search ${moduleNameLower}s..."
          value={state.searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAdd${moduleNamePascal}}>
        <Text style={styles.addButtonText}>+ Add ${moduleNamePascal}</Text>
      </TouchableOpacity>

      {/* List */}
      <FlatList
        data={state.${moduleNameLower}s}
        renderItem={render${moduleNamePascal}}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          !state.loading ? (
            <Text style={styles.emptyText}>No ${moduleNameLower}s found</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  itemContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    color: '#999',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 50,
    fontSize: 16,
  },
});

export default ${moduleNamePascal}ListScreen;`,

  // Detail Screen
  detailScreen: `import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { use${moduleNamePascal}s } from '../${moduleNamePascal}Screen/${moduleNamePascal}ScreenProvider';
import { useAuth } from '../../../providers';
import { ${moduleNameLower}Api, ${moduleNamePascal} } from '../../../services/${moduleNameLower}';

interface ${moduleNamePascal}DetailScreenProps {
  ${moduleNameLower}Id: string;
  onEdit: (${moduleNameLower}: ${moduleNamePascal}) => void;
  onDelete: (${moduleNameLower}: ${moduleNamePascal}) => void;
  onBack: () => void;
}

const ${moduleNamePascal}DetailScreen: React.FC<${moduleNamePascal}DetailScreenProps> = ({
  ${moduleNameLower}Id,
  onEdit,
  onDelete,
  onBack,
}) => {
  const { state, setLoading, setError, setCurrent${moduleNamePascal} } = use${moduleNamePascal}s();
  const { user } = useAuth();
  const [${moduleNameLower}, set${moduleNamePascal}] = useState<${moduleNamePascal} | null>(null);

  const load${moduleNamePascal} = useCallback(async () => {
    try {
      setLoading(true);
      const ${moduleNameLower}Data = await ${moduleNameLower}Api.get${moduleNamePascal}(${moduleNameLower}Id, user?.token, user?.tenantId);
      set${moduleNamePascal}(${moduleNameLower}Data);
      setCurrent${moduleNamePascal}(${moduleNameLower}Data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load ${moduleNameLower}');
    } finally {
      setLoading(false);
    }
  }, [${moduleNameLower}Id, setLoading, setError, setCurrent${moduleNamePascal}, user]);

  useEffect(() => {
    load${moduleNamePascal}();
  }, [load${moduleNamePascal}]);

  const handleDelete = () => {
    if (!${moduleNameLower}) return;
    
    Alert.alert(
      'Delete ${moduleNamePascal}',
      \`Are you sure you want to delete "\${${moduleNameLower}.name}"? This action cannot be undone.\`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(${moduleNameLower}),
        },
      ]
    );
  };

  const InfoRow: React.FC<{ label: string; value: string | number | null | undefined }> = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'N/A'}</Text>
    </View>
  );

  if (state.loading && !${moduleNameLower}) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading ${moduleNameLower}...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{state.error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={load${moduleNamePascal}}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!${moduleNameLower}) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>${moduleNamePascal} not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onBack}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(${moduleNameLower})}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <InfoRow label="Name" value={${moduleNameLower}.name} />
          <InfoRow label="Description" value={${moduleNameLower}.description} />
          <InfoRow label="ID" value={${moduleNameLower}.id} />
        </View>

        {/* Dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dates</Text>
          <InfoRow 
            label="Created At" 
            value={new Date(${moduleNameLower}.createdAt).toLocaleString()} 
          />
          <InfoRow 
            label="Updated At" 
            value={new Date(${moduleNameLower}.updatedAt).toLocaleString()} 
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    flex: 2,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ${moduleNamePascal}DetailScreen;`,

  // Edit Screen
  editScreen: `import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { use${moduleNamePascal}s } from '../${moduleNamePascal}Screen/${moduleNamePascal}ScreenProvider';
import { useAuth } from '../../../providers';
import { ${moduleNameLower}Api, ${moduleNamePascal}, ${moduleNamePascal}AddRequest, INITIAL_${moduleNamePascal.toUpperCase()} } from '../../../services/${moduleNameLower}';

interface ${moduleNamePascal}EditScreenProps {
  ${moduleNameLower}?: ${moduleNamePascal} | null;
  onSave: (${moduleNameLower}: ${moduleNamePascal}) => void;
  onCancel: () => void;
}

const ${moduleNamePascal}EditScreen: React.FC<${moduleNamePascal}EditScreenProps> = ({ ${moduleNameLower}, onSave, onCancel }) => {
  const { state, setLoading, setError, add${moduleNamePascal}, update${moduleNamePascal} } = use${moduleNamePascal}s();
  const { user } = useAuth();
  const [formData, setFormData] = useState<${moduleNamePascal}AddRequest>(INITIAL_${moduleNamePascal.toUpperCase()});

  useEffect(() => {
    if (${moduleNameLower}) {
      // Load existing ${moduleNameLower} data for editing
      setFormData({
        name: ${moduleNameLower}.name || '',
        description: ${moduleNameLower}.description || '',
      });
    }
  }, [${moduleNameLower}]);

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Validation
      if (!formData.name?.trim()) {
        Alert.alert('Validation Error', '${moduleNamePascal} name is required');
        return;
      }

      let saved${moduleNamePascal}: ${moduleNamePascal};
      
      if (${moduleNameLower}) {
        // Update existing ${moduleNameLower}
        saved${moduleNamePascal} = await ${moduleNameLower}Api.update${moduleNamePascal}(${moduleNameLower}.id, formData, user?.token, user?.tenantId);
        update${moduleNamePascal}(saved${moduleNamePascal});
      } else {
        // Create new ${moduleNameLower}
        saved${moduleNamePascal} = await ${moduleNameLower}Api.create${moduleNamePascal}(formData, user?.token, user?.tenantId);
        add${moduleNamePascal}(saved${moduleNamePascal});
      }
      
      onSave(saved${moduleNamePascal});
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save ${moduleNameLower}');
      Alert.alert('Error', 'Failed to save ${moduleNameLower}. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof ${moduleNamePascal}AddRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (state.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Saving ${moduleNameLower}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{${moduleNameLower} ? 'Edit' : 'New'} ${moduleNamePascal}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              placeholder="Enter ${moduleNameLower} name"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(value) => updateFormData('description', value)}
              placeholder="Enter ${moduleNameLower} description"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});

export default ${moduleNamePascal}EditScreen;`,

  // Index files
  providerIndex: `export { ${moduleNamePascal}Provider, use${moduleNamePascal}s } from './${moduleNamePascal}ScreenProvider';
export { default as ${moduleNamePascal}Screen } from './${moduleNamePascal}Screen';`,

  listScreenIndex: `export { default as ${moduleNamePascal}ListScreen } from './${moduleNamePascal}ListScreen';`,

  detailScreenIndex: `export { default as ${moduleNamePascal}DetailScreen } from './${moduleNamePascal}DetailScreen';`,

  editScreenIndex: `export { default as ${moduleNamePascal}EditScreen } from './${moduleNamePascal}EditScreen';`,

  moduleIndex: `export { ${moduleNamePascal}Provider, use${moduleNamePascal}s } from './${moduleNamePascal}Screen';
export { default as ${moduleNamePascal}Screen } from './${moduleNamePascal}Screen';
export { default as ${moduleNamePascal}ListScreen } from './${moduleNamePascal}ListScreen';
export { default as ${moduleNamePascal}DetailScreen } from './${moduleNamePascal}DetailScreen';
export { default as ${moduleNamePascal}EditScreen } from './${moduleNamePascal}EditScreen';`,
};

// Create directories and files
function createModule() {
  console.log(`🚀 Creating ${moduleNamePascal} module...`);

  // Create service directory and files
  const serviceDir = path.join(baseDir, 'services', moduleNameLower);
  if (!fs.existsSync(serviceDir)) {
    fs.mkdirSync(serviceDir, { recursive: true });
  }

  const serviceFiles = {
    'types.ts': templates.types,
    'api.ts': templates.api,
    'transformations.ts': templates.transformations,
    'const.ts': templates.constants,
    'index.ts': templates.serviceIndex,
  };

  Object.entries(serviceFiles).forEach(([file, content]) => {
    const filePath = path.join(serviceDir, file);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created src/services/${moduleNameLower}/${file}`);
  });

  // Create module directory and files
  const moduleDir = path.join(baseDir, 'modules', moduleNameLower);
  if (!fs.existsSync(moduleDir)) {
    fs.mkdirSync(moduleDir, { recursive: true });
  }

  // Create ${moduleNamePascal}Screen directory
  const screenDir = path.join(moduleDir, `${moduleNamePascal}Screen`);
  if (!fs.existsSync(screenDir)) {
    fs.mkdirSync(screenDir, { recursive: true });
  }

  const screenFiles = {
    [`${moduleNamePascal}ScreenProvider.tsx`]: templates.provider,
    [`${moduleNamePascal}Screen.tsx`]: templates.screen,
    'index.ts': templates.providerIndex,
  };

  Object.entries(screenFiles).forEach(([file, content]) => {
    const filePath = path.join(screenDir, file);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created src/modules/${moduleNameLower}/${moduleNamePascal}Screen/${file}`);
  });

  // Create ListScreen directory
  const listDir = path.join(moduleDir, `${moduleNamePascal}ListScreen`);
  if (!fs.existsSync(listDir)) {
    fs.mkdirSync(listDir, { recursive: true });
  }

  fs.writeFileSync(path.join(listDir, `${moduleNamePascal}ListScreen.tsx`), templates.listScreen);
  fs.writeFileSync(path.join(listDir, 'index.ts'), templates.listScreenIndex);
  console.log(`✅ Created src/modules/${moduleNameLower}/${moduleNamePascal}ListScreen/`);

  // Create DetailScreen directory
  const detailDir = path.join(moduleDir, `${moduleNamePascal}DetailScreen`);
  if (!fs.existsSync(detailDir)) {
    fs.mkdirSync(detailDir, { recursive: true });
  }

  fs.writeFileSync(path.join(detailDir, `${moduleNamePascal}DetailScreen.tsx`), templates.detailScreen);
  fs.writeFileSync(path.join(detailDir, 'index.ts'), templates.detailScreenIndex);
  console.log(`✅ Created src/modules/${moduleNameLower}/${moduleNamePascal}DetailScreen/`);

  // Create EditScreen directory
  const editDir = path.join(moduleDir, `${moduleNamePascal}EditScreen`);
  if (!fs.existsSync(editDir)) {
    fs.mkdirSync(editDir, { recursive: true });
  }

  fs.writeFileSync(path.join(editDir, `${moduleNamePascal}EditScreen.tsx`), templates.editScreen);
  fs.writeFileSync(path.join(editDir, 'index.ts'), templates.editScreenIndex);
  console.log(`✅ Created src/modules/${moduleNameLower}/${moduleNamePascal}EditScreen/`);

  // Create module index
  fs.writeFileSync(path.join(moduleDir, 'index.ts'), templates.moduleIndex);
  console.log(`✅ Created src/modules/${moduleNameLower}/index.ts`);

  console.log(`\\n🎉 ${moduleNamePascal} module created successfully!`);
  console.log(`\\n📝 Next steps:`);
  console.log(`1. Add ${moduleNameLower} to src/services/index.ts`);
  console.log(`2. Add ${moduleNamePascal}Tab to App.tsx`);
  console.log(`3. Customize the types and API endpoints`);
  console.log(`4. Update the UI components as needed`);
  console.log(`\\n📚 See docs/AUTH_TEMPLATE.md for authentication patterns`);
}

// Run the script
createModule();
