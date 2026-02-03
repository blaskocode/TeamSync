import React, { useState } from 'react';
import { Objective } from '../../types/meeting';
import StatusIndicator from './StatusIndicator';
import { objectivesApi } from '../../api/meetings';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { useMeeting } from '../../contexts/MeetingContext';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ObjectiveCardProps {
  objective: Objective;
  onUpdate: () => void;
  onDelete: () => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onUpdate, onDelete }) => {
  const { meeting } = useMeeting();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(objective.title);
  const [description, setDescription] = useState(objective.description || '');
  const isReadOnly = !meeting?.is_current;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: objective.id, disabled: isReadOnly });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleStatusChange = async (newStatus: 'red' | 'yellow' | 'green') => {
    try {
      await objectivesApi.update(objective.id, { status_color: newStatus });
      toast.success('Status updated');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (title.length > 500) {
      toast.error('Title must be less than 500 characters');
      return;
    }
    if (description.length > 5000) {
      toast.error('Description must be less than 5000 characters');
      return;
    }

    try {
      await objectivesApi.update(objective.id, { title: title.trim(), description: description.trim() });
      toast.success('Objective updated');
      setIsEditing(false);
      onUpdate();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update objective';
      toast.error(errorMessage);
      if (error.validationErrors) {
        error.validationErrors.forEach((err: string) => toast.error(err));
      }
    }
  };

  const handleCancel = () => {
    setTitle(objective.title);
    setDescription(objective.description || '');
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this objective?')) {
      try {
        await objectivesApi.delete(objective.id);
        toast.success('Objective deleted');
        onDelete();
      } catch (error) {
        toast.error('Failed to delete objective');
      }
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        {!isReadOnly && (
          <div
            {...attributes}
            {...listeners}
            className="mr-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
            style={{ touchAction: 'none' }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
        )}
        <StatusIndicator
          status={objective.status_color}
          onChange={handleStatusChange}
          disabled={isReadOnly}
        />
        <div className="flex space-x-2">
          {!isEditing && !isReadOnly && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Objective title"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
            placeholder="Description (optional)"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h4 className="font-medium text-gray-900">{objective.title}</h4>
          {objective.description && (
            <div
              className="mt-2 text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(objective.description) }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveCard;
