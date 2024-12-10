// import React from 'react';
import DataTable from '../../components/admin/table/DataTable';
import { toast } from 'react-toastify';
import { useEffect , useState } from 'react';
import { toggleUserStatus , fetchAllUsers} from '../../api/admin.api';

const Users = () => {
  const[users , setUsers] = useState([]);
  // Static users data
  const fetchUsers = async () => {
    try
    {
      const response = await fetchAllUsers();
      setUsers(response.users);
      console.log(response);
      
    }
    catch(error)
    {
      console.error('Error fetching users:', error);
      toast.error(error.message || 'Failed to load users');
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      
      // Refresh the brands list
      fetchUsers();
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error(error.message || 'Failed to update user status');
    }
  };
  // Column definitions
  const columns = [
    { field: 'fullName', header: 'Name' },
    { field: 'username', header: 'Username' },
    { field: 'email', header: 'Email' },
    {field: 'phone', header: 'Phone'},
    {field: 'authProvider', header: 'Provider'},
    {
      field: 'isActive',
      header: 'Status',
      render: (rowData) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleToggleActive(rowData._id, rowData.isActive)}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${rowData.isActive ? 'bg-blue-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={rowData.isActive}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${rowData.isActive ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      )
    }
  ];

  const handleView = (user) => {
    console.log('View user:', user);
  };

  // const handleEdit = (user) => {
  //   console.log('Edit user:', user);
  // };

  // const handleDelete = (user) => {
  //   console.log('Delete user:', user);
  // };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        {/* <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
          Add User
        </button> */}
      </div>

      <DataTable 
        columns={columns} 
        data={users}
        onView={handleView}
        actions={['view' ]} // Only show view and delete buttons
      />
    </div>
  );
};

export default Users;
