import { NavLink } from 'react-router-dom';
import { FaUser, FaShoppingCart, FaHeart, FaWallet ,FaExchangeAlt  } from 'react-icons/fa';
import { FaClipboardList } from "react-icons/fa";

 const Sidebar = () => {
  const menuItems = [
    { path: '/profile/dashboard', label: 'Profile', icon: <FaUser /> },
    { path: '/profile/cart', label: 'Cart', icon: <FaShoppingCart /> },
    { path: '/profile/wishlist', label: 'Wishlist', icon: <FaHeart /> },
    // { path: '/profile/settings', label: 'Logout', icon: <FaSignOutAlt /> },
    {path: '/profile/orderHistory', label:'Orders',icon:<FaClipboardList/>},
    {path :'/profile/wallet', label:'Wallet', icon:<FaWallet />},
    {path:'profile/changePassword',label:'Change Password', icon:<FaExchangeAlt />}

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
                `flex items-center  gap-3 px-4 py-3 rounded-lg mb-2 transition-all duration-300 normal-text-with-hover ${
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
