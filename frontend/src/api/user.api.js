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

export const filteredProducts = async (filterTerm , page , limit) => {
  try {
    const response = await axiosInstance.post('/api/user/products/filter', filterTerm , page , limit);
    return response.data;
  } catch (error) {
    console.error('Error fetching filtered products:', error);
    throw error;
  }
};

export const addToCart = async (productId) => {
  try {
    const response = await axiosInstance.post('/api/user/addToCart', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const removeFromCart = async (productId) => {
  try {
    const response = await axiosInstance.delete(`/api/user/removeFromCart/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const getCart = async () => {
  try {
    const response = await axiosInstance.get('/api/user/cart');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

export const updateCartItemQuantity = async (itemId, newQuantity) => {
  try {
    const response = await axiosInstance.patch(`/api/user/updateCartItemQuantity/${itemId}`, { quantity: newQuantity });
    return response.data;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

export const placeOrder = async (orderData) => {
  console.log(orderData);
  
  try {
    const response = await axiosInstance.post('/api/user/placeOrder', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
};

export const getUserOrders = async () => {
    try {
        const response = await axiosInstance.get('/api/user/orders', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const cancelOrder = async (orderId) => {
    try {
        const response = await axiosInstance.post(`/api/user/orders/${orderId}/cancel`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const returnOrder = async (orderId) => {
    try {
        const response = await axiosInstance.post(`/api/user/orders/${orderId}/return`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};