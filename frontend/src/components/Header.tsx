import { useState } from 'react';
import { Menu, LogOut, Settings, Moon, Sun } from 'lucide-react';

export const Header = ({
  onMenuClick,
  onLogout,
  theme,
  onToggleTheme,
}: {
  onMenuClick: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    onLogout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-bold text-primary">📅 Day Planner</h1>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Settings size={24} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg p-2 z-50">
                <button
                  onClick={onToggleTheme}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg text-red-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
