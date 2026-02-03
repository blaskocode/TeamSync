import React from 'react';
import { useMeeting } from '../../contexts/MeetingContext';

export const UnsavedChangesIndicator: React.FC = () => {
  const { hasUnsavedChanges } = useMeeting();

  if (!hasUnsavedChanges) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <svg
        className="animate-pulse w-4 h-4"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-sm font-medium">Unsaved changes</span>
    </div>
  );
};
