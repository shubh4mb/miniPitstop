import { NavLink } from 'react-router-dom';

const Sidebar = () => {
//   const location = useLocation();
  
  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/admin/brands', label: 'Brands', icon: '🔧' },
    { path: '/admin/products', label: 'products', icon: '📅' },
    {path: '/admin/series', label: 'Series', icon: '📅'},
    { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="admin-glass-effect h-screen text-white p-4 shadow-lg">
      <div className="text-xl font-bold mb-8 p-2">
        MiniPitstop Admin
      </div>
      <nav>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-300 ${
                isActive
                  ? 'admin-glass-effect'
                  : 'admin-glass-effect-hover'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;