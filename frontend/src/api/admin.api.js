import axiosInstance from '../../axiosConfig.js';


export const addBrand = async (formData) => {
  try {
    
    // Convert blob to File object
    const form = new FormData();
    form.append('name', formData.name);
    form.append('description', formData.description);
    form.append('isActive', formData.isActive);
    form.append('offer', formData.offer);
    
    // Create File objects from Blobs with specific types
    if (formData.logo) {
      const logoFile = new File([formData.logo], 'logo.jpg', { 
        type: formData.logo.type ,
        lastModified: new Date().getTime()
      });
      form.append('logo', logoFile);
    }
    
    if (formData.banner) {
      const bannerFile = new File([formData.banner], 'banner.jpg', { 
        type: formData.banner.type|| 'image/jpeg',
        lastModified: new Date().getTime()
      });
      form.append('banner', bannerFile);
    }

    // Remove the default Content-Type header to let the browser set it with boundary
    delete axiosInstance.defaults.headers['Content-Type'];
    console.log(form);
    
    const response = await axiosInstance.post('/api/admin/brands', form);
    
    // Reset the default Content-Type header
    axiosInstance.defaults.headers['Content-Type'] = 'application/json';
    
    return response;
  } catch (error) {
    //('Error adding brand:', error);
    return error.response;
  }
};

export const getBrands = async () => {
  try {
    
    const response = await axiosInstance.get('/api/admin/brands');
   
    
    // Successful response
    if (response.status === 200) {
      return response.data;
    }
    
    // Server returned a response but with an error status
    throw new Error(response.data?.message || 'Failed to fetch brands');
    
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Server responded with error status (4xx, 5xx)
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      //('Server error:', { status: error.response.status, message });
      throw new Error(message);
    }
    
    if (error.request) {
      // Request was made but no response received (network error)
      //('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    // Something else went wrong
    //('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const getBrand = async (brandId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/brand/${brandId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      //('Server error:', { status: error.response.status, message });
      throw new Error(message);
    }
    
    if (error.request) {
      //('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    //('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const updateBrand = async (updateFormData, brandId) => {
  try {
    
    // Create FormData object for multipart/form-data
    const form = new FormData();
    
    // Append all available fields
    if (updateFormData.name) form.append('name', updateFormData.name);
    if (updateFormData.description) form.append('description', updateFormData.description);
    if (updateFormData.isActive !== undefined) form.append('isActive', updateFormData.isActive);
    if (updateFormData.offer !== undefined) form.append('offer', updateFormData.offer);
    
    // Handle logo file if present
    if (updateFormData.logo instanceof Blob) {
      const logoFile = new File([updateFormData.logo], 'logo.jpg', { 
        type: updateFormData.logo.type || 'image/jpeg',
        lastModified: new Date().getTime()
      });
      form.append('logo', logoFile);
    }
    
    // Handle banner file if present
    if (updateFormData.banner instanceof Blob) {
      const bannerFile = new File([updateFormData.banner], 'banner.jpg', { 
        type: updateFormData.banner.type || 'image/jpeg',
        lastModified: new Date().getTime()
      });
      form.append('banner', bannerFile);
    }

    // Remove the default Content-Type header to let the browser set it with boundary
    delete axiosInstance.defaults.headers['Content-Type'];
    
    
    
    const response = await axiosInstance.patch(`/api/admin/brand/${brandId}`, form);
    
    // Reset the default Content-Type header
    axiosInstance.defaults.headers['Content-Type'] = 'application/json';
    
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Error updating brand');
    }
    throw error;
  }
};


export const addProduct = async (formData) => {

  // Create FormData object
  const productFormData = new FormData();

  // Add text fields
  productFormData.append('name', formData.name.trim());
  productFormData.append('description', formData.description.trim());
  productFormData.append('price', formData.price);
  productFormData.append('brand', formData.brand);
  productFormData.append('stock', formData.stock || 0);
  productFormData.append('series', formData.series || '');
  productFormData.append('buttonColor', formData.buttonColor || '#000000');
  productFormData.append('cardColor', formData.cardColor || '#ffffff');
  productFormData.append('scale', formData.scale || '');
  productFormData.append('type', formData.type || '');
  productFormData.append('isActive', formData.isActive || true);
  productFormData.append('offer', formData.offer || 0);

  // Add card image
  if (formData.card_image) {
    productFormData.append('card_image', formData.card_image);
  }

  // Add additional images
  if (formData.images?.length) {
    formData.images.forEach(image => {
      productFormData.append('images', image);
    });
  }


  
  try {
      const response = await axiosInstance.post('/api/admin/products', productFormData, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });

      if (response.status === 201) {
          return response.data;
      }

      throw new Error(response.data?.message || 'Failed to add product');

  } catch (error) {
      if (error.response) {
          switch (error.response.status) {
              case 404:
                  throw new Error('Selected brand not found');
              case 413:
                  throw new Error('File size too large');
              case 400:
                  throw new Error(error.response.data?.message || 'Invalid input data');
              case 500:
                  throw new Error('Server error occurred');
              default:
                  throw new Error('Failed to add product');
          }
      }
      
      throw new Error(error.message || 'Failed to add product');
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/product/${productId}`);
    
    if (response.status === 200) {
      return response.data;
    }
    
    throw new Error(response.data?.message || 'Failed to fetch product');
  } catch (error) {
    if (error.response) {
      const message = error.response.data?.message || `Server error: ${error.response.status}`;
      //('Server error:', { status: error.response.status, message });
      throw new Error(message);
    }
    
    if (error.request) {
      //('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    //('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const getAllProducts = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/admin/products?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    //('Error fetching products:', error);
    throw error;
  }
};

export const toggleProductStatus = async (productId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/product/${productId}/status`, { isActive });
    return response.data;
  } catch (error) {
    //('Error toggling product status:', error);
    throw error;
  }
};

export const updateProduct = async (productId, formData) => {
  try {
    // Create FormData object
    const productFormData = new FormData();

     // List of possible text fields
     const textFields = [
      'name', 'description', 'price', 'brand', 'stock', 
      'series', 'buttonColor', 'cardColor', 'scale', 
      'type', 'isActive', 'isFeatured'
    ];

    // Only append text fields that exist in formData
    textFields.forEach(field => {
      if (field in formData) {
        let value = formData[field];
        // Convert boolean values to strings explicitly as 'true' or 'false'
        if (typeof value === 'boolean') {
          value = value.toString();
        }
        // Trim string values
        else if (typeof value === 'string') {
          value = value.trim();
        }
        productFormData.append(field, value);
      }
    });

     // Add removedImageIndexes if present
     if (formData.removedImageIndexes?.length > 0) {
      productFormData.append('removedImageIndexes', JSON.stringify(formData.removedImageIndexes));
    }

    // Add card image only if it's a new file (Blob)
    if (formData.card_image instanceof Blob) {
      productFormData.append('card_image', formData.card_image);
    }

    // Add additional images only if they are new files (Blobs)
    if (formData.images?.length) {
      formData.images.forEach(image => {
        if (image instanceof Blob) {
          productFormData.append('images', image);
        }
      });
    }
    const response = await axiosInstance.patch(`/api/admin/product/${productId}`, productFormData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.status === 200) {
      return response.data;
    }

    throw new Error(response.data?.message || 'Failed to update product');
  } catch (error) {
    //('Error updating product:', error);
    throw error;
  }
};

export const toggleBrandStatus = async (brandId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/brands/${brandId}/status`, { isActive });
    return response.data;
  } catch (error) {
    //('Error toggling brand status:', error);
    throw error;
  }
};

export const toggleSeriesStatus = async (seriesId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/series/${seriesId}/status`, { isActive });
    return response.data;
  } catch (error) {
    //('Error toggling series status:', error);
    throw error;
  }
};

export const getSeries = async (brandId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/brand/${brandId}/series`);
    return response.data;
  } catch (error) {
    //('Error fetching series:', error);
    throw error;
  }
};

export const getAllSeries = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/series');
    return response.data;
  } catch (error) {
    //('Error fetching series:', error);
    throw error;
  }
};

export const addSeries = async (formData) => {
  try {
    // Input validation
    if (!formData.brandId || !formData.name) {
      throw new Error('Brand and series name are required');
    }

    const response = await axiosInstance.post('/api/admin/series', formData);
    
    // Successful response (201 for resource creation)
    if (response.status === 201 || response.status === 200) {
      return response.data;
    }
    
    // Server returned a response but with an error status
    throw new Error(response.data?.message || 'Failed to add series');
    
  } catch (error) {
    // Handle different types of errors
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 409:
          throw new Error('A series with this name already exists');
        case 404:
          throw new Error('Selected brand not found');
        case 400:
          throw new Error(error.response.data?.message || 'Invalid series data');
        default:
          const message = error.response.data?.message || `Server error: ${error.response.status}`;
          //('Server error:', { status: error.response.status, message });
          throw new Error(message);
      }
    }
    
    if (error.request) {
      // Request was made but no response received (network error)
      //('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    // If it's our validation error or other error, rethrow it
    if (error.message === 'Brand and series name are required') {
      throw error;
    }
    
    // Something else went wrong
    //('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const fetchAllUsers = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    //('Error fetching users:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    //('Error toggling user status:', error);
    throw error;
  }
};

export const getAllOrders = async (page = 1, limit = 10) => {
  try {
    const response = await axiosInstance.get(`/api/admin/orders?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    //('Error fetching orders:', error);
    throw error;
  }
};

export const getSingleOrder = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/order/${orderId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addCoupon = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/admin/addcoupon', formData);
    return response.data;
  } catch (error) {
    //('Error adding coupon:', error);
    throw error;
  }
};

export const fetchCoupons = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/coupons');
    return response.data;
  } catch (error) {
    //('Error fetching coupons:', error);
    throw error;
  }
};

export const updateCouponStatus = async (couponId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/coupon/${couponId}/status`, { isActive });
    return response.data;
  } catch (error) {
    //('Error updating coupon status:', error);
    throw error;
  }
};

export const fetchCoupon = async (id) => {
  try {
    const response = await axiosInstance.get(`/api/admin/coupon/${id}`);
    return response.data;
  } catch (error) {
    //('Error fetching coupon:', error);
    throw error;
  }
};


export const updateCoupon = async (couponId, formData) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/coupon/${couponId}`, formData);
    return response.data;
  } catch (error) {
    //('Error updating coupon:', error);
    throw error;
  }
}; 

// Get sales report data
export const getSalesReport = async (timeFilter, startDate = null, endDate = null) => {
    try {
        const params = { timeFilter };
        if (timeFilter === 'custom') {
            params.startDate = startDate;
            params.endDate = endDate;
        }

        const response = await axiosInstance.get('/api/admin/sales-report', { params });
        return response.data;
    } catch (error) {
        //('Sales report API error:', error);
        //('Error response:', error.response?.data);
        throw error.response?.data || error.message;
    }
};

// Download sales report
export const downloadSalesReport = async (timeFilter, startDate = null, endDate = null ) => {
    try {
        const params = { timeFilter };
        if (timeFilter === 'custom') {
            params.startDate = startDate;
            params.endDate = endDate;
        }

        const response = await axiosInstance.get('/api/admin/sales-report/download', { 
            params,
            responseType: 'blob'
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        
        // Set the download filename
        const filename = `sales-report-${timeFilter}.pdf`;
        link.setAttribute('download', filename);
        
        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL
        window.URL.revokeObjectURL(url);
    } catch (error) {
        //('Download sales report error:', error);
        throw error.response?.data || error.message;
    }
}; 

// Get revenue chart data
export const getRevenueChartData = async (timeFilter, startDate = null, endDate = null) => {
    try {
        const params = { timeFilter };
        if (timeFilter === 'custom') {
            params.startDate = startDate;
            params.endDate = endDate;
        }

      
        const response = await axiosInstance.get('/api/admin/sales-report/revenue-chart', { params });
       
        return response.data;
    } catch (error) {
        //('Revenue chart API error:', error);
        //('Error response:', error.response?.data);
        throw error.response?.data || error.message;
    }
};

export const downloadSalesReportExcel = async (timeFilter, startDate = null, endDate = null) => {
  try {
      const params = { timeFilter };
      if (timeFilter === 'custom') {
          params.startDate = startDate;
          params.endDate = endDate;
      }
      
      const response = await axiosInstance.get('/api/admin/sales-report/download/excel', { 
          params,
          responseType: 'arraybuffer'
      });

      return {
        success: true,
        data: response.data
      };
  } catch (error) {
      //('Error downloading report:', error);
      const errorMessage = error.response?.data 
          ? new TextDecoder().decode(error.response.data)
          : 'Failed to download Excel report';
      return {
        success: false,
        message: errorMessage
      };
  }
};

export const bestSellingProducts = async()=>{
  try{
    const response = await axiosInstance.get('/api/admin/products/best-selling');
    return response.data;
  }catch(error){
    //('Error fetching best selling products:', error);
    return {
      success: false,
      message: 'Failed to fetch best selling products'
    };
  }
}

export const addBanner = async (formData) => {
  try {
    // Remove the default Content-Type header to let the browser set it with boundary
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    
    const response = await axiosInstance.post('/api/admin/banners', formData, config);
    return response.data;
  } catch (error) {
    //('Error adding banner:', error);
    throw error;
  }
}