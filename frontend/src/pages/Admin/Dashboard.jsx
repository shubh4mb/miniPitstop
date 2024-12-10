// import Sidebar from "../../components/admin/Sidebar"

const Dashboard = () => {
  return (
 
      <div className="w-[100%] bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="bg-blue-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold">150</p>
          </div>
          <div className="bg-green-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
            <p className="text-3xl font-bold">25</p>
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Total Services</h3>
            <p className="text-3xl font-bold">12</p>
          </div>
        </div>
      </div>
    
  )
}

export default Dashboard