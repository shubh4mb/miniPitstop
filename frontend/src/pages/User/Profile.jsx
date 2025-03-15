
import { useEffect, useState } from 'react'
import { fetchUserDetails } from '../../api/user.api'
import { updateUser } from '../../api/user.api'
import { toast } from 'react-toastify';



const Profile = () => {
    
    const [user, setUser] = useState({
        fullName: '',
        username: '',
    
        phone: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        fetchUserDetail();
    },[])
    const handleEdit = () => {
        setIsEditing(true);
        
        
    };

    const handleSave = async() => {
        
        try{
            const response = await updateUser(user);
          
            toast.success('Profile updated successfully');
            setIsEditing(false);
        }
        catch(error){
            toast.error(error.message);
            
        }
       
        
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setUser({ ...user, [name]: value });
    };

    const fetchUserDetail = async () => {
        try {
            const response = await fetchUserDetails();
            
            setUser(response.user);

        } catch (error) {
            //('Error fetching user details:', error);

        }
    };
    return (
        <div className=' w-full flex justify-center '>
            <div className="w-full md:w-[50%] p-4 mt-2 user-glass-effect rounded-md shadow-md">
                <h2 className="text-lg text-center font-bold mb-4">User  Profile</h2>
                <form>
                <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email
                        </label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            value={user.email}
                            
                            readOnly
                            disabled
                            className="block w-full p-2  text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="fullName"
                            value={user.fullName}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="block w-full p-2  text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                   
                    <div className="mb-4">
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={user.username}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="block w-full p-2  text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="phoneNumber"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            name="phone"
                            value={user.phone}
                            onChange={handleInputChange}
                            readOnly={!isEditing}
                            className="block w-full p-2  text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex justify-end">
                        {isEditing ? (
                            <button
                                type="button"
                                onClick={handleSave}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                Save
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleEdit}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            >
                                 Click here to Edit
                            </button> 
                        )}
                    </div>
                </form>
            </div>
            {/* <Otp/> */}

        </div>
    )
}

export default Profile