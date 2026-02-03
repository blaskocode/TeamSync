import React, { useState } from 'react';
import { useMeeting } from '../../contexts/MeetingContext';
import AgendaItem from './AgendaItem';
import { agendaItemsApi } from '../../api/meetings';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const AgendaSection: React.FC = () => {
  const { meeting, refreshMeeting } = useMeeting();
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!meeting) return null;

  const handleAddItem = async () => {
    if (!newTitle.trim()) {
      toast.error('Please enter an agenda item title');
      return;
    }

    try {
      await agendaItemsApi.create(meeting.id, {
        title: newTitle,
        description: newDescription,
      });
      toast.success('Agenda item added');
      setNewTitle('');
      setNewDescription('');
      setShowForm(false);
      refreshMeeting();
    } catch (error) {
      toast.error('Failed to add agenda item');
    }
  };

  const sortedItems = [...meeting.agenda_items].sort((a, b) => a.display_order - b.display_order);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sortedItems.findIndex((item) => item.id === active.id);
    const newIndex = sortedItems.findIndex((item) => item.id === over.id);

    const reorderedItems = arrayMove(sortedItems, oldIndex, newIndex);
    const itemIds = reorderedItems.map((item) => item.id);

    try {
      await agendaItemsApi.reorder(itemIds);
      toast.success('Order updated');
      refreshMeeting();
    } catch (error) {
      toast.error('Failed to reorder');
      refreshMeeting();
    }
  };

  const isReadOnly = !meeting?.is_current;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Agenda</h3>
        {meeting?.is_current && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
          >
            + Add Item
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Agenda item title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddItem()}
          />
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Description (optional)..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-2"
            rows={2}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setShowForm(false);
                setNewTitle('');
                setNewDescription('');
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedItems.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
          disabled={isReadOnly}
        >
          <div className="space-y-3">
            {sortedItems.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                No agenda items yet. Click "Add Item" to get started.
              </p>
            ) : (
              sortedItems.map((item) => (
                <AgendaItem
                  key={item.id}
                  item={item}
                  onUpdate={refreshMeeting}
                  onDelete={refreshMeeting}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default AgendaSection;
