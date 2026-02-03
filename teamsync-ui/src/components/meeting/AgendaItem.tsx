import React, { useState } from 'react';
import { AgendaItem as AgendaItemType } from '../../types/meeting';
import { agendaItemsApi } from '../../api/meetings';
import toast from 'react-hot-toast';

interface AgendaItemProps {
  item: AgendaItemType;
  onUpdate: () => void;
  onDelete: () => void;
}

const AgendaItem: React.FC<AgendaItemProps> = ({ item, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [decisionNotes, setDecisionNotes] = useState(item.decision_notes || '');
  const [showDecisionNotes, setShowDecisionNotes] = useState(false);

  const handleToggleComplete = async () => {
    try {
      await agendaItemsApi.update(item.id, { is_complete: !item.is_complete });
      toast.success(item.is_complete ? 'Marked incomplete' : 'Marked complete');
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async () => {
    try {
      await agendaItemsApi.update(item.id, { title, description });
      toast.success('Agenda item updated');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update agenda item');
    }
  };

  const handleSaveDecisionNotes = async () => {
    try {
      await agendaItemsApi.update(item.id, { decision_notes: decisionNotes });
      toast.success('Decision notes saved');
      setShowDecisionNotes(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to save decision notes');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this agenda item?')) {
      try {
        await agendaItemsApi.delete(item.id);
        toast.success('Agenda item deleted');
        onDelete();
      } catch (error) {
        toast.error('Failed to delete agenda item');
      }
    }
  };

  const handleCancel = () => {
    setTitle(item.title);
    setDescription(item.description || '');
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={item.is_complete}
          onChange={handleToggleComplete}
          className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
        />

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Agenda item title"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                rows={2}
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
            <>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4
                    className={`font-medium ${
                      item.is_complete ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600">{item.description}</p>
                  )}
                </div>
                <div className="flex space-x-2 ml-4">
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
                </div>
              </div>

              {item.is_complete && (
                <div className="mt-3">
                  {showDecisionNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
                        rows={3}
                        placeholder="Enter decision notes..."
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setDecisionNotes(item.decision_notes || '');
                            setShowDecisionNotes(false);
                          }}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveDecisionNotes}
                          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Save Notes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {item.decision_notes ? (
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-green-900">Decision Notes:</p>
                              <p className="text-sm text-green-800 mt-1">{item.decision_notes}</p>
                            </div>
                            <button
                              onClick={() => setShowDecisionNotes(true)}
                              className="text-sm text-green-700 hover:text-green-900 ml-2"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowDecisionNotes(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          + Add decision notes
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaItem;
