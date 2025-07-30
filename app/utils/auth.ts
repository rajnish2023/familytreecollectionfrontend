// Authentication utility functions

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  familyId: string;
  role: string;
  token: string;
}

// Store authentication data
export const setAuthData = (authData: AuthResponse) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authData', JSON.stringify(authData));
  }
};

// Get authentication data
export const getAuthData = (): AuthResponse | null => {
  if (typeof window !== 'undefined') {
    const authData = localStorage.getItem('authData');
    return authData ? JSON.parse(authData) : null;
  }
  return null;
};

// Get authentication token
export const getAuthToken = (): string | null => {
  const authData = getAuthData();
  return authData?.token || null;
};

// Clear authentication data
export const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authData');
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Check if user has specific role
export const hasRole = (requiredRoles: string[]): boolean => {
  const authData = getAuthData();
  return authData ? requiredRoles.includes(authData.role) : false;
};

// Role-specific checks
export const isAdmin = (): boolean => hasRole(['admin']);
export const isSubAdmin = (): boolean => hasRole(['admin', 'sub-admin']);
export const canEdit = (): boolean => hasRole(['admin', 'sub-admin']);
export const canManageUsers = (): boolean => hasRole(['admin']);

// Create authenticated fetch headers
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': token }),
  };
};

// Authenticated fetch wrapper
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const headers = getAuthHeaders();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  // If unauthorized, clear auth data and redirect to login
  if (response.status === 401) {
    clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  return response;
}; 