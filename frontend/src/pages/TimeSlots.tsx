import { useState } from 'react';
import { useTimeSlots, useCreateTimeSlot, useDeleteTimeSlot } from '../hooks/useTimeSlots';
import { Trash2, Plus } from 'lucide-react';

export const TimeSlotTemplates = () => {
  const { data: timeSlots, isLoading, refetch } = useTimeSlots();
  const createSlotMutation = useCreateTimeSlot();
  const deleteSlotMutation = useDeleteTimeSlot();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '10:00',
    color: '#3B82F6',
    daysOfWeek: [1, 2, 3, 4, 5],
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this time slot template?')) {
      deleteSlotMutation.mutate(id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSlotMutation.mutate(formData, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ name: '', startTime: '09:00', endTime: '10:00', color: '#3B82F6', daysOfWeek: [1, 2, 3, 4, 5] });
        refetch();
      },
    });
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (isLoading) return <div className="text-center py-8 text-gray-500">Loading time slots...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Time Slot Templates</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={18} />
          New Template
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              placeholder="e.g., Lunch Break, Morning Standup"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-success text-white py-2 rounded-lg hover:bg-green-600"
              disabled={createSlotMutation.isPending}
            >
              {createSlotMutation.isPending ? 'Creating...' : 'Create Template'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {timeSlots?.map((slot: any) => (
          <div key={slot._id} className="bg-white rounded-lg shadow p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{slot.name}</h3>
                <p className="text-sm text-gray-600">
                  {slot.startTime} - {slot.endTime}
                </p>
              </div>
              <div className="flex gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: slot.color }}
                />
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  disabled={deleteSlotMutation.isPending}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {slot.daysOfWeek.map((day: number) => (
                <span
                  key={day}
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                >
                  {dayNames[day].substring(0, 3)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!timeSlots || timeSlots.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No time slot templates yet. Create one to get started!</p>
        </div>
      )}
    </div>
  );
};
