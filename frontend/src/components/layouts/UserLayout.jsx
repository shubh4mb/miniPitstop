// import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../user/navbar/Navbar';
import Footer from '../Footer';

const UserLayout = () => {
  return (<>
    <div className="user-layout px-2 md:px-6  min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
  
    </div>
    <Footer />
    </>
  );
};

export default UserLayout;
