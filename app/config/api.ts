const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    joinFamily: `${API_BASE_URL}/auth/join-family`,
    familyInfo: `${API_BASE_URL}/auth/family-info`,
  },
  users: {
    familyMembers: `${API_BASE_URL}/users/family-members`,
    invite: `${API_BASE_URL}/users/invite`,
    updateRole: (id: string) => `${API_BASE_URL}/users/${id}/role`,
    removeUser: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  persons: {
    all: `${API_BASE_URL}/persons`,
    delete: (id: string) => `${API_BASE_URL}/persons/${id}`,
  },
}; 