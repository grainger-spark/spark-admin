import { apiRequest } from '../../helpers/api';
import { LoginCredentials, User } from './types';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  language?: string;
  phone?: string;
  activatedAt?: string;
  createdAt?: string;
}

interface Tenant {
  id: string;
  name: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: UserData;
  tenants: Tenant[];
}

export const loginApi = async (credentials: LoginCredentials): Promise<User> => {
  const response = await apiRequest<LoginResponse>('/authentication/login', {
    method: 'POST',
    body: {
      username: credentials.email,
      password: credentials.password,
    },
  });

  console.log('Login API Response:', JSON.stringify(response, null, 2));

  // Extract user data from nested user object
  const userData = response.user;
  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || userData.email.split('@')[0] || 'User';

  // Get first tenant ID
  const tenantId = response.tenants && response.tenants.length > 0 
    ? response.tenants[0].id 
    : '';

  const user = {
    id: userData.id,
    email: userData.email,
    name: fullName,
    token: response.token,
    tenantId: tenantId,
  };

  console.log('Mapped User Object:', JSON.stringify(user, null, 2));

  return user;
};

export const logoutApi = async (): Promise<void> => {
  // Logout is typically client-side (clear token)
  // If your API has a logout endpoint, call it here
  return Promise.resolve();
};
