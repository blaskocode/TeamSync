import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import RichTextEditor from '../shared/RichTextEditor';
import toast from 'react-hot-toast';

const StrategicTopics: React.FC = () => {
  const { meeting, updateMeeting, setHasUnsavedChanges } = useMeeting();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (meeting?.strategic_topics) {
      setContent(meeting.strategic_topics);
    }
  }, [meeting]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== meeting?.strategic_topics);
  };

  const handleSave = async () => {
    if (content === meeting?.strategic_topics) {
      setHasUnsavedChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateMeeting({ strategic_topics: content });
      toast.success('Strategic topics updated');
    } catch (error) {
      toast.error('Failed to update strategic topics');
      setContent(meeting?.strategic_topics || '');
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Strategic Topics</h3>
        {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Key strategic initiatives and topics that persist across meetings
      </p>
      <RichTextEditor
        content={content}
        onChange={handleChange}
        onBlur={handleSave}
        placeholder="Enter strategic topics..."
      />
    </div>
  );
};

export default StrategicTopics;
