import React, { useState, useEffect } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import RichTextEditor from '../shared/RichTextEditor';
import toast from 'react-hot-toast';

const CascadingComms: React.FC = () => {
  const { meeting, updateMeeting, setHasUnsavedChanges } = useMeeting();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (meeting?.cascading_communications) {
      setContent(meeting.cascading_communications);
    }
  }, [meeting]);

  const handleChange = (newContent: string) => {
    setContent(newContent);
    setHasUnsavedChanges(newContent !== meeting?.cascading_communications);
  };

  const handleSave = async () => {
    if (content === meeting?.cascading_communications) {
      setHasUnsavedChanges(false);
      return;
    }

    setIsSaving(true);
    try {
      await updateMeeting({ cascading_communications: content });
      toast.success('Cascading communications updated');
    } catch (error) {
      toast.error('Failed to update cascading communications');
      setContent(meeting?.cascading_communications || '');
      setHasUnsavedChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Cascading Communications</h3>
        {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
      </div>
      <p className="text-sm text-gray-600 mb-3">
        Important messages to communicate to the broader team or organization
      </p>
      <RichTextEditor
        content={content}
        onChange={handleChange}
        onBlur={handleSave}
        placeholder="Enter cascading communications..."
      />
    </div>
  );
};

export default CascadingComms;
