// import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../user/navbar/Navbar';

const UserLayout = () => {
  return (
    <div className="user-layout">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default UserLayout;
