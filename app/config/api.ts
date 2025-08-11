const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  baseUrl: API_BASE_URL,
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    signup: `${API_BASE_URL}/auth/signup`,
    joinFamily: `${API_BASE_URL}/auth/join-family`,
    familyInfo: `${API_BASE_URL}/auth/family-info`,
    changePassword: `${API_BASE_URL}/auth/change-password`,
    changeEmail: `${API_BASE_URL}/auth/change-email`,
  },
  users: {
    familyMembers: `${API_BASE_URL}/users/family-members`,
    invite: `${API_BASE_URL}/users/invite`,
    updateRole: (id: string) => `${API_BASE_URL}/users/${id}/role`,
    removeUser: (id: string) => `${API_BASE_URL}/users/${id}`,
  },
  persons: {
    all: `${API_BASE_URL}/persons/all-persons`,
    create: `${API_BASE_URL}/persons/create-person`,
    update: (id: string) => `${API_BASE_URL}/persons/update-person/${id}`,
    delete: (id: string) => `${API_BASE_URL}/persons/delete-person/${id}`,
    eligibleSpouses: `${API_BASE_URL}/persons/eligible-spouses`,
    eligibleParents: `${API_BASE_URL}/persons/eligible-parents`,
    occupations: `${API_BASE_URL}/persons/occupations`,
    familyTree: `${API_BASE_URL}/persons/family-tree`,
    person: (id: string) => `${API_BASE_URL}/persons/get-person/${id}`,
  },
  upload: {
    image: `${API_BASE_URL}/upload/image`,
  },
}; 
