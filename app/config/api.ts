const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  baseUrl: API_BASE_URL,
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    signup: `${API_BASE_URL}/api/auth/signup`,
    joinFamily: `${API_BASE_URL}/api/auth/join-family`,
    familyInfo: `${API_BASE_URL}/api/auth/family-info`,
    changePassword: `${API_BASE_URL}/api/auth/change-password`,
    changeEmail: `${API_BASE_URL}/api/auth/change-email`,
  },
  users: {
    familyMembers: `${API_BASE_URL}/api/users/family-members`,
    invite: `${API_BASE_URL}/api/users/invite`,
    updateRole: (id: string) => `${API_BASE_URL}/api/users/${id}/role`,
    removeUser: (id: string) => `${API_BASE_URL}/api/users/${id}`,
  },
  persons: {
    all: `${API_BASE_URL}/api/persons/all-persons`,
    create: `${API_BASE_URL}/api/persons/create-person`,
    update: (id: string) => `${API_BASE_URL}/api/persons/update-person/${id}`,
    delete: (id: string) => `${API_BASE_URL}/api/persons/delete-person/${id}`,
    eligibleSpouses: `${API_BASE_URL}/api/persons/eligible-spouses`,
    eligibleParents: `${API_BASE_URL}/api/persons/eligible-parents`,
    occupations: `${API_BASE_URL}/api/persons/occupations`,
    familyTree: `${API_BASE_URL}/api/persons/family-tree`,
    person: (id: string) => `${API_BASE_URL}/api/persons/get-person/${id}`,
  },
  upload: {
    image: `${API_BASE_URL}/api/upload/image`,
  },
}; 