import React, { useState } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import toast from 'react-hot-toast';

const MeetingHeader: React.FC = () => {
  const { meeting, isLoading, loadMeetingById, createNewMeeting } = useMeeting();
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [newMeetingDate, setNewMeetingDate] = useState('');

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <p className="text-gray-500">No meeting found</p>
      </div>
    );
  }

  const meetingDate = new Date(meeting.meeting_date);
  const formattedDate = meetingDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handlePrevious = () => {
    if (meeting.previous_meeting_id) {
      loadMeetingById(meeting.previous_meeting_id);
    }
  };

  const handleNext = () => {
    if (meeting.next_meeting_id) {
      loadMeetingById(meeting.next_meeting_id);
    }
  };

  const handleCreateMeeting = async () => {
    if (!newMeetingDate) {
      toast.error('Please select a date');
      return;
    }

    try {
      await createNewMeeting(newMeetingDate);
      setShowNewMeetingForm(false);
      setNewMeetingDate('');
    } catch (error) {
      // Error already handled in context
    }
  };

  const handleExportPDF = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
      const token = localStorage.getItem('token');

      const response = await fetch(`${apiUrl}/meetings/${meeting.id}/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting-${meeting.meeting_date}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Team Meeting</h2>
            <p className="mt-1 text-sm text-gray-500">{formattedDate}</p>
          </div>
          <div className="flex items-center space-x-2 ml-6">
            <button
              onClick={handlePrevious}
              disabled={!meeting.previous_meeting_id}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Previous meeting"
            >
              ← Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!meeting.next_meeting_id}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Next meeting"
            >
              Next →
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {!meeting.is_current && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-200 text-gray-700">
              Historical
            </span>
          )}
          {meeting.is_current && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Current
            </span>
          )}
          <button
            onClick={handleExportPDF}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            title="Export to PDF"
          >
            📄 Export PDF
          </button>
          <button
            onClick={() => setShowNewMeetingForm(!showNewMeetingForm)}
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            + New Meeting
          </button>
        </div>
      </div>

      {showNewMeetingForm && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <label htmlFor="meeting-date" className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Date
              </label>
              <input
                type="date"
                id="meeting-date"
                value={newMeetingDate}
                onChange={(e) => setNewMeetingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => {
                setShowNewMeetingForm(false);
                setNewMeetingDate('');
              }}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateMeeting}
              className="px-3 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Create Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingHeader;
