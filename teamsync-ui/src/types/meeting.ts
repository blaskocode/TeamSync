export interface Objective {
  id: number;
  meeting_id: number;
  objective_type: 'defining' | 'standard_operating';
  title: string;
  description?: string;
  status_color: 'red' | 'yellow' | 'green';
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AgendaItem {
  id: number;
  meeting_id: number;
  title: string;
  description?: string;
  display_order: number;
  is_complete: boolean;
  decision_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingParticipant {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  role: string;
  working_genius_profile?: string;
}

export interface Meeting {
  id: number;
  team_id: number;
  meeting_date: string;
  team_goal?: string;
  strategic_topics?: string;
  cascading_communications?: string;
  whiteboard_notes?: string;
  is_current: boolean;
  next_meeting_id?: number;
  previous_meeting_id?: number;
  objectives: Objective[];
  agenda_items: AgendaItem[];
  participants: MeetingParticipant[];
  created_at: string;
  updated_at: string;
}

export interface MeetingSummary {
  id: number;
  team_id: number;
  meeting_date: string;
  created_at: string;
  updated_at: string;
}
