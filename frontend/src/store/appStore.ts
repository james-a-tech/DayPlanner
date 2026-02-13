import { create } from 'zustand';

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'completed';
  duration: number;
  plannedStartTime: string;
  plannedEndTime: string;
  actualDuration?: number;
  accomplishments?: string;
  improvements?: string;
}

interface TimeSlot {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  color: string;
  isFixed: boolean;
  daysOfWeek: number[];
}

interface AppStore {
  tasks: Task[];
  timeSlots: TimeSlot[];
  selectedDate: Date;
  setTasks: (tasks: Task[]) => void;
  setTimeSlots: (timeSlots: TimeSlot[]) => void;
  setSelectedDate: (date: Date) => void;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  removeTask: (id: string) => void;
  addTimeSlot: (slot: TimeSlot) => void;
  removeTimeSlot: (id: string) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  tasks: [],
  timeSlots: [],
  selectedDate: new Date(),
  setTasks: (tasks) => set({ tasks }),
  setTimeSlots: (timeSlots) => set({ timeSlots }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
  })),
  removeTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t._id !== id) })),
  addTimeSlot: (slot) => set((state) => ({ timeSlots: [...state.timeSlots, slot] })),
  removeTimeSlot: (id) => set((state) => ({
    timeSlots: state.timeSlots.filter((s) => s._id !== id),
  })),
}));
