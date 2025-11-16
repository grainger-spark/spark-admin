import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  PickList,
  PickListListParams,
  PagedPickListsResponse,
  PickListItem,
  PickListItemLocation,
} from '../../services/salesOrders';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface PickListState {
  pickLists: PickList[];
  currentPickList: PickList | null;
  currentItem: PickListItem | null;
  itemLocations: PickListItemLocation[];
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
  filters: PickListListParams;
}

// ============================================================================
// ACTION TYPES
// ============================================================================

type PickListAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PICK_LISTS'; payload: { pickLists: PickList[]; pagination: any } }
  | { type: 'SET_CURRENT_PICK_LIST'; payload: PickList | null }
  | { type: 'SET_CURRENT_ITEM'; payload: PickListItem | null }
  | { type: 'SET_ITEM_LOCATIONS'; payload: PickListItemLocation[] }
  | { type: 'UPDATE_PICK_LIST'; payload: PickList }
  | { type: 'SET_FILTERS'; payload: PickListListParams }
  | { type: 'RESET_FILTERS' };

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: PickListState = {
  pickLists: [],
  currentPickList: null,
  currentItem: null,
  itemLocations: [],
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

// ============================================================================
// REDUCER
// ============================================================================

const pickListReducer = (state: PickListState, action: PickListAction): PickListState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_PICK_LISTS':
      return {
        ...state,
        pickLists: action.payload.pickLists,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_PICK_LIST':
      return { ...state, currentPickList: action.payload };
    case 'SET_CURRENT_ITEM':
      return { ...state, currentItem: action.payload };
    case 'SET_ITEM_LOCATIONS':
      return { ...state, itemLocations: action.payload };
    case 'UPDATE_PICK_LIST':
      return {
        ...state,
        pickLists: state.pickLists.map(pl =>
          pl.id === action.payload.id ? action.payload : pl
        ),
        currentPickList: state.currentPickList?.id === action.payload.id 
          ? action.payload 
          : state.currentPickList,
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

// ============================================================================
// CONTEXT
// ============================================================================

interface PickListContextType {
  state: PickListState;
  dispatch: React.Dispatch<PickListAction>;
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPickLists: (response: PagedPickListsResponse) => void;
  setCurrentPickList: (pickList: PickList | null) => void;
  setCurrentItem: (item: PickListItem | null) => void;
  setItemLocations: (locations: PickListItemLocation[]) => void;
  updatePickList: (pickList: PickList) => void;
  setFilters: (filters: PickListListParams) => void;
  resetFilters: () => void;
}

const PickListContext = createContext<PickListContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export const PickListProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(pickListReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setPickLists = (response: PagedPickListsResponse) =>
    dispatch({ type: 'SET_PICK_LISTS', payload: { pickLists: response.data, pagination: response.meta } });
  const setCurrentPickList = (pickList: PickList | null) =>
    dispatch({ type: 'SET_CURRENT_PICK_LIST', payload: pickList });
  const setCurrentItem = (item: PickListItem | null) =>
    dispatch({ type: 'SET_CURRENT_ITEM', payload: item });
  const setItemLocations = (locations: PickListItemLocation[]) =>
    dispatch({ type: 'SET_ITEM_LOCATIONS', payload: locations });
  const updatePickList = (pickList: PickList) =>
    dispatch({ type: 'UPDATE_PICK_LIST', payload: pickList });
  const setFilters = (filters: PickListListParams) =>
    dispatch({ type: 'SET_FILTERS', payload: filters });
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const contextValue: PickListContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setPickLists,
    setCurrentPickList,
    setCurrentItem,
    setItemLocations,
    updatePickList,
    setFilters,
    resetFilters,
  };

  return (
    <PickListContext.Provider value={contextValue}>
      {children}
    </PickListContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const usePickList = (): PickListContextType => {
  const context = useContext(PickListContext);
  if (context === undefined) {
    throw new Error('usePickList must be used within a PickListProvider');
  }
  return context;
};
