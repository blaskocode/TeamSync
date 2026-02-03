import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Meeting } from '../types/meeting';
import { meetingsApi } from '../api/meetings';
import toast from 'react-hot-toast';
import { usePolling } from '../hooks/usePolling';

interface MeetingContextType {
  meeting: Meeting | null;
  isLoading: boolean;
  refreshMeeting: () => Promise<void>;
  loadMeetingById: (id: number) => Promise<void>;
  createNewMeeting: (date: string) => Promise<void>;
  updateMeeting: (data: {
    team_goal?: string;
    strategic_topics?: string;
    cascading_communications?: string;
    whiteboard_notes?: string;
  }) => Promise<void>;
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (value: boolean) => void;
}

const MeetingContext = createContext<MeetingContextType | undefined>(undefined);

export const MeetingProvider: React.FC<{ teamId: number; children: ReactNode }> = ({
  teamId,
  children,
}) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Store last known timestamps to detect changes
  const lastUpdatedAtRef = useRef<string | null>(null);
  const lastObjectivesUpdatedAtRef = useRef<string | null>(null);
  const lastAgendaItemsUpdatedAtRef = useRef<string | null>(null);

  const refreshMeeting = async () => {
    try {
      const data = await meetingsApi.getCurrent(teamId);
      setMeeting(data);
      // Update timestamp refs
      lastUpdatedAtRef.current = data.updated_at;
      lastObjectivesUpdatedAtRef.current = data.objectives.length > 0
        ? Math.max(...data.objectives.map(o => new Date(o.updated_at).getTime())).toString()
        : null;
      lastAgendaItemsUpdatedAtRef.current = data.agenda_items.length > 0
        ? Math.max(...data.agenda_items.map(a => new Date(a.updated_at).getTime())).toString()
        : null;
    } catch (error) {
      console.error('Failed to fetch meeting:', error);
      toast.error('Failed to load meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMeetingById = async (id: number) => {
    setIsLoading(true);
    try {
      const data = await meetingsApi.getById(id);
      setMeeting(data);
      // Update timestamp refs
      lastUpdatedAtRef.current = data.updated_at;
      lastObjectivesUpdatedAtRef.current = data.objectives.length > 0
        ? Math.max(...data.objectives.map(o => new Date(o.updated_at).getTime())).toString()
        : null;
      lastAgendaItemsUpdatedAtRef.current = data.agenda_items.length > 0
        ? Math.max(...data.agenda_items.map(a => new Date(a.updated_at).getTime())).toString()
        : null;
    } catch (error) {
      console.error('Failed to fetch meeting:', error);
      toast.error('Failed to load meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const createNewMeeting = async (date: string) => {
    setIsLoading(true);
    try {
      const newMeeting = await meetingsApi.create(teamId, date);
      setMeeting(newMeeting);
      // Update timestamp refs
      lastUpdatedAtRef.current = newMeeting.updated_at;
      lastObjectivesUpdatedAtRef.current = null;
      lastAgendaItemsUpdatedAtRef.current = null;
      toast.success('New meeting created');
    } catch (error) {
      console.error('Failed to create meeting:', error);
      toast.error('Failed to create meeting');
    } finally {
      setIsLoading(false);
    }
  };

  const updateMeeting = async (data: {
    team_goal?: string;
    strategic_topics?: string;
    cascading_communications?: string;
    whiteboard_notes?: string;
  }) => {
    if (!meeting) return;

    try {
      setHasUnsavedChanges(false);
      const updated = await meetingsApi.update(meeting.id, data);
      setMeeting(updated);
      // Update timestamp refs
      lastUpdatedAtRef.current = updated.updated_at;
    } catch (error) {
      console.error('Failed to update meeting:', error);
      toast.error('Failed to update meeting');
      throw error;
    }
  };

  // Polling function to check for updates
  const checkForUpdates = async () => {
    if (!meeting || hasUnsavedChanges) return;

    try {
      const pollData = await meetingsApi.poll(meeting.id);

      // Check if any timestamps have changed
      const meetingUpdated = pollData.updated_at !== lastUpdatedAtRef.current;
      const objectivesUpdated = pollData.objectives_updated_at !== lastObjectivesUpdatedAtRef.current;
      const agendaItemsUpdated = pollData.agenda_items_updated_at !== lastAgendaItemsUpdatedAtRef.current;

      // If anything changed, refresh the meeting
      if (meetingUpdated || objectivesUpdated || agendaItemsUpdated) {
        console.log('Updates detected, refreshing meeting...');
        const data = await meetingsApi.getById(meeting.id);
        setMeeting(data);
        // Update timestamp refs
        lastUpdatedAtRef.current = data.updated_at;
        lastObjectivesUpdatedAtRef.current = data.objectives.length > 0
          ? Math.max(...data.objectives.map(o => new Date(o.updated_at).getTime())).toString()
          : null;
        lastAgendaItemsUpdatedAtRef.current = data.agenda_items.length > 0
          ? Math.max(...data.agenda_items.map(a => new Date(a.updated_at).getTime())).toString()
          : null;
      }
    } catch (error) {
      console.error('Polling error:', error);
      // Silently fail - don't show error toast for polling failures
    }
  };

  // Enable polling only when a meeting is loaded and there are no unsaved changes
  usePolling(checkForUpdates, {
    interval: 5000, // 5 seconds
    enabled: !!meeting && !hasUnsavedChanges,
    onWindowBlur: false, // Stop polling when window is blurred
  });

  useEffect(() => {
    refreshMeeting();
  }, [teamId]);

  return (
    <MeetingContext.Provider
      value={{
        meeting,
        isLoading,
        refreshMeeting,
        loadMeetingById,
        createNewMeeting,
        updateMeeting,
        hasUnsavedChanges,
        setHasUnsavedChanges
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (context === undefined) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
};
