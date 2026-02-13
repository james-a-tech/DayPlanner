import { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DatePicker } from './DatePicker';
import { TaskList } from './TaskList';

export const Dashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'planner' | 'tasks'>('planner');

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} setActiveTab={setActiveTab} activeTab={activeTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} onLogout={onLogout} />

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <DatePicker />

            {activeTab === 'planner' && (
              <TaskList onEditTask={(task) => console.log('Edit task:', task)} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
