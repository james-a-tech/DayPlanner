import { useState } from 'react';
import { useCreateTimeSlot } from '../hooks/useTimeSlots';
import { useAppStore } from '../store/appStore';

export const TimeSlotForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    name: '',
    startTime: '09:00',
    endTime: '10:00',
    color: '#3B82F6',
    isFixed: true,
    daysOfWeek: [0, 1, 2, 3, 4, 5],
  });

  const createSlotMutation = useCreateTimeSlot();
  const addTimeSlot = useAppStore((state) => state.addTimeSlot);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as any;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const toggleDay = (day: number) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSlotMutation.mutate(formData, {
      onSuccess: (res) => {
        addTimeSlot(res.data.data);
        onClose();
      },
    });
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create Template Slot</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Slot Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., Lunch, Travel"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Color</label>
            <input
              type="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="mt-1 block w-full h-10 rounded-md border border-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repeat Days</label>
            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleDay(idx)}
                  className={`py-2 rounded text-sm font-medium ${
                    formData.daysOfWeek.includes(idx)
                      ? 'bg-primary text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-blue-700 font-medium"
              disabled={createSlotMutation.isPending}
            >
              {createSlotMutation.isPending ? 'Creating...' : 'Create Slot'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
