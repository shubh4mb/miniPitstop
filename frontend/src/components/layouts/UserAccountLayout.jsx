// import React from 'react'
import { Outlet } from 'react-router-dom'
import  Sidebar  from "../user/sidebar/Sidebar"
import Navbar from "../user/navbar/Navbar"

const UserAccountLayout = () => {
  return (

<div className="user-layout min-h-screen px-6">
      <Navbar/>

      <div className="flex gap-6 pt-3 ">
        <div className=" min-h-screen">
          <Sidebar />
        </div>
        <div className="w-[82%]  rounded-lg ">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default UserAccountLayout