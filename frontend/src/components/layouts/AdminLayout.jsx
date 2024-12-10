// import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../admin/navbar/Navbar.jsx';
import Sidebar from '../admin/sidebar/Sidebar.jsx';

const AdminLayout = () => {
  return (
    <div className="admin-layout min-h-screen">
      <Navbar />

      <div className="flex gap-4 max-w-[1400px] mx-auto">
        <div className="w-[18%] min-h-screen">
          <Sidebar />
        </div>
        <div className="w-[82%] bg-white rounded-lg shadow-md p-6">
          <Outlet />
        </div>
      </div>
    </div>

  );
};

export default AdminLayout;
