import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import toast from 'react-hot-toast';

const TeamGoal: React.FC = () => {
  const { meeting, updateMeeting, setHasUnsavedChanges } = useMeeting();
  const [goal, setGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (meeting?.team_goal) {
      setGoal(meeting.team_goal);
    }
  }, [meeting]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGoal(e.target.value);
    setHasUnsavedChanges(e.target.value !== meeting?.team_goal);
  };

  const handleBlur = async () => {
    if (goal === meeting?.team_goal) {
      setHasUnsavedChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateMeeting({ team_goal: goal });
      toast.success('Team goal updated');
    } catch (error) {
      toast.error('Failed to update team goal');
      setGoal(meeting?.team_goal || '');
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const isReadOnly = !meeting?.is_current;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Team Goal</h3>
        {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
      </div>
      <textarea
        value={goal}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isReadOnly}
        placeholder="Enter your team's primary goal..."
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none ${
          isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        rows={3}
      />
    </div>
  );
};

export default TeamGoal;
