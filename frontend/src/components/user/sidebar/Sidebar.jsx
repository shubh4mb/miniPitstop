import { NavLink } from 'react-router-dom';

 const Sidebar = () => {
    const menuItems = [
        { path: '/profile/dashboard', label: 'Profile', icon: '📊' },
        { path: '/profile/addresses', label: 'Address', icon: '👥' },
        { path: '/profile/cart', label: 'Cart', icon: '🔧' },
        { path: '/profile/products', label: 'Wallet', icon: '📅' },
        {path: '/profile/series', label: 'Wishlist', icon: '📅'},
        { path: '/profile/settings', label: 'Logout', icon: '⚙️' },
      ];
    return (
        <div className="user-glass-effect h-screen text-gray-700 p-4 shadow-lg">
        <div className="text-xl font-bold mb-8 p-2 " >
          <p className='text-gray-700'> Your Account</p>
        </div>
        <nav>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-300 normal-text-with-hover ${
                  isActive
                    ? 'user-glass-effect'
                    : 'user-glass-effect-hover'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
  )
}
export default Sidebar
