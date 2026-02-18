import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DatePicker } from './DatePicker';
import { TaskList } from './TaskList';
import { TaskTable } from './TaskTable';
import { TimeSlotTemplates } from '../pages/TimeSlots';

export const Dashboard = ({
  onLogout,
  theme,
  onToggleTheme,
}: {
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'planner' | 'tasks' | 'templates'>('planner');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} setActiveTab={setActiveTab} activeTab={activeTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={onLogout}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <DatePicker />

            {activeTab === 'planner' && (
              <TaskList onEditTask={(task) => console.log('Edit task:', task)} />
            )}
            {activeTab === 'tasks' && (
              <TaskTable />
            )}
            {activeTab === 'templates' && (
              <TimeSlotTemplates />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
