import { useState } from 'react';
import { useTimeSlots, useCreateTimeSlot, useUpdateTimeSlot, useDeleteTimeSlot } from '../hooks/useTimeSlots';
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
    duration: 60,
    color: '#3B82F6',
    daysOfWeek: [1, 2, 3, 4, 5],
  });
  const updateSlotMutation = useUpdateTimeSlot();
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<any>(null);

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this time slot template?')) {
      deleteSlotMutation.mutate(id, {
        onSuccess: () => refetch(),
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // If duration provided, compute endTime from startTime + duration to keep consistent
    const fd = { ...formData } as any;
    if (fd.duration) {
      const [sh, sm] = (fd.startTime || '09:00').split(':').map(Number);
      const dt = new Date();
      dt.setHours(sh, sm, 0, 0);
      const endDt = new Date(dt.getTime() + Number(fd.duration) * 60000);
      const eh = String(endDt.getHours()).padStart(2, '0');
      const em = String(endDt.getMinutes()).padStart(2, '0');
      fd.endTime = `${eh}:${em}`;
    }

    createSlotMutation.mutate(fd, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ name: '', startTime: '09:00', endTime: '10:00', color: '#3B82F6', daysOfWeek: [1, 2, 3, 4, 5], duration: 60 });
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="mt-1 w-32 rounded-lg border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Days</label>
            <div className="mt-2 flex gap-2 flex-wrap">
              {dayNames.map((d, idx) => {
                const active = formData.daysOfWeek.includes(idx);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      const days = new Set(formData.daysOfWeek || []);
                      if (days.has(idx)) days.delete(idx); else days.add(idx);
                      setFormData({ ...formData, daysOfWeek: Array.from(days).sort() });
                    }}
                    className={`px-2 py-1 rounded text-sm ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {d.substring(0,3)}
                  </button>
                );
              })}
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
                  {slot.startTime} - {slot.endTime} {slot.duration ? ` · ${slot.duration}m` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-gray-300"
                  style={{ backgroundColor: slot.color }}
                />
                <button
                  onClick={() => {
                    setEditingSlotId(slot._id);
                    setEditingData({
                      name: slot.name,
                      startTime: slot.startTime,
                      endTime: slot.endTime,
                      duration: slot.duration ?? 60,
                      color: slot.color,
                      daysOfWeek: slot.daysOfWeek,
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(slot._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  disabled={deleteSlotMutation.isPending}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {editingSlotId === slot._id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Recompute duration based on startTime and endTime (handles editing end time)
                  const [sh, sm] = (editingData.startTime || '09:00').split(':').map(Number);
                  const [eh, em] = (editingData.endTime || editingData.startTime || '09:00').split(':').map(Number);
                  const startDt = new Date();
                  startDt.setHours(sh, sm, 0, 0);
                  let endDt = new Date();
                  endDt.setHours(eh, em, 0, 0);
                  // if end is before start, assume next day
                  if (endDt < startDt) endDt.setDate(endDt.getDate() + 1);
                  const computedDuration = Math.max(0, Math.round((endDt.getTime() - startDt.getTime()) / 60000));
                  const ehStr = String(endDt.getHours()).padStart(2, '0');
                  const emStr = String(endDt.getMinutes()).padStart(2, '0');
                  const computedEnd = `${ehStr}:${emStr}`;
                  const dataToSend = { ...editingData, endTime: computedEnd, duration: computedDuration };

                  updateSlotMutation.mutate({ id: slot._id, data: dataToSend }, {
                    onSuccess: () => {
                      setEditingSlotId(null);
                    }
                  });
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2" value={editingData.name} onChange={(e) => setEditingData({ ...editingData, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start</label>
                    <input type="time" className="mt-1 w-full rounded-lg border px-3 py-2" value={editingData.startTime} onChange={(e) => setEditingData({ ...editingData, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End</label>
                    <input type="time" className="mt-1 w-full rounded-lg border px-3 py-2" value={editingData.endTime} onChange={(e) => setEditingData({ ...editingData, endTime: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                  <input type="number" className="mt-1 rounded-lg border px-3 py-2 w-32" value={editingData.duration} onChange={(e) => setEditingData({ ...editingData, duration: Number(e.target.value) })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Days</label>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {dayNames.map((d, idx) => {
                      const active = (editingData.daysOfWeek || []).includes(idx);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            const days = new Set(editingData.daysOfWeek || []);
                            if (days.has(idx)) days.delete(idx); else days.add(idx);
                            setEditingData({ ...editingData, daysOfWeek: Array.from(days).sort() });
                          }}
                          className={`px-2 py-1 rounded text-sm ${active ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {d.substring(0,3)}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-primary text-white px-3 py-1 rounded">Save</button>
                  <button type="button" className="bg-gray-200 px-3 py-1 rounded" onClick={() => setEditingSlotId(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap gap-1">
                {slot.daysOfWeek.map((day: number) => (
                  <span key={day} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">{dayNames[day].substring(0, 3)}</span>
                ))}
              </div>
            )}
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
