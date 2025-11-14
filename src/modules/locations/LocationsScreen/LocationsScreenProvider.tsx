import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Location, LocationListParams, PagedLocationsResponse } from '../../../services/locations';

// State interface
interface LocationsState {
  locations: Location[];
  currentLocation: Location | null;
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
  filters: LocationListParams;
  searchQuery: string;
}

// Action types
type LocationsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LOCATIONS'; payload: { locations: Location[]; pagination: any } }
  | { type: 'SET_CURRENT_LOCATION'; payload: Location | null }
  | { type: 'ADD_LOCATION'; payload: Location }
  | { type: 'UPDATE_LOCATION'; payload: Location }
  | { type: 'REMOVE_LOCATION'; payload: string }
  | { type: 'SET_FILTERS'; payload: LocationListParams }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: LocationsState = {
  locations: [],
  currentLocation: null,
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
const locationsReducer = (state: LocationsState, action: LocationsAction): LocationsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_LOCATIONS':
      return {
        ...state,
        locations: action.payload.locations,
        pagination: action.payload.pagination,
        loading: false,
        error: null,
      };
    case 'SET_CURRENT_LOCATION':
      return { ...state, currentLocation: action.payload };
    case 'ADD_LOCATION':
      return {
        ...state,
        locations: [action.payload, ...state.locations],
        loading: false,
        error: null,
      };
    case 'UPDATE_LOCATION':
      return {
        ...state,
        locations: state.locations.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        currentLocation: state.currentLocation?.id === action.payload.id ? action.payload : state.currentLocation,
        loading: false,
        error: null,
      };
    case 'REMOVE_LOCATION':
      return {
        ...state,
        locations: state.locations.filter(item => item.id !== action.payload),
        currentLocation: state.currentLocation?.id === action.payload ? null : state.currentLocation,
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
interface LocationsContextType {
  state: LocationsState;
  dispatch: React.Dispatch<LocationsAction>;
  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLocations: (response: PagedLocationsResponse) => void;
  setCurrentLocation: (location: Location | null) => void;
  addLocation: (location: Location) => void;
  updateLocation: (location: Location) => void;
  removeLocation: (id: string) => void;
  setFilters: (filters: LocationListParams) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const LocationsContext = createContext<LocationsContextType | undefined>(undefined);

export const LocationsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(locationsReducer, initialState);

  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const setLocations = (response: PagedLocationsResponse) => 
    dispatch({ type: 'SET_LOCATIONS', payload: { locations: response.data, pagination: response.meta } });
  const setCurrentLocation = (location: Location | null) => dispatch({ type: 'SET_CURRENT_LOCATION', payload: location });
  const addLocation = (location: Location) => dispatch({ type: 'ADD_LOCATION', payload: location });
  const updateLocation = (location: Location) => dispatch({ type: 'UPDATE_LOCATION', payload: location });
  const removeLocation = (id: string) => dispatch({ type: 'REMOVE_LOCATION', payload: id });
  const setFilters = (filters: LocationListParams) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const setSearchQuery = (query: string) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  const resetFilters = () => dispatch({ type: 'RESET_FILTERS' });

  const contextValue: LocationsContextType = {
    state,
    dispatch,
    setLoading,
    setError,
    setLocations,
    setCurrentLocation,
    addLocation,
    updateLocation,
    removeLocation,
    setFilters,
    setSearchQuery,
    resetFilters,
  };

  return (
    <LocationsContext.Provider value={contextValue}>
      {children}
    </LocationsContext.Provider>
  );
};

export const useLocations = (): LocationsContextType => {
  const context = useContext(LocationsContext);
  if (context === undefined) {
    throw new Error('useLocations must be used within a LocationsProvider');
  }
  return context;
};
