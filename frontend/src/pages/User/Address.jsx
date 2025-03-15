import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { addAddress, updateAddress } from '../../api/user.api';

const Address = ({ addressData, isEditing, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const [errors, setErrors] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  useEffect(() => {
    if (isEditing && addressData) {
      setFormData({
        fullName: addressData.fullName || '',
        address: addressData.address || '',
        city: addressData.city || '',
        state: addressData.state || '',
        pincode: addressData.pincode || '',
        phone: addressData.phone || ''
      });
    }
  }, [addressData, isEditing]);

  const validateForm = () => {
    const newErrors = {};
    
    // Validate fullName (only letters and spaces)
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (!/^[a-zA-Z\s]{2,50}$/.test(formData.fullName.trim())) {
      newErrors.fullName = 'Full name must contain only letters and spaces (2-50 characters)';
    }

    // Validate address (minimum length)
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 10) {
      newErrors.address = 'Address must be at least 10 characters long';
    }

    // Validate city (only letters and spaces)
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.city.trim())) {
      newErrors.city = 'City must contain only letters and spaces';
    }

    // Validate state (only letters and spaces)
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(formData.state.trim())) {
      newErrors.state = 'State must contain only letters and spaces';
    }

    // Validate pincode (6 digits)
    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
      newErrors.pincode = 'Pincode must be exactly 6 digits';
    }

    // Validate phone (10 digits, starts with 6-9)
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    try {
      if (isEditing && addressData) {
        const response = await updateAddress(addressData._id, formData);
        toast.success(response.message || 'Address updated successfully');
      } else {
        const response = await addAddress(formData);
        toast.success(response.message || 'Address added successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || 'Failed to save address');
      //(error);
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:w-[50%] p-4 mt-2 user-glass-effect rounded-md shadow-md">
        <h2 className="text-lg text-center font-bold mb-4">
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </h2>
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
              className={`block w-full p-2 text-sm text-gray-700 rounded-md border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
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
              className={`block w-full p-2 text-sm text-gray-700 rounded-md border ${errors.address ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
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
                className={`block w-full p-2 text-sm text-gray-700 rounded-md border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
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
                className={`block w-full p-2 text-sm text-gray-700 rounded-md border ${errors.state ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.state && <p className="mt-1 text-xs text-red-500">{errors.state}</p>}
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
                maxLength="6"
                className={`block w-full p-2 text-sm text-gray-700 rounded-md border ${errors.pincode ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.pincode && <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>}
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
                maxLength="10"
                className={`block w-full p-2 text-sm text-gray-700 rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-blue-500 focus:border-blue-500`}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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