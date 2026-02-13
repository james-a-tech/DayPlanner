import { useState, useMemo, useRef, useCallback } from 'react';
import { useAppStore } from '../store/appStore';
import { useTasks, useCompleteTask, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { Plus, Trash2 } from 'lucide-react';

export const TaskList = ({ onEditTask }: { onEditTask: (task: any) => void }) => {
  const { data: tasks, isLoading } = useTasks();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const completeTaskMutation = useCompleteTask();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [editingCell, setEditingCell] = useState<{ taskId: string; field: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const isSaving = useRef(false);

  const filteredTasks = useMemo(() => {
    if (!tasks) return [];
    // Filter and sort tasks for the selected date
    const dayTasks = tasks.filter((task: any) => {
      const taskDate = new Date(task.plannedStartTime);
      return taskDate.toDateString() === selectedDate.toDateString();
    }).sort((a: any, b: any) => {
      return new Date(a.plannedStartTime).getTime() - new Date(b.plannedStartTime).getTime();
    });

    // Insert free slot rows for gaps
    const withFreeSlots: any[] = [];
    for (let i = 0; i < dayTasks.length; i++) {
      const prev = dayTasks[i - 1];
      const curr = dayTasks[i];
      if (prev) {
        const prevEnd = new Date(prev.plannedEndTime);
        const currStart = new Date(curr.plannedStartTime);
        if (currStart.getTime() > prevEnd.getTime()) {
          // Insert free slot
          withFreeSlots.push({
            _id: `free-${prev._id}-${curr._id}`,
            plannedStartTime: prev.plannedEndTime,
            plannedEndTime: curr.plannedStartTime,
            duration: Math.round((currStart.getTime() - prevEnd.getTime()) / 60000),
            title: 'Free Slot',
            description: '',
            priority: 'low',
            status: 'free',
            color: 'red',
            isFreeSlot: true,
          });
        }
      }
      withFreeSlots.push(curr);
    }
    return withFreeSlots;
  }, [tasks, selectedDate]);

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const formatTimeDisplay = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}`;
    } else if (hours > 0) {
      return `${hours}:00`;
    } else {
      return `0:${mins.toString().padStart(2, '0')}`;
    }
  };

  const parseDuration = (durationStr: string): number => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const hours = parseInt(parts[0]) || 0;
      const mins = parseInt(parts[1]) || 0;
      return hours * 60 + mins;
    }
    return parseInt(durationStr) || 0;
  };

  const calculateEndTime = (startTime: string, duration: number) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);
    return end;
  };

  // Helper to format Date to 12-hour time string (hh:mm AM/PM)
  const to12HourTime = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  // Helper to parse 12-hour time string (hh:mm AM/PM) to hours/minutes
  const parse12HourTime = (str: string) => {
    const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return { hours, minutes };
  };

  const handleCellClick = (taskId: string, field: string, currentValue: any) => {
    setEditingCell({ taskId, field });
    if (field === 'startTime' || field === 'endTime') {
      const date = new Date(currentValue);
      setEditValue(to12HourTime(date));
    } else if (field === 'duration') {
      setEditValue(formatDuration(currentValue));
    } else {
      setEditValue(currentValue || '');
    }
  };

  const handleCellBlur = useCallback(async (task: any) => {
    if (!editingCell || isSaving.current) return;
    isSaving.current = true;

    const { field } = editingCell;
    let updatedData: any = {};

    try {
      if (field === 'startTime') {
        const parsed = parse12HourTime(editValue);
        if (!parsed) {
          console.error('Invalid time format');
          return;
        }
        const newDate = new Date(selectedDate);
        newDate.setHours(parsed.hours, parsed.minutes, 0, 0);
        updatedData.plannedStartTime = newDate.toISOString();
        // Calculate new end time using existing duration
        const newEndTime = new Date(newDate.getTime() + task.duration * 60000);
        updatedData.plannedEndTime = newEndTime.toISOString();
      } else if (field === 'endTime') {
        const parsed = parse12HourTime(editValue);
        if (!parsed) {
          console.error('Invalid time format');
          return;
        }
        const start = new Date(task.plannedStartTime);
        const newEnd = new Date(start);
        newEnd.setHours(parsed.hours, parsed.minutes, 0, 0);
        // If end time is before start, assume next day
        if (newEnd < start) newEnd.setDate(newEnd.getDate() + 1);
        updatedData.plannedEndTime = newEnd.toISOString();
        // Update duration based on new end time
        const duration = Math.round((newEnd.getTime() - start.getTime()) / 60000);
        updatedData.duration = duration > 0 ? duration : 0;
      } else if (field === 'duration') {
        const duration = parseDuration(editValue);
        if (duration === 0) {
          console.error('Invalid duration');
          return;
        }
        updatedData.duration = duration;
        // Calculate new end time using existing start time
        const startTime = new Date(task.plannedStartTime);
        const newEndTime = new Date(startTime.getTime() + duration * 60000);
        updatedData.plannedEndTime = newEndTime.toISOString();
      } else if (field === 'title') {
        if (!editValue.trim()) {
          console.error('Title cannot be empty');
          return;
        }
        updatedData.title = editValue.trim();
      } else if (field === 'description') {
        updatedData.description = editValue.trim();
      }

      if (task._id && Object.keys(updatedData).length > 0) {
        await updateTaskMutation.mutateAsync({ id: task._id, data: updatedData });
      }
    } catch (error: any) {
      console.error('Failed to update task:', error);
      alert(`Failed to update task: ${error.response?.data?.detail || error.message}`);
    } finally {
      setEditingCell(null);
      setEditValue('');
      isSaving.current = false;
    }
  }, [editingCell, editValue, selectedDate, updateTaskMutation]);

  const handleAddRow = async () => {
    const lastTask = filteredTasks[filteredTasks.length - 1];
    let newStartTime: Date;
    if (lastTask) {
      newStartTime = new Date(new Date(lastTask.plannedStartTime).getTime() + lastTask.duration * 60000);
    } else {
      newStartTime = new Date(selectedDate);
      newStartTime.setHours(9, 0, 0, 0);
    }
    
    const duration = 30; // 30 minutes
    const newEndTime = new Date(newStartTime.getTime() + duration * 60000);

    const newTask = {
      title: 'New Task',
      description: '',
      plannedStartTime: newStartTime.toISOString(),
      plannedEndTime: newEndTime.toISOString(),
      duration: duration,
      priority: 'medium',
      status: 'todo',
    };

    try {
      await createTaskMutation.mutateAsync(newTask);
      console.log('Task created successfully');
    } catch (error: any) {
      console.error('Failed to create task:', error);
      alert(`Failed to create task: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTaskMutation.mutateAsync(taskId);
      console.log('Task deleted successfully');
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      alert(`Failed to delete task: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleComplete = async (task: any) => {
    if (window.confirm('Mark this task as completed?')) {
      try {
        await completeTaskMutation.mutateAsync({
          id: task._id,
          data: { actualEndTime: new Date(), status: 'completed' },
        });
        console.log('Task completed successfully');
      } catch (error: any) {
        console.error('Failed to complete task:', error);
        alert(`Failed to complete task: ${error.response?.data?.detail || error.message}`);
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50';
      case 'medium': return 'bg-yellow-50';
      case 'low': return 'bg-green-50';
      default: return 'bg-white';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Completed</span>;
      case 'in_progress':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">In Progress</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">To Do</span>;
    }
  };

  const cancelEdit = useCallback(() => {
    isSaving.current = true;
    setEditingCell(null);
    setEditValue('');
    // Reset on next tick so the blur handler (which fires on unmount) is blocked
    setTimeout(() => { isSaving.current = false; }, 0);
  }, []);

  const renderEditableCell = (task: any, field: string, value: any, displayValue: string) => {
    const isEditing = editingCell?.taskId === task._id && editingCell?.field === field;

    if (isEditing && (field === 'startTime' || field === 'endTime')) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value.replace(/[^0-9:AMPamp\s]/g, ''))}
          onBlur={() => handleCellBlur(task)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancelEdit();
            }
          }}
          placeholder="hh:mm AM/PM"
          autoFocus
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
    if (isEditing) {
      return (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => handleCellBlur(task)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLInputElement).blur();
            } else if (e.key === 'Escape') {
              e.preventDefault();
              cancelEdit();
            }
          }}
          autoFocus
          className="w-full px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }

    return (
      <div
        onClick={() => handleCellClick(task._id, field, value)}
        className="cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
      >
        {displayValue}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Tasks for {selectedDate.toLocaleDateString()}
          {isLoading && <span className="ml-2 text-sm text-gray-400">(loading...)</span>}
        </h2>
        <button
          onClick={handleAddRow}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus size={20} />
          Add Row
        </button>
      </div>
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {isLoading ? 'Loading tasks...' : 'No tasks for this date. Click "Add Row" to create one!'}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-teal-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  End Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Task
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTasks.map((task: any) => {
                const startTime = new Date(task.plannedStartTime);
                const endTime = calculateEndTime(task.plannedStartTime, task.duration);
                
                return (
                  <tr key={task._id} className={`${task.isFreeSlot ? 'bg-red-100' : getPriorityColor(task.priority)} hover:bg-gray-50`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.isFreeSlot
                        ? formatTimeDisplay(new Date(task.plannedStartTime))
                        : renderEditableCell(task, 'startTime', task.plannedStartTime, formatTimeDisplay(startTime))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {task.isFreeSlot
                        ? formatTimeDisplay(new Date(task.plannedEndTime))
                        : renderEditableCell(task, 'endTime', endTime.toISOString(), formatTimeDisplay(endTime))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {task.isFreeSlot
                        ? formatDuration(task.duration) + 'h'
                        : renderEditableCell(task, 'duration', task.duration, formatDuration(task.duration) + 'h')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {task.isFreeSlot
                        ? <span className="text-red-600 font-semibold">Free Slot</span>
                        : renderEditableCell(task, 'title', task.title, task.title)}
                      {!editingCell && task.description && !task.isFreeSlot && (
                        <div 
                          onClick={() => handleCellClick(task._id, 'description', task.description)}
                          className="text-gray-500 text-xs mt-1 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded"
                        >
                          {task.description}
                        </div>
                      )}
                      {editingCell?.taskId === task._id && editingCell?.field === 'description' && !task.isFreeSlot && (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => handleCellBlur(task)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              (e.target as HTMLInputElement).blur();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                          placeholder="Description"
                          autoFocus
                          className="w-full px-2 py-1 text-xs border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {task.isFreeSlot
                        ? <span className="px-2 py-1 rounded-full text-xs bg-red-200 text-red-800">Free</span>
                        : getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!task.isFreeSlot && (
                        <div className="flex gap-3 items-center">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleComplete(task)}
                              className="text-green-600 hover:text-green-900"
                              disabled={completeTaskMutation.isPending}
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={deleteTaskMutation.isPending}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
