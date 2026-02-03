import apiClient from './client';
import { Team, TeamDetails } from '../types/team';

export const teamsApi = {
  getAll: async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/teams');
    return response.data;
  },

  getById: async (id: number): Promise<TeamDetails> => {
    const response = await apiClient.get<TeamDetails>(`/teams/${id}`);
    return response.data;
  },

  create: async (name: string): Promise<Team> => {
    const response = await apiClient.post<Team>('/teams', { team: { name } });
    return response.data;
  },

  update: async (id: number, name: string): Promise<Team> => {
    const response = await apiClient.patch<Team>(`/teams/${id}`, { team: { name } });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/teams/${id}`);
  },
};
