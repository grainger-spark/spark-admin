import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { PurchaseOrderResponse, PurchaseOrderListParams } from '../../../services/purchaseOrders';

interface PurchaseOrdersState {
  purchaseOrders: PurchaseOrderResponse[];
  currentPurchaseOrder: PurchaseOrderResponse | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: PurchaseOrderListParams;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

type PurchaseOrdersAction =
  | { type: 'SET_PURCHASE_ORDERS'; payload: PurchaseOrderResponse[] }
  | { type: 'SET_CURRENT_PURCHASE_ORDER'; payload: PurchaseOrderResponse | null }
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrderResponse }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: PurchaseOrderResponse }
  | { type: 'DELETE_PURCHASE_ORDER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: PurchaseOrderListParams }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_PAGINATION'; payload: Partial<PurchaseOrdersState['pagination']> };

const initialState: PurchaseOrdersState = {
  purchaseOrders: [],
  currentPurchaseOrder: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {},
  pagination: {
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
  },
};

const purchaseOrdersReducer = (state: PurchaseOrdersState, action: PurchaseOrdersAction): PurchaseOrdersState => {
  switch (action.type) {
    case 'SET_PURCHASE_ORDERS':
      return { ...state, purchaseOrders: action.payload };
    case 'SET_CURRENT_PURCHASE_ORDER':
      return { ...state, currentPurchaseOrder: action.payload };
    case 'ADD_PURCHASE_ORDER':
      return { ...state, purchaseOrders: [action.payload, ...state.purchaseOrders] };
    case 'UPDATE_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        ),
        currentPurchaseOrder:
          state.currentPurchaseOrder?.id === action.payload.id ? action.payload : state.currentPurchaseOrder,
      };
    case 'DELETE_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.filter((order) => order.id !== action.payload),
        currentPurchaseOrder: state.currentPurchaseOrder?.id === action.payload ? null : state.currentPurchaseOrder,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: {}, searchQuery: '' };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    default:
      return state;
  }
};

interface PurchaseOrdersContextType {
  state: PurchaseOrdersState;
  dispatch: React.Dispatch<PurchaseOrdersAction>;
  setPurchaseOrders: (orders: PurchaseOrderResponse[]) => void;
  setCurrentPurchaseOrder: (order: PurchaseOrderResponse | null) => void;
  addPurchaseOrder: (order: PurchaseOrderResponse) => void;
  updatePurchaseOrder: (order: PurchaseOrderResponse) => void;
  deletePurchaseOrder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: PurchaseOrderListParams) => void;
  resetFilters: () => void;
  setPagination: (pagination: Partial<PurchaseOrdersState['pagination']>) => void;
}

const PurchaseOrdersContext = createContext<PurchaseOrdersContextType | undefined>(undefined);

export const PurchaseOrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(purchaseOrdersReducer, initialState);

  const setPurchaseOrders = (orders: PurchaseOrderResponse[]) => {
    dispatch({ type: 'SET_PURCHASE_ORDERS', payload: orders });
  };

  const setCurrentPurchaseOrder = (order: PurchaseOrderResponse | null) => {
    dispatch({ type: 'SET_CURRENT_PURCHASE_ORDER', payload: order });
  };

  const addPurchaseOrder = (order: PurchaseOrderResponse) => {
    dispatch({ type: 'ADD_PURCHASE_ORDER', payload: order });
  };

  const updatePurchaseOrder = (order: PurchaseOrderResponse) => {
    dispatch({ type: 'UPDATE_PURCHASE_ORDER', payload: order });
  };

  const deletePurchaseOrder = (id: string) => {
    dispatch({ type: 'DELETE_PURCHASE_ORDER', payload: id });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setFilters = (filters: PurchaseOrderListParams) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const resetFilters = () => {
    dispatch({ type: 'RESET_FILTERS' });
  };

  const setPagination = (pagination: Partial<PurchaseOrdersState['pagination']>) => {
    dispatch({ type: 'SET_PAGINATION', payload: pagination });
  };

  return (
    <PurchaseOrdersContext.Provider
      value={{
        state,
        dispatch,
        setPurchaseOrders,
        setCurrentPurchaseOrder,
        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,
        setLoading,
        setError,
        setSearchQuery,
        setFilters,
        resetFilters,
        setPagination,
      }}
    >
      {children}
    </PurchaseOrdersContext.Provider>
  );
};

export const usePurchaseOrders = (): PurchaseOrdersContextType => {
  const context = useContext(PurchaseOrdersContext);
  if (!context) {
    throw new Error('usePurchaseOrders must be used within a PurchaseOrdersProvider');
  }
  return context;
};
