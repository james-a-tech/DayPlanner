import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { useCreateTask } from '../hooks/useTasks';
import { useAppStore } from '../store/appStore';

export const TaskForm = ({ onClose }: { onClose: () => void }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    duration: 30,
    plannedStartTime: new Date().toISOString().slice(0, 16), // For datetime-local input
    category: 'general',
  });

  const createTaskMutation = useCreateTask();
  const addTask = useAppStore((state) => state.addTask);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate end time based on start time and duration
    const startTime = new Date(formData.plannedStartTime);
    const endTime = new Date(startTime.getTime() + formData.duration * 60000); // duration in minutes * 60000 ms
    
    const taskData = {
      ...formData,
      plannedStartTime: startTime.toISOString(),
      plannedEndTime: endTime.toISOString(),
    };
    
    createTaskMutation.mutate(taskData, {
      onSuccess: (res) => {
        addTask(res.data.data);
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (min)</label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="5"
                step="5"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
              placeholder="e.g., Work, Personal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              name="plannedStartTime"
              value={formData.plannedStartTime}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-blue-700 font-medium"
              disabled={createTaskMutation.isPending}
            >
              {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>

          {createTaskMutation.isError && (
            <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
              <AlertCircle size={16} />
              Error creating task
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
