import React, { useState } from 'react';
import { Objective } from '../../types/meeting';
import StatusIndicator from './StatusIndicator';
import { objectivesApi } from '../../api/meetings';
import toast from 'react-hot-toast';

interface ObjectiveCardProps {
  objective: Objective;
  onUpdate: () => void;
  onDelete: () => void;
}

const ObjectiveCard: React.FC<ObjectiveCardProps> = ({ objective, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(objective.title);
  const [description, setDescription] = useState(objective.description || '');

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
    try {
      await objectivesApi.update(objective.id, { title, description });
      toast.success('Objective updated');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update objective');
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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <StatusIndicator status={objective.status_color} onChange={handleStatusChange} />
        <div className="flex space-x-2">
          {!isEditing && (
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
              dangerouslySetInnerHTML={{ __html: objective.description }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ObjectiveCard;
