import  { useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { clearAuth } from '../../../utils/auth.utils';

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <nav className="user-glass-effect  my-2 p-4 text-gray-600 relative z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl text-red-600 font-bold tracking-tight hover:text-red-700 transition-colors">
          miniPitstop
        </div>
        <div className="flex items-center space-x-6">
          <a href="#" className="hover:text-red-600 transition-colors font-medium">Home</a>
          <a href="#" className="hover:text-red-600 transition-colors font-medium">Shop</a>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition-all w-64"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <a href="#" className="hover:text-red-600 transition-colors flex items-center space-x-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Wishlist</span>
          </a>
          <a href="#" className="hover:text-red-600 transition-colors flex items-center space-x-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Cart</span>
          </a>
          <div className="relative">
            <button 
              onClick={toggleDropdown} 
              className="flex items-center space-x-1 hover:text-red-600 transition-colors font-medium focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Account</span>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-[100]">
                <div className="py-1">
                  <div
                    onClick={()=>navigate('/profile/dashboard')}
                     className="group flex items-center px-4 py-2 text-sm normal-text-with-hover">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile
                  </div>
                  <a href="#" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    Orders
                  </a>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;