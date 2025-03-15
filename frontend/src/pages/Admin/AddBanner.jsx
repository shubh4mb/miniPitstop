import  { useState } from 'react';
import { toast } from 'react-toastify';
import ImageCropper from '../../components/ImageCropper';
import { useNavigate } from 'react-router-dom';
import { addBanner } from '../../api/admin.api.js';

const AddBanner = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cropperData, setCropperData] = useState({
    isOpen: false,
    imageUrl: null,
    file: null,
    aspectRatio: 16 / 9
  });

  const [customRatio, setCustomRatio] = useState({
    width: 16,
    height: 9
  });

  const [formData, setFormData] = useState({
    banner_type: '',
    image: null,
    image_preview: null,
    isActive: true
  });

  const [errors, setErrors] = useState({
    banner_type: '',
    image: ''
  });

  const bannerTypes = [
    { value: 'carousel', label: 'Main Carousel' },
    { value: 'deals', label: 'Deals Section' },
    { value: 'featured', label: 'Featured Section' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCropperData({
      isOpen: true,
      imageUrl: URL.createObjectURL(file),
      file
    });
  };

  const handleCropComplete = ({ url, blob }) => {
    setFormData(prev => ({
      ...prev,
      image: blob,
      image_preview: url
    }));
    setCropperData({
      isOpen: false,
      imageUrl: null,
      file: null
    });
  };

  const handleCustomRatioChange = (dimension, value) => {
    const numValue = parseFloat(value) || 1;
    setCustomRatio(prev => ({
      ...prev,
      [dimension]: numValue
    }));
    setCropperData(prev => ({
      ...prev,
      aspectRatio: dimension === 'width' ? numValue / customRatio.height : customRatio.width / numValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.banner_type) {
      newErrors.banner_type = 'Banner type is required';
    }

    if (!formData.image && !formData.image_preview) {
      newErrors.image = 'Banner image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!validateForm()) {
      const errorMessage = Object.values(errors)[0];
      toast.error(errorMessage);
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.banner_type);
      formDataToSend.append('isActive', formData.isActive);

      if (formData.image instanceof Blob) {
        formDataToSend.append('image', formData.image);
      } else {
        throw new Error('Banner image is required');
      }

      const response = await addBanner(formDataToSend);
      
      if (response.success) {
        toast.success('Banner added successfully!');
        navigate('/admin/banners');
      } else {
        throw new Error(response.message || 'Failed to add banner');
      }
    } catch (error) {
      //('Error adding banner:', error);
      toast.error(error.message || 'Failed to add banner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Add New Banner</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
         

          {/* Banner Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Banner Type
            </label>
            <select
              name="banner_type"
              value={formData.banner_type}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-red-500 focus:border-red-500 sm:text-sm
                ${errors.banner_type ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Type</option>
              {bannerTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.banner_type && (
              <p className="mt-1 text-sm text-red-500">{errors.banner_type}</p>
            )}
          </div>

      

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Banner Image
            </label>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="banner-image"
              />
              <label
                htmlFor="banner-image"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Choose Image
              </label>
              {formData.image_preview && (
                <div className="relative w-32 h-32">
                  <img
                    src={formData.image_preview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, image: null, image_preview: null }))}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="mt-1 text-sm text-red-500">{errors.image}</p>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Active
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}
            >
              {loading ? 'Adding Banner...' : 'Add Banner'}
            </button>
          </div>
        </form>
      </div>

      {/* Image Cropper Modal */}
      {cropperData.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex items-center justify-center min-h-screen">
            <div className="bg-white rounded-lg p-6 w-[90%] max-w-4xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Crop Image</h3>
                <button
                  onClick={() => setCropperData({ ...cropperData, isOpen: false })}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Custom Ratio Input */}
              <div className="mb-4 flex items-center space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width</label>
                  <input
                    type="number"
                    min="1"
                    value={customRatio.width}
                    onChange={(e) => handleCustomRatioChange('width', e.target.value)}
                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
                <div className="text-xl font-medium text-gray-500">:</div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height</label>
                  <input
                    type="number"
                    min="1"
                    value={customRatio.height}
                    onChange={(e) => handleCustomRatioChange('height', e.target.value)}
                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="h-[400px] relative mb-4">
                <ImageCropper
                  imageUrl={cropperData.imageUrl}
                  onCropComplete={handleCropComplete}
                  aspectRatio={cropperData.aspectRatio}
                  onCancel={() => setCropperData({ ...cropperData, isOpen: false })}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setCropperData({ ...cropperData, isOpen: false })}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddBanner;