import React, { useState } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import ObjectiveCard from './ObjectiveCard';
import { objectivesApi } from '../../api/meetings';
import toast from 'react-hot-toast';

const ObjectiveList: React.FC = () => {
  const { meeting, refreshMeeting } = useMeeting();
  const [showDefiningForm, setShowDefiningForm] = useState(false);
  const [showStandardForm, setShowStandardForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  if (!meeting) return null;

  const definingObjectives = meeting.objectives.filter(
    (obj) => obj.objective_type === 'defining'
  );
  const standardObjectives = meeting.objectives.filter(
    (obj) => obj.objective_type === 'standard_operating'
  );

  const handleAddObjective = async (type: 'defining' | 'standard_operating') => {
    if (!newTitle.trim()) {
      toast.error('Please enter an objective title');
      return;
    }

    try {
      await objectivesApi.create(meeting.id, {
        objective_type: type,
        title: newTitle,
        status_color: 'yellow',
      });
      toast.success('Objective added');
      setNewTitle('');
      setShowDefiningForm(false);
      setShowStandardForm(false);
      refreshMeeting();
    } catch (error) {
      toast.error('Failed to add objective');
    }
  };

  return (
    <div className="space-y-6">
      {/* Defining Objectives */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Defining Objectives</h3>
          <button
            onClick={() => setShowDefiningForm(true)}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            + Add Objective
          </button>
        </div>

        {showDefiningForm && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter objective title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              onKeyPress={(e) => e.key === 'Enter' && handleAddObjective('defining')}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDefiningForm(false);
                  setNewTitle('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddObjective('defining')}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {definingObjectives.length === 0 ? (
            <p className="text-gray-500 text-sm">No defining objectives yet</p>
          ) : (
            definingObjectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                onUpdate={refreshMeeting}
                onDelete={refreshMeeting}
              />
            ))
          )}
        </div>
      </div>

      {/* Standard Operating Objectives */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Standard Operating Objectives</h3>
          <button
            onClick={() => setShowStandardForm(true)}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            + Add Objective
          </button>
        </div>

        {showStandardForm && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter objective title..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              onKeyPress={(e) => e.key === 'Enter' && handleAddObjective('standard_operating')}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowStandardForm(false);
                  setNewTitle('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddObjective('standard_operating')}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {standardObjectives.length === 0 ? (
            <p className="text-gray-500 text-sm">No standard operating objectives yet</p>
          ) : (
            standardObjectives.map((objective) => (
              <ObjectiveCard
                key={objective.id}
                objective={objective}
                onUpdate={refreshMeeting}
                onDelete={refreshMeeting}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObjectiveList;
