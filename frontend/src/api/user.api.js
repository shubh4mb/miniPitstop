import axiosInstance from '../../axiosConfig.js';

export const fetchUserDetails = async () => {
    try {
        const response = await axiosInstance.get('/api/user/userDetails');
        return response.data;
    } catch (error) {
        console.error('Error fetching user details:', error);
        throw error;
    }
};

export const updateUser = async (user) => {
    try {
        const response = await axiosInstance.patch('/api/user/userDetails', user);
        return response.data;
    } catch (error) {
        console.error('Error updating user details:', error);
        throw error;
    }
};

export const addAddress = async (formData)=>{
    try {
        const response = await axiosInstance.post('/api/user/addAddress', formData);
        return response.data;
    } catch (error) {
        console.error('Error adding address:', error);
        throw error;
    }
}

export const getAddresses = async ()=>{
    try {
        const response = await axiosInstance.get('/api/user/addresses');
        return response.data;
    } catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
}

export const updateAddress = async (addressId, formData)=>{
    try {
        const response = await axiosInstance.patch(`/api/user/address/${addressId}`, formData);
        return response.data;
    } catch (error) {
        console.error('Error updating address:', error);
        throw error;
    }
}

export const deleteAddress = async (addressId)=>{
    try {
        const response = await axiosInstance.delete(`/api/user/addresses/${addressId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting address:', error);
        throw error;
    }
}