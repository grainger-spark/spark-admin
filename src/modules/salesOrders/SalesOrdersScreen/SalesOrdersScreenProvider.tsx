import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { SalesOrder, SalesOrderListParams, PagedSalesOrdersResponse } from '../../../services/salesOrders';

// State interface
interface SalesOrdersState {
  salesOrders: SalesOrder[];
  currentSalesOrder: SalesOrder | null;
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
  filters: SalesOrderListParams;
  searchQuery: string;
}

// Action types
type SalesOrdersAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SALES_ORDERS'; payload: { salesOrders: SalesOrder[]; pagination: any } }
  | { type: 'SET_CURRENT_SALES_ORDER'; payload: SalesOrder | null }
  | { type: 'ADD_SALES_ORDER'; payload: SalesOrder }
  | { type: 'UPDATE_SALES_ORDER'; payload: SalesOrder }
  | { type: 'REMOVE_SALES_ORDER'; payload: string }
  | { type: 'SET_FILTERS'; payload: SalesOrderListParams }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: SalesOrdersState = {
  salesOrders: [],
  currentSalesOrder: null,
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
const salesOrdersReducer = (state: SalesOrdersState, action: SalesOrdersAction): SalesOrdersState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SALES_ORDERS':
      return {
        ...state,
        salesOrders: action.payload.salesOrders,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_SALES_ORDER':
      return { ...state, currentSalesOrder: action.payload };
    case 'ADD_SALES_ORDER':
      return {
        ...state,
        salesOrders: [action.payload, ...state.salesOrders],
        loading: false,
        error: null,
      };
    case 'UPDATE_SALES_ORDER':
      return {
        ...state,
        salesOrders: state.salesOrders.map(order =>
          order.id === action.payload.id ? action.payload : order
        ),
        currentSalesOrder: state.currentSalesOrder?.id === action.payload.id ? action.payload : state.currentSalesOrder,
        loading: false,
        error: null,
      };
    case 'REMOVE_SALES_ORDER':
      return {
        ...state,
        salesOrders: state.salesOrders.filter(order => order.id !== action.payload),
        currentSalesOrder: state.currentSalesOrder?.id === action.payload ? null : state.currentSalesOrder,
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
interface SalesOrdersContextType {
  state: SalesOrdersState;
  dispatch: React.Dispatch<SalesOrdersAction>;
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSalesOrders: (response: PagedSalesOrdersResponse) => void;
  setCurrentSalesOrder: (order: SalesOrder | null) => void;
  addSalesOrder: (order: SalesOrder) => void;
  updateSalesOrder: (order: SalesOrder) => void;
  removeSalesOrder: (id: string) => void;
  setFilters: (filters: SalesOrderListParams) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const SalesOrdersContext = createContext<SalesOrdersContextType | undefined>(undefined);

export const SalesOrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(salesOrdersReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setSalesOrders = (response: PagedSalesOrdersResponse) => 
    dispatch({ type: 'SET_SALES_ORDERS', payload: { salesOrders: response.data, pagination: response.meta } });
  const setCurrentSalesOrder = (order: SalesOrder | null) => dispatch({ type: 'SET_CURRENT_SALES_ORDER', payload: order });
  const addSalesOrder = (order: SalesOrder) => dispatch({ type: 'ADD_SALES_ORDER', payload: order });
  const updateSalesOrder = (order: SalesOrder) => dispatch({ type: 'UPDATE_SALES_ORDER', payload: order });
  const removeSalesOrder = (id: string) => dispatch({ type: 'REMOVE_SALES_ORDER', payload: id });
  const setFilters = (filters: SalesOrderListParams) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const setSearchQuery = (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const contextValue: SalesOrdersContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setSalesOrders,
    setCurrentSalesOrder,
    addSalesOrder,
    updateSalesOrder,
    removeSalesOrder,
    setFilters,
    setSearchQuery,
    resetFilters,
  };

  return (
    <SalesOrdersContext.Provider value={contextValue}>
      {children}
    </SalesOrdersContext.Provider>
  );
};

export const useSalesOrders = (): SalesOrdersContextType => {
  const context = useContext(SalesOrdersContext);
  if (context === undefined) {
    throw new Error('useSalesOrders must be used within a SalesOrdersProvider');
  }
  return context;
};
