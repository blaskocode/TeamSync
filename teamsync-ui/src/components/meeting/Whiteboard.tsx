import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import RichTextEditor from '../shared/RichTextEditor';
import toast from 'react-hot-toast';

const Whiteboard: React.FC = () => {
  const { meeting, updateMeeting, setHasUnsavedChanges } = useMeeting();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (meeting?.whiteboard_notes) {
      setContent(meeting.whiteboard_notes);
    }
  }, [meeting]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== meeting?.whiteboard_notes);
  };

  const handleSave = async () => {
    if (content === meeting?.whiteboard_notes) {
      setHasUnsavedChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateMeeting({ whiteboard_notes: content });
      toast.success('Whiteboard updated');
    } catch (error) {
      toast.error('Failed to update whiteboard');
      setContent(meeting?.whiteboard_notes || '');
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Whiteboard / Notes</h3>
        {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Scratch space for meeting notes, ideas, and discussions
      </p>
      <RichTextEditor
        content={content}
        onChange={handleChange}
        onBlur={handleSave}
        placeholder="Use this space for notes during the meeting..."
        disabled={!meeting?.is_current}
      />
    </div>
  );
};

export default Whiteboard;
