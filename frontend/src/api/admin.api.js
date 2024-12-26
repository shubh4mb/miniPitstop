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
        type: formData.logo.type || 'image/jpeg',
        lastModified: new Date().getTime()
      });
      form.append('logo', logoFile);
    }
    
    if (formData.banner) {
      const bannerFile = new File([formData.banner], 'banner.jpg', { 
        type: formData.banner.type || 'image/jpeg',
        lastModified: new Date().getTime()
      });
      form.append('banner', bannerFile);
    }

    // Remove the default Content-Type header to let the browser set it with boundary
    delete axiosInstance.defaults.headers['Content-Type'];
    
    const response = await axiosInstance.post('/api/admin/brands', form);
    
    // Reset the default Content-Type header
    axiosInstance.defaults.headers['Content-Type'] = 'application/json';
    
    return response;
  } catch (error) {
    console.error('Error adding brand:', error);
    return error.response;
  }
};

export const getBrands = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/brands');
    console.log(response);
    
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
      console.error('Server error:', { status: error.response.status, message });
      throw new Error(message);
    }
    
    if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    // Something else went wrong
    console.error('Error:', error.message);
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
      console.error('Server error:', { status: error.response.status, message });
      throw new Error(message);
    }
    
    if (error.request) {
      console.error('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    console.error('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const updateBrand = async (updateFormData, brandId) => {
  try {
    // Create FormData object for multipart/form-data
    const form = new FormData();
    
    // Append all available fields
    if (updateFormData.name !== undefined) form.append('name', updateFormData.name);
    if (updateFormData.description !== undefined) form.append('description', updateFormData.description);
    if (updateFormData.isActive !== undefined) form.append('isActive', updateFormData.isActive);
    if (updateFormData.offer !== undefined) form.append('offer', updateFormData.offer);
    
    // Handle logo file if present
    if (updateFormData.logo) {
      const logoFile = new File([updateFormData.logo], 'logo.jpg', { 
        type: updateFormData.logo.type || 'image/jpeg',
        lastModified: new Date().getTime()
      });
      form.append('logo', logoFile);
    }
    
    // Handle banner file if present
    if (updateFormData.banner) {
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

  // Debug: Log FormData contents
  console.log('FormData contents:');
  for (let pair of productFormData.entries()) {
    if (pair[1] instanceof Blob) {
      console.log(`${pair[0]}: Blob {
        type: ${pair[1].type},
        size: ${pair[1].size} bytes
      }`);
    } else {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
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
      console.error('Server error:', { status: error.response.status, message });
      throw new Error(message);
    }
    
    if (error.request) {
      console.error('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    console.error('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const getAllProducts = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/products');
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const toggleProductStatus = async (productId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/product/${productId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling product status:', error);
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
      'type', 'isActive'
    ];

    // Only append text fields that exist in formData
    textFields.forEach(field => {
      if (field in formData) {
        let value = formData[field];
        // Trim string values
        if (typeof value === 'string') {
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
    console.error('Error updating product:', error);
    throw error;
  }
};

export const toggleBrandStatus = async (brandId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/brands/${brandId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling brand status:', error);
    throw error;
  }
};

export const getSeries = async (brandId) => {
  try {
    const response = await axiosInstance.get(`/api/admin/brand/${brandId}/series`);
    return response.data;
  } catch (error) {
    console.error('Error fetching series:', error);
    throw error;
  }
};

export const getAllSeries = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/series');
    return response.data;
  } catch (error) {
    console.error('Error fetching series:', error);
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
          console.error('Server error:', { status: error.response.status, message });
          throw new Error(message);
      }
    }
    
    if (error.request) {
      // Request was made but no response received (network error)
      console.error('Network error:', error.message);
      throw new Error('Network error - Please check your connection');
    }
    
    // If it's our validation error or other error, rethrow it
    if (error.message === 'Brand and series name are required') {
      throw error;
    }
    
    // Something else went wrong
    console.error('Error:', error.message);
    throw new Error('An unexpected error occurred');
  }
};

export const fetchAllUsers = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const toggleUserStatus = async (userId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/users/${userId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error('Error toggling user status:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await axiosInstance.get('/api/admin/orders');
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await axiosInstance.patch(`/api/admin/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};
