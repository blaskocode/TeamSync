import apiClient from './client';
import { Meeting, MeetingSummary, Objective, AgendaItem } from '../types/meeting';

export const meetingsApi = {
  getAll: async (teamId: number): Promise<MeetingSummary[]> => {
    const response = await apiClient.get<MeetingSummary[]>(`/teams/${teamId}/meetings`);
    return response.data;
  },

  getCurrent: async (teamId: number): Promise<Meeting> => {
    const response = await apiClient.get<Meeting>(`/teams/${teamId}/meetings/current`);
    return response.data;
  },

  getById: async (id: number): Promise<Meeting> => {
    const response = await apiClient.get<Meeting>(`/meetings/${id}`);
    return response.data;
  },

  create: async (teamId: number, meetingDate: string): Promise<Meeting> => {
    const response = await apiClient.post<Meeting>(`/teams/${teamId}/meetings`, {
      meeting_date: meetingDate,
    });
    return response.data;
  },

  update: async (
    id: number,
    data: {
      team_goal?: string;
      strategic_topics?: string;
      cascading_communications?: string;
      whiteboard_notes?: string;
    }
  ): Promise<Meeting> => {
    const response = await apiClient.patch<Meeting>(`/meetings/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/meetings/${id}`);
  },

  poll: async (id: number): Promise<{
    id: number;
    updated_at: string;
    objectives_updated_at: string | null;
    agenda_items_updated_at: string | null;
  }> => {
    const response = await apiClient.get(`/meetings/${id}/poll`);
    return response.data;
  },
};

export const objectivesApi = {
  create: async (
    meetingId: number,
    data: {
      objective_type: 'defining' | 'standard_operating';
      title: string;
      description?: string;
      status_color: 'red' | 'yellow' | 'green';
    }
  ): Promise<Objective> => {
    const response = await apiClient.post<Objective>(`/meetings/${meetingId}/objectives`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      status_color?: 'red' | 'yellow' | 'green';
    }
  ): Promise<Objective> => {
    const response = await apiClient.patch<Objective>(`/objectives/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/objectives/${id}`);
  },

  reorder: async (objectiveIds: number[]): Promise<void> => {
    await apiClient.post('/objectives/reorder', { objective_ids: objectiveIds });
  },
};

export const agendaItemsApi = {
  create: async (
    meetingId: number,
    data: {
      title: string;
      description?: string;
    }
  ): Promise<AgendaItem> => {
    const response = await apiClient.post<AgendaItem>(`/meetings/${meetingId}/agenda_items`, data);
    return response.data;
  },

  update: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      is_complete?: boolean;
      decision_notes?: string;
    }
  ): Promise<AgendaItem> => {
    const response = await apiClient.patch<AgendaItem>(`/agenda_items/${id}`, data);
    return response.data;
  },

  complete: async (id: number, isComplete: boolean, decisionNotes?: string): Promise<AgendaItem> => {
    const response = await apiClient.patch<AgendaItem>(`/agenda_items/${id}/complete`, {
      is_complete: isComplete,
      decision_notes: decisionNotes,
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/agenda_items/${id}`);
  },

  reorder: async (agendaItemIds: number[]): Promise<void> => {
    await apiClient.post('/agenda_items/reorder', { agenda_item_ids: agendaItemIds });
  },
};
