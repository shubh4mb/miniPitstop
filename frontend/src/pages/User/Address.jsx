import  { useState , useEffect} from 'react';
import { toast } from 'react-toastify';
import { addAddress, updateAddress } from '../../api/user.api';
import { useNavigate, useLocation } from 'react-router-dom';

const Address = () => {

    const navigate = useNavigate();
    const location = useLocation();
    const addressData = location.state?.addressData;
    console.log(addressData);

    
  const isEditing = location.state?.isEditing || false;
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(()=>{
    if(isEditing && addressData){
        setFormData({
        fullName: addressData.fullName || '',
        address: addressData.address || '',
        city: addressData.city || '',
        state: addressData.state || '',
        pincode: addressData.pincode || '',
        phone: addressData.phone || ''
      });
    }
  },[addressData])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Add API call to save address
      console.log('Form submitted:', formData);
      if(isEditing && addressData){
        const response = await updateAddress(addressData._id, formData);
        toast.success(response.message || 'Address updated successfully');
        navigate('/profile/addresses');
        return;
      }
      else{

      const response = await addAddress(formData);
        
      toast.success(response.message || 'Address added successfully');
      navigate('/profile/addresses');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to add address');
      console.error(error);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:w-[50%] p-4 mt-2 user-glass-effect rounded-md shadow-md">
        <h2 className="text-lg text-center font-bold mb-4">Add New Address</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              className="block w-full p-2 text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              rows="3"
              className="block w-full p-2 text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="block w-full p-2 text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                className="block w-full p-2 text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                Pincode
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                required
                pattern="[0-9]{6}"
                maxLength="6"
                className="block w-full p-2 text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                pattern="[0-9]{10}"
                maxLength="10"
                className="block w-full p-2 text-sm text-gray-700 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {isEditing ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Address;