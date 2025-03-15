import { useState , useEffect } from 'react';
import { useNavigate , useParams} from 'react-router-dom';
import ImageCropper from '../../components/ImageCropper';
import Modal from '../../components/Modal';
import { addBrand , getBrand , updateBrand} from '../../api/admin.api.js';
import { toast } from 'react-toastify';

const AddBrand = () => {
  const navigate = useNavigate();
  const {brandId} = useParams();
  const [updateFormData, setUpdateFormData] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: null,
    banner: null,
    isActive: true,
    offer: 0
  });

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    logo: '',
    banner: '',
    offer: ''
  });

  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [cropperData, setCropperData] = useState({
    isOpen: false,
    imageUrl: null,
    type: null,
    aspectRatio: 1
  });
  const [loading, setLoading] = useState(false);

  // Add custom ratio states
  const [customRatio, setCustomRatio] = useState({
    width: 1,
    height: 1
  });
  const [useCustomRatio, setUseCustomRatio] = useState(false);

  const isEditMode = !!brandId;

  const validateForm = () => {
    const newErrors = {};

    // Validate name (2-50 characters, letters, numbers, and spaces)
    if (!formData.name.trim()) {
      newErrors.name = 'Brand name is required';
    } else if (!/^[a-zA-Z0-9\s]{2,50}$/.test(formData.name.trim())) {
      newErrors.name = 'Brand name must be 2-50 characters long and contain only letters, numbers, and spaces';
    }

    // Validate description (minimum 10 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    // Validate logo
    if (!isEditMode && !formData.logo && !logoPreview) {
      newErrors.logo = 'Logo is required';
    }

    // Validate banner
    if (!isEditMode && !formData.banner && !bannerPreview) {
      newErrors.banner = 'Banner is required';
    }

    // Validate offer (0-100)
    if (formData.offer < 0 || formData.offer > 100) {
      newErrors.offer = 'Offer must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (isEditMode) {
      const fetchBrand = async () => {
        try {
          const response = await getBrand(brandId);
          const brand = response.brand;
          
          const urlToBlob = async (url) => {
            try {
              const response = await fetch(url);
              const blob = await response.blob();
              return blob;
            } catch (error) {
              //('Error converting URL to Blob:', error);
              return null;
            }
          };
    
          // Convert logo to Blob
          let logoBlob = null;
          if (brand.logo?.url) {
            logoBlob = await urlToBlob(brand.logo.url);
          }
          // Convert banner to Blob
          let bannerBlob = null;
          if (brand.banner?.url) {
            bannerBlob = await urlToBlob(brand.banner.url);
          }
    
          // Update form data with brand details
          setFormData({
            name: brand.name || '',
            description: brand.description || '',
            offer: brand.offer || 0,
            logo: logoBlob,
            banner: bannerBlob,
            logo_preview: brand.logo?.url || null,
            banner_preview: brand.banner?.url || null, 
            isActive: brand.isActive ?? true
          });
          setLogoPreview(brand.logo?.url || null);
          setBannerPreview(brand.banner?.url || null);
        } catch (error) {
          //('Error fetching brand:', error);
          toast.error(error.message || 'Failed to load brand details');
        }
      };
      fetchBrand();
    }
  }, [brandId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked  } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const imageUrl = URL.createObjectURL(files[0]);
      setCropperData({
        isOpen: true,
        imageUrl,
        type: name,
        aspectRatio: name === 'logo' ? 1 : 32/9
      });
      // Reset custom ratio when opening cropper
      setCustomRatio({ width: 1, height: 1 });
      setUseCustomRatio(false);
    }
  };

  const handleCustomRatioChange = (e) => {
    const { name, value } = e.target;
    setCustomRatio(prev => ({
      ...prev,
      [name]: parseFloat(value) || 1
    }));
  };

  const handleCropComplete = ({ url, blob }) => {
    if (cropperData.type === 'logo') {
      setLogoPreview(url);
      setFormData(prev => ({ ...prev, logo: blob }));
      if(isEditMode){
        setUpdateFormData(prev => ({ ...prev, logo: blob }));
      }
    } else {
      setBannerPreview(url);
      setFormData(prev => ({ ...prev, banner: blob }));
      if(isEditMode){
        setUpdateFormData(prev => ({ ...prev, banner: blob }));
      }
    }
    setCropperData({ isOpen: false, imageUrl: null, type: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }
    setLoading(true);
    try {
      if (isEditMode) {
        // For edit mode, directly pass the form data object
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          offer: formData.offer,
          isActive: formData.isActive
        };

        // Only include logo and banner if they are new Blobs
        if (formData.logo instanceof Blob) {
          updateData.logo = formData.logo;
        }
        if (formData.banner instanceof Blob) {
          updateData.banner = formData.banner;
        }

        await updateBrand(updateData, brandId);
        toast.success('Brand updated successfully');
   
      } else {
        // For add mode, use FormData
        const updateData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          offer: formData.offer,
          isActive: formData.isActive
        };

        // Only include logo and banner if they are new Blobs
        if (formData.logo instanceof Blob) {
          updateData.logo = formData.logo;
        }
        if (formData.banner instanceof Blob) {
          updateData.banner = formData.banner;
        }
        console.log(formData.logo);
        
        await addBrand(formData);
        toast.success('Brand added successfully');
      }
      setLoading(false);
      navigate('/admin/brands');
    } catch (error) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} brand`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Add New Brand</h1>
        <p className="text-gray-600 mt-2">Fill in the details to add a new Brand</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logo Upload Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <label className="block text-lg font-medium text-gray-700 mb-4">
              Brand Logo
            </label>
            <div className="flex flex-col items-center justify-center">
              {logoPreview ? (
                <div className="relative w-48 h-48 mb-4">
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    className="w-full h-full object-contain rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setLogoPreview(null);
                      setFormData(prev => ({ ...prev, logo: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white mb-4">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">Click to upload logo</p>
                  </div>
                </div>
              )}
              <input
                type="file"
                name="logo"
                onChange={handleFileChange}
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required={!logoPreview}
              />
              {errors.logo && <p className="mt-1 text-xs text-red-500">{errors.logo}</p>}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Product Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? 'border-red-500' : ''}`}
                placeholder="Enter product name"
                required
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={6}
                className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Enter product description"
                required
              />
              {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
            </div>
          </div>
        </div>

        {/* Banner Upload Section */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <label className="block text-lg font-medium text-gray-700 mb-4">
            Product Banner
          </label>
          <div className="flex flex-col items-center justify-center">
            {bannerPreview ? (
              <div className="relative w-full h-[300px] mb-4">
                <img 
                  src={bannerPreview} 
                  alt="Banner preview" 
                  className="w-full h-full object-contain rounded-lg shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setBannerPreview(null);
                    setFormData(prev => ({ ...prev, banner: null }));
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="w-full h-[300px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500">Click to upload banner image</p>
                </div>
              </div>
            )}
            <input
              type="file"
              name="banner"
              onChange={handleFileChange}
              accept="image/*"
              className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              required={!bannerPreview}
            />
            {errors.banner && <p className="mt-1 text-xs text-red-500">{errors.banner}</p>}
          </div>
        </div>

        {/* Listed and Offer Section */}
        <div className="grid grid-cols-2 gap-6 mb-4">
          {/* Listed Status */}
          <div className="flex items-center space-x-2">
            <label className="text-lg font-medium text-gray-700">
              Listed
            </label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  isActive: e.target.checked
                });
                if(isEditMode){
                  setUpdateFormData({
                    ...updateFormData,
                    isActive: e.target.checked
                  });
                }
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          {/* Offer Field */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Offer (%)
            </label>
            <input
              type="number"
              name="offer"
              value={formData.offer}
              onChange={handleInputChange}
              min="0"
              max="100"
              className={`w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.offer ? 'border-red-500' : ''}`}
              placeholder="Enter offer percentage"
            />
            {errors.offer && <p className="mt-1 text-xs text-red-500">{errors.offer}</p>}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/brands')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Brand' : 'Add Brand')}
          </button>
        </div>
      </form>

      {/* Image Cropper Modal */}
      <Modal 
        isOpen={cropperData.isOpen} 
        onClose={() => setCropperData({ isOpen: false, imageUrl: null, type: null })}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Crop {cropperData.type === 'logo' ? 'Logo' : 'Banner'} Image
          </h2>

          {/* Custom Ratio Controls */}
          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="useCustomRatio"
                checked={useCustomRatio}
                onChange={(e) => setUseCustomRatio(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="useCustomRatio" className="text-sm font-medium text-gray-700">
                Use Custom Ratio
              </label>
            </div>

            {useCustomRatio && (
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width</label>
                  <input
                    type="number"
                    name="width"
                    value={customRatio.width}
                    onChange={handleCustomRatioChange}
                    min="0.1"
                    step="0.1"
                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Height</label>
                  <input
                    type="number"
                    name="height"
                    value={customRatio.height}
                    onChange={handleCustomRatioChange}
                    min="0.1"
                    step="0.1"
                    className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {cropperData.imageUrl && (
            <ImageCropper
              imageUrl={cropperData.imageUrl}
              onCropComplete={handleCropComplete}
              onCancel={() => setCropperData({ isOpen: false, imageUrl: null, type: null })}
              aspectRatio={useCustomRatio ? customRatio.width / customRatio.height : (cropperData.type === 'logo' ? 1 : 32/9)}
              circularCrop={cropperData.type === 'logo' && !useCustomRatio}
              minWidth={cropperData.type === 'logo' ? 300 : 1200}
              minHeight={cropperData.type === 'logo' ? 300 : 514}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddBrand;
