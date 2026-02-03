import apiClient from './client';

export interface UserSearchResult {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
}

export const usersApi = {
  searchByEmail: async (email: string): Promise<UserSearchResult> => {
    const response = await apiClient.get<UserSearchResult>('/users/search', {
      params: { email },
    });
    return response.data;
  },
};
