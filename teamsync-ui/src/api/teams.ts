import apiClient from './client';
import { Team, TeamDetails, TeamMember } from '../types/team';

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

  addMember: async (teamId: number, userId: number, role: 'coach' | 'member'): Promise<TeamMember> => {
    const response = await apiClient.post<TeamMember>(`/teams/${teamId}/members`, {
      user_id: userId,
      role,
    });
    return response.data;
  },

  updateMember: async (teamId: number, membershipId: number, role: 'coach' | 'member'): Promise<void> => {
    await apiClient.patch(`/teams/${teamId}/members/${membershipId}`, { role });
  },

  removeMember: async (teamId: number, membershipId: number): Promise<void> => {
    await apiClient.delete(`/teams/${teamId}/members/${membershipId}`);
  },
};
