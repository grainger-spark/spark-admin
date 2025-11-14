import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Warehouse, WarehouseListParams, PagedWarehousesResponse } from '../../../services/warehouses';

// State interface
interface WarehousesState {
  warehouses: Warehouse[];
  currentWarehouse: Warehouse | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
  filters: WarehouseListParams;
  searchQuery: string;
}

// Action types
type WarehousesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_WAREHOUSES'; payload: { warehouses: Warehouse[]; pagination: any } }
  | { type: 'SET_CURRENT_WAREHOUSE'; payload: Warehouse | null }
  | { type: 'ADD_WAREHOUSE'; payload: Warehouse }
  | { type: 'UPDATE_WAREHOUSE'; payload: Warehouse }
  | { type: 'REMOVE_WAREHOUSE'; payload: string }
  | { type: 'SET_FILTERS'; payload: WarehouseListParams }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: WarehousesState = {
  warehouses: [],
  currentWarehouse: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    pageSize: 20,
    totalCount: 0,
    hasPrevious: false,
    hasNext: false,
  },
  filters: {
    Page: 1,
    PageSize: 20,
  },
  searchQuery: '',
};

// Reducer
const warehousesReducer = (state: WarehousesState, action: WarehousesAction): WarehousesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_WAREHOUSES':
      return {
        ...state,
        warehouses: action.payload.warehouses,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_WAREHOUSE':
      return { ...state, currentWarehouse: action.payload };
    case 'ADD_WAREHOUSE':
      return {
        ...state,
        warehouses: [action.payload, ...state.warehouses],
        loading: false,
        error: null,
      };
    case 'UPDATE_WAREHOUSE':
      return {
        ...state,
        warehouses: state.warehouses.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        currentWarehouse: state.currentWarehouse?.id === action.payload.id ? action.payload : state.currentWarehouse,
        loading: false,
        error: null,
      };
    case 'REMOVE_WAREHOUSE':
      return {
        ...state,
        warehouses: state.warehouses.filter(item => item.id !== action.payload),
        currentWarehouse: state.currentWarehouse?.id === action.payload ? null : state.currentWarehouse,
        loading: false,
        error: null,
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { Page: 1, PageSize: 20 },
        searchQuery: '',
      };
    default:
      return state;
  }
};

// Context
interface WarehousesContextType {
  state: WarehousesState;
  dispatch: React.Dispatch<WarehousesAction>;
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setWarehouses: (response: PagedWarehousesResponse) => void;
  setCurrentWarehouse: (warehouse: Warehouse | null) => void;
  addWarehouse: (warehouse: Warehouse) => void;
  updateWarehouse: (warehouse: Warehouse) => void;
  removeWarehouse: (id: string) => void;
  setFilters: (filters: WarehouseListParams) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const WarehousesContext = createContext<WarehousesContextType | undefined>(undefined);

export const WarehousesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(warehousesReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setWarehouses = (response: PagedWarehousesResponse) => 
    dispatch({ type: 'SET_WAREHOUSES', payload: { warehouses: response.data, pagination: response.meta } });
  const setCurrentWarehouse = (warehouse: Warehouse | null) => dispatch({ type: 'SET_CURRENT_WAREHOUSE', payload: warehouse });
  const addWarehouse = (warehouse: Warehouse) => dispatch({ type: 'ADD_WAREHOUSE', payload: warehouse });
  const updateWarehouse = (warehouse: Warehouse) => dispatch({ type: 'UPDATE_WAREHOUSE', payload: warehouse });
  const removeWarehouse = (id: string) => dispatch({ type: 'REMOVE_WAREHOUSE', payload: id });
  const setFilters = (filters: WarehouseListParams) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const setSearchQuery = (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const contextValue: WarehousesContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setWarehouses,
    setCurrentWarehouse,
    addWarehouse,
    updateWarehouse,
    removeWarehouse,
    setFilters,
    setSearchQuery,
    resetFilters,
  };

  return (
    <WarehousesContext.Provider value={contextValue}>
      {children}
    </WarehousesContext.Provider>
  );
};

export const useWarehouses = (): WarehousesContextType => {
  const context = useContext(WarehousesContext);
  if (context === undefined) {
    throw new Error('useWarehouses must be used within a WarehousesProvider');
  }
  return context;
};