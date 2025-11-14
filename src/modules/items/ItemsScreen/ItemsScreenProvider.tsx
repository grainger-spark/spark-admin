import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Item, ItemsListParams, PagedItemsResponse } from '../../../services/items';

interface ItemsState {
  items: Item[];
  currentItem: Item | null;
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
  filters: ItemsListParams;
  searchQuery: string;
}

type ItemsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ITEMS'; payload: { items: Item[]; pagination: ItemsState['pagination'] } }
  | { type: 'SET_CURRENT_ITEM'; payload: Item | null }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'UPDATE_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'SET_FILTERS'; payload: ItemsListParams }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET_FILTERS' };

const initialState: ItemsState = {
  items: [],
  currentItem: null,
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

const itemsReducer = (state: ItemsState, action: ItemsAction): ItemsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ITEMS':
      return {
        ...state,
        items: action.payload.items,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_ITEM':
      return { ...state, currentItem: action.payload };
    case 'ADD_ITEM':
      return {
        ...state,
        items: [action.payload, ...state.items],
        loading: false,
        error: null,
      };
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        currentItem: state.currentItem?.id === action.payload.id ? action.payload : state.currentItem,
        loading: false,
        error: null,
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload),
        currentItem: state.currentItem?.id === action.payload ? null : state.currentItem,
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

interface ItemsContextType {
  state: ItemsState;
  dispatch: React.Dispatch<ItemsAction>;
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setItems: (response: PagedItemsResponse) => void;
  setCurrentItem: (item: Item | null) => void;
  addItem: (item: Item) => void;
  updateItem: (item: Item) => void;
  removeItem: (id: string) => void;
  setFilters: (filters: ItemsListParams) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const ItemsContext = createContext<ItemsContextType | undefined>(undefined);

export const ItemsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(itemsReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setItems = (response: PagedItemsResponse) => 
    dispatch({ type: 'SET_ITEMS', payload: { items: response.data, pagination: response.meta } });
  const setCurrentItem = (item: Item | null) => dispatch({ type: 'SET_CURRENT_ITEM', payload: item });
  const addItem = (item: Item) => dispatch({ type: 'ADD_ITEM', payload: item });
  const updateItem = (item: Item) => dispatch({ type: 'UPDATE_ITEM', payload: item });
  const removeItem = (id: string) => dispatch({ type: 'REMOVE_ITEM', payload: id });
  const setFilters = (filters: ItemsListParams) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const setSearchQuery = (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const contextValue: ItemsContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setItems,
    setCurrentItem,
    addItem,
    updateItem,
    removeItem,
    setFilters,
    setSearchQuery,
    resetFilters,
  };

  return (
    <ItemsContext.Provider value={contextValue}>
      {children}
    </ItemsContext.Provider>
  );
};

export const useItems = (): ItemsContextType => {
  const context = useContext(ItemsContext);
  if (context === undefined) {
    throw new Error('useItems must be used within an ItemsProvider');
  }
  return context;
};
