export interface Team {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: 'coach' | 'member';
  working_genius_profile?: string;
}

export interface TeamDetails extends Team {
  members: TeamMember[];
}
