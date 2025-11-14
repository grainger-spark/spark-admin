import { User, AuthState } from './types';

export const initialUser: User = {
  id: '',
  email: '',
  name: '',
  token: '',
  tenantId: '',
};

export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};
