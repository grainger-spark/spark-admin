import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ShipList,
  ShipListListParams,
  PagedShipListsResponse,
  ShipListPackage,
} from '../../services/salesOrders';

interface ShipListState {
  shipLists: ShipList[];
  currentShipList: ShipList | null;
  currentPackage: ShipListPackage | null;
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
  filters: ShipListListParams;
}

type ShipListAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SHIP_LISTS'; payload: { shipLists: ShipList[]; pagination: any } }
  | { type: 'SET_CURRENT_SHIP_LIST'; payload: ShipList | null }
  | { type: 'SET_CURRENT_PACKAGE'; payload: ShipListPackage | null }
  | { type: 'UPDATE_SHIP_LIST'; payload: ShipList }
  | { type: 'SET_FILTERS'; payload: ShipListListParams }
  | { type: 'RESET_FILTERS' };

const initialState: ShipListState = {
  shipLists: [],
  currentShipList: null,
  currentPackage: null,
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
    page: 1,
    pageSize: 20,
  },
};

const shipListReducer = (state: ShipListState, action: ShipListAction): ShipListState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_SHIP_LISTS':
      return {
        ...state,
        shipLists: action.payload.shipLists,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_SHIP_LIST':
      return { ...state, currentShipList: action.payload };
    case 'SET_CURRENT_PACKAGE':
      return { ...state, currentPackage: action.payload };
    case 'UPDATE_SHIP_LIST':
      return {
        ...state,
        shipLists: state.shipLists.map(sl =>
          sl.id === action.payload.id ? action.payload : sl
        ),
        currentShipList: state.currentShipList?.id === action.payload.id 
          ? action.payload 
          : state.currentShipList,
        loading: false,
        error: null,
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: { page: 1, pageSize: 20 },
      };
    default:
      return state;
  }
};

interface ShipListContextType {
  state: ShipListState;
  dispatch: React.Dispatch<ShipListAction>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setShipLists: (response: PagedShipListsResponse) => void;
  setCurrentShipList: (shipList: ShipList | null) => void;
  setCurrentPackage: (pkg: ShipListPackage | null) => void;
  updateShipList: (shipList: ShipList) => void;
  setFilters: (filters: ShipListListParams) => void;
  resetFilters: () => void;
}

const ShipListContext = createContext<ShipListContextType | undefined>(undefined);

export const ShipListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(shipListReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setShipLists = (response: PagedShipListsResponse) =>
    dispatch({ type: 'SET_SHIP_LISTS', payload: { shipLists: response.data, pagination: response.meta } });
  const setCurrentShipList = (shipList: ShipList | null) =>
    dispatch({ type: 'SET_CURRENT_SHIP_LIST', payload: shipList });
  const setCurrentPackage = (pkg: ShipListPackage | null) =>
    dispatch({ type: 'SET_CURRENT_PACKAGE', payload: pkg });
  const updateShipList = (shipList: ShipList) =>
    dispatch({ type: 'UPDATE_SHIP_LIST', payload: shipList });
  const setFilters = (filters: ShipListListParams) =>
    dispatch({ type: 'SET_FILTERS', payload: filters });
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const contextValue: ShipListContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setShipLists,
    setCurrentShipList,
    setCurrentPackage,
    updateShipList,
    setFilters,
    resetFilters,
  };

  return (
    <ShipListContext.Provider value={contextValue}>
      {children}
    </ShipListContext.Provider>
  );
};

export const useShipList = (): ShipListContextType => {
  const context = useContext(ShipListContext);
  if (context === undefined) {
    throw new Error('useShipList must be used within a ShipListProvider');
  }
  return context;
};
