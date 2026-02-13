

export const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const menuItems = [
    { label: 'Dashboard', icon: '📊', href: '#dashboard' },
    { label: 'Tasks', icon: '✓', href: '#tasks' },
    { label: 'Calendar', icon: '📅', href: '#calendar' },
    { label: 'Settings', icon: '⚙️', href: '#settings' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform lg:relative lg:transform-none z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-primary mb-8">Menu</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700 font-medium"
              >
                <span className="text-xl">{item.icon}</span>
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
