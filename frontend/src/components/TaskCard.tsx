import { CheckCircle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useCompleteTask } from '../hooks/useTasks';

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
}

type Priority = 'low' | 'medium' | 'high';
type Status = 'todo' | 'in_progress' | 'completed';

export const TaskCard = ({ task, onEdit }: TaskCardProps) => {
  const completeTaskMutation = useCompleteTask();

  const priorityColors: Record<Priority, string> = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };

  const statusIcons: Record<Status, JSX.Element> = {
    todo: <AlertCircle size={16} />,
    in_progress: <Clock size={16} />,
    completed: <CheckCircle size={16} />,
  };

  const handleComplete = () => {
    if (window.confirm('Mark this task as completed?')) {
      completeTaskMutation.mutate({
        id: task._id,
        data: { actualEndTime: new Date() },
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority as Priority]}`}>
          {(task.priority as string).charAt(0).toUpperCase() + (task.priority as string).slice(1)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock size={16} />
          {task.duration} minutes
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar size={16} />
          {new Date(task.plannedStartTime).toLocaleDateString()}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">{statusIcons[task.status as Status]}</span>
        <span className="text-sm font-medium text-gray-700">
          {(task.status as string).replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="flex gap-2">
        {task.status !== 'completed' && (
          <button
            onClick={handleComplete}
            className="flex-1 bg-success text-white py-2 rounded hover:bg-green-600 text-sm font-medium"
            disabled={completeTaskMutation.isPending}
          >
            {completeTaskMutation.isPending ? 'Marking...' : 'Complete'}
          </button>
        )}
        <button
          onClick={() => onEdit(task)}
          className="flex-1 bg-blue-100 text-blue-700 py-2 rounded hover:bg-blue-200 text-sm font-medium"
        >
          Edit
        </button>
      </div>
    </div>
  );
};
