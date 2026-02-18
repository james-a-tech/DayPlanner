import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { useTimeSlots } from '../hooks/useTimeSlots';
import { useCreateTask } from '../hooks/useTasks';
import { useAppStore } from '../store/appStore';

interface TaskRow {
  id: string;
  name: string;
  duration: string;
}

interface TemplateBlock {
  id: string;
  name: string;
  start: Date;
  end: Date;
  duration: number;
}

interface ScheduledItem {
  id: string;
  name: string;
  start: Date;
  end: Date;
  duration: number;
  type: 'task' | 'template';
}

export const TaskTable = () => {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const { data: timeSlots } = useTimeSlots();
  const createTaskMutation = useCreateTask();
  const [rows, setRows] = useState<TaskRow[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [schedule, setSchedule] = useState<ScheduledItem[] | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('taskTableRows');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TaskRow[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRows(parsed);
          return;
        }
      } catch {
        // Ignore parse errors and fall back to default row
      }
    }
    setRows([{ id: 'row-1', name: '', duration: '' }]);
  }, []);

  useEffect(() => {
    if (rows.length > 0) {
      localStorage.setItem('taskTableRows', JSON.stringify(rows));
    }
  }, [rows]);

  const parseDurationToMinutes = (value: string) => {
    const cleaned = value.trim().toLowerCase();
    if (!cleaned) return 0;
    if (cleaned.includes(':')) {
      const [h, m] = cleaned.split(':').map((part) => parseInt(part, 10));
      return (h || 0) * 60 + (m || 0);
    }
    const hoursMatch = cleaned.match(/(\d+)\s*h/);
    const minsMatch = cleaned.match(/(\d+)\s*m/);
    if (hoursMatch || minsMatch) {
      const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
      const mins = minsMatch ? parseInt(minsMatch[1], 10) : 0;
      return hours * 60 + mins;
    }
    const numeric = parseInt(cleaned, 10);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}h`;
    }
    if (hours > 0) {
      return `${hours}:00h`;
    }
    return `0:${mins.toString().padStart(2, '0')}h`;
  };

  const formatTimeDisplay = (date: Date) =>
    date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const getTemplateBlocks = (): TemplateBlock[] => {
    if (!timeSlots) return [];
    const weekday = selectedDate.getDay();
    const blocks: TemplateBlock[] = [];
    for (const slot of timeSlots) {
      if (!slot.daysOfWeek || !slot.daysOfWeek.includes(weekday)) continue;
      const [sh, sm] = (slot.startTime || '09:00').split(':').map(Number);
      const [eh, em] = (slot.endTime || '10:00').split(':').map(Number);
      const start = new Date(selectedDate);
      start.setHours(sh, sm, 0, 0);
      const end = new Date(selectedDate);
      end.setHours(eh, em, 0, 0);
      if (end < start) end.setDate(end.getDate() + 1);
      const duration = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
      blocks.push({
        id: `tmpl-${slot._id}`,
        name: slot.name,
        start,
        end,
        duration,
      });
    }
    return blocks.sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `row-${prev.length + 1}`, name: '', duration: '' },
    ]);
  };

  const updateRow = (index: number, key: keyof TaskRow, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const moveRow = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= rows.length || to >= rows.length) return;
    setRows((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return [{ id: 'row-1', name: '', duration: '' }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const orderedRows = useMemo(() => rows, [rows]);

  const generateSchedule = () => {
    const tasks = orderedRows
      .map((row, index) => ({
        id: row.id,
        name: row.name.trim(),
        duration: parseDurationToMinutes(row.duration),
        order: index,
      }))
      .filter((task) => task.name && task.duration > 0)
      .sort((a, b) => a.order - b.order);

    const templateBlocks = getTemplateBlocks();
    const occupied = [...templateBlocks].sort((a, b) => a.start.getTime() - b.start.getTime());

    const dayStart = new Date(selectedDate);
    dayStart.setHours(9, 0, 0, 0);

    let cursor = dayStart;
    const planned: ScheduledItem[] = [];

    for (const task of tasks) {
      let start = new Date(cursor);
      let end = new Date(start.getTime() + task.duration * 60000);
      let safety = 0;

      while (safety < 500) {
        const conflict = occupied.find(
          (block) => start < block.end && end > block.start
        );
        if (!conflict) break;
        start = new Date(conflict.end);
        end = new Date(start.getTime() + task.duration * 60000);
        safety += 1;
      }

      planned.push({
        id: `task-${task.id}`,
        name: task.name,
        start,
        end,
        duration: task.duration,
        type: 'task',
      });
      cursor = end;
    }

    const combined: ScheduledItem[] = [
      ...templateBlocks.map((block) => ({
        id: block.id,
        name: block.name,
        start: block.start,
        end: block.end,
        duration: block.duration,
        type: 'template' as const,
      })),
      ...planned,
    ].sort((a, b) => a.start.getTime() - b.start.getTime());

    setSchedule(combined);
  };

  const handleConfirmSchedule = async () => {
    if (!schedule || schedule.length === 0) return;
    const tasksToCreate = schedule.filter((item) => item.type === 'task');
    if (tasksToCreate.length === 0) return;

    try {
      await Promise.all(
        tasksToCreate.map((item) =>
          createTaskMutation.mutateAsync({
            title: item.name,
            description: '',
            priority: 'medium',
            duration: item.duration,
            plannedStartTime: item.start.toISOString(),
            plannedEndTime: item.end.toISOString(),
            category: 'general',
          })
        )
      );
    } catch (error: any) {
      console.error('Failed to create planned tasks:', error);
      alert(`Failed to create planned tasks: ${error.response?.data?.detail || error.message}`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Task Priorities</h2>
        <button
          onClick={addRow}
          className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-teal-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Task Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orderedRows.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-gray-50"
                draggable
                onDragStart={() => setDraggedIndex(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverIndex(index);
                }}
                onDrop={() => {
                  if (draggedIndex !== null) {
                    moveRow(draggedIndex, index);
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }
                }}
                style={dragOverIndex === index ? { outline: '2px solid #0ea5e9' } : {}}
              >
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">
                      <GripVertical size={16} />
                    </span>
                    <input
                      type="text"
                      value={row.name}
                      onChange={(e) => updateRow(index, 'name', e.target.value)}
                      placeholder="Task name"
                      className="w-full bg-transparent focus:outline-none"
                    />
                    <div className="flex items-center gap-1 text-gray-400">
                      <button
                        type="button"
                        onClick={() => moveRow(index, index - 1)}
                        className="p-1 hover:text-gray-700"
                        disabled={index === 0}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(index, index + 1)}
                        className="p-1 hover:text-gray-700"
                        disabled={index === orderedRows.length - 1}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <input
                    type="text"
                    value={row.duration}
                    onChange={(e) => updateRow(index, 'duration', e.target.value)}
                    placeholder="e.g., 30m"
                    className="w-full bg-transparent focus:outline-none"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    type="button"
                    onClick={() => removeRow(index)}
                    className="text-red-600 hover:text-red-800"
                    aria-label="Remove task"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setSchedule(null)}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={generateSchedule}
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Plan
        </button>
      </div>

      {schedule && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Start
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    End
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedule.length === 0 ? (
                  <tr>
                    <td className="px-6 py-4 text-sm text-gray-500" colSpan={5}>
                      No tasks to schedule.
                    </td>
                  </tr>
                ) : (
                  schedule.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTimeDisplay(item.start)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatTimeDisplay(item.end)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDuration(item.duration)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${item.type === 'template' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {item.type === 'template' ? 'Template' : 'Planned'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleConfirmSchedule}
              className="bg-success text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
