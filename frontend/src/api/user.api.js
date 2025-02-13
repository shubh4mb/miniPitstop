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

export const getCartProducts = async () => {
  try {
    const response = await axiosInstance.get('/api/user/getCartProducts');
    return response.data;
  } catch (error) {
    console.error('Error fetching cart products:', error);
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

export const getSingleOrder = async (orderId) => {
    try {
        const response = await axiosInstance.get(`/api/user/order/${orderId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

export const searchBar = async (query) => {
  try {
    console.log(query);
    
    const response = await axiosInstance.get(`/api/user/products/search?searchTerm=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

export const fetchWishlist = async () => {
  try {
    const response = await axiosInstance.get('/api/user/wishlist');
    return response.data;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await axiosInstance.post('/api/user/wishlist', { productId });
    return response.data;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const fetchAllAvailableCoupons = async () => {
  try {
    const response = await axiosInstance.get('/api/user/allCoupons');
    return response.data;
  } catch (error) {
    console.error('Error fetching available coupons:', error);
    throw error;
  }
};

export const createRazorpayOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/api/user/razorpay/create-order', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyRazorpayPayment = async (paymentData) => {
  try {
    const response = await axiosInstance.post('/api/user/razorpay/verify', paymentData);
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
};

export const placeFailedOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post('/api/user/failedOrder', orderData);
    return response.data;
  } catch (error) {
    console.error('Error placing failed order:', error);
    throw error;
  }
};



export const createRazorpayWallet = async (amount) => {
  try {
    const response = await axiosInstance.post('/api/user/createWallet', { amount });
    return response.data;
  } catch (error) {
    console.error('Error creating Razorpay wallet order:', error);
    throw error;
  }
};

export const verifyRazorpayWallet = async (verifyData) => {
  try {
    const response = await axiosInstance.post('/api/user/verifyWallet', verifyData);
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay wallet payment:', error);
    throw error;
  }
};

export const getWallet = async () => {
  try {
    const response = await axiosInstance.get('/api/user/wallet');
    return response.data;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw error;
  }
}

export const downloadInvoice = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/user/downloadInvoice/${orderId}`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice_${orderId}.pdf`); // Set the filename
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
}

export const createRetryRazorpayPayment = async (orderId) => {
  try {
    const response = await axiosInstance.post(`/api/user/razorpay/retry/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error retrying Razorpay payment:', error);
    throw error;
  }
}

export const verifyRetryRazorpayPayment = async (verifyData) => {
  try {
    const response = await axiosInstance.post('/api/user/razorpay/verifyRetry', verifyData);
    return response.data;
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    throw error;
  }
}

export const retryPayment = async (orderId, paymentMethod) => {
  try {
    const response = await axiosInstance.post(`/api/user/retry/${orderId}`, { paymentMethod });
    return response.data;
  } catch (error) {
    console.error('Error retrying payment:', error);
    throw error;
  }
}

export const relatedProducts = async ( filterTerm) => {
  try{
    
    
    const response = await axiosInstance.post('/api/user/products/related', filterTerm);
    return response.data;
  }
  catch(error){ 
    console.error('Error fetching related products:', error);
    throw error;
  }
}

export const changePassword = async (oldPassword,newPassword) => {
  try {
    const response = await axiosInstance.post('/api/user/changePassword', { oldPassword,newPassword });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
}

export const getFeaturedProducts = async () => {
  try {
    const response = await axiosInstance.get('/api/user/products/featured');
    return response.data;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
}
