import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { SketchPicker } from 'react-color';
import { getBrands , addProduct ,getProduct,updateProduct,getSeries} from '../../api/admin.api.js';
import ProductCard from '../../components/ProductCard';
import { FaTrash, FaImage } from 'react-icons/fa';
import ImageCropper from '../../components/ImageCropper';
import Modal from '../../components/Modal.jsx';
import { useNavigate , useParams} from 'react-router-dom';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    stock: 0,
    scale: '',
    type: '',
    price: 0,
    offer: 0,
    brand: '',
    series: '',
    images: [],
    card_image: null,
    card_image_preview: null,
    image_previews: [],
    buttonColor: '#000000',
    cardColor: '#ffffff',
    isActive: true
  });

  const [updateFormData, setUpdateFormData] = useState({});
  const [removedImageIndexes, setRemovedImageIndexes] = useState([]);

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    stock: '',
    scale: '',
    type: '',
    price: '',
    offer: '',
    brand: '',
    series: '',
    images: '',
    card_image: ''
  });

  const {productId} = useParams();
  const isEditMode = !!productId;

  const navigate = useNavigate();
  const [brands, setBrands] = useState([]);
  const [series, setSeries] = useState([]);
  const [showButtonColorPicker, setShowButtonColorPicker] = useState(false);
  const [showCardColorPicker, setShowCardColorPicker] = useState(false);
  const [cropperData, setCropperData] = useState({
    isOpen: false,
    imageUrl: null,
    imageType: null,
    file: null
  });

  const buttonPickerRef = useRef(null);
  const cardPickerRef = useRef(null);

  const productTypes = [
    'Sedan',
    'SUV',
    'Hatchback',
    'Sports Car',
    'Luxury',
    'Electric',
  ];

  const scales = ['1:18', '1:24', '1:32', '1:43', '1:64'];

  const [cropperSettings, setCropperSettings] = useState({
    card_image: {
      aspectRatio: 21/9,
      minWidth: 700,
      minHeight: 400,
      customRatio: { width: 21, height: 9 }
    },
    product_image: {
      aspectRatio: 1,
      minWidth: 300,
      minHeight: 300,
      customRatio: { width: 1, height: 1 }
    }
  });

  const aspectRatioOptions = [
    { label: '16:9', value: 16/9 },
    { label: '21:9', value: 21/9 },
    { label: '4:3', value: 4/3 },
    { label: '1:1', value: 1 },
    { label: 'Custom', value: 'custom' }
  ];

  const handleAspectRatioChange = (e) => {
    const selectedValue = e.target.value;
    const imageType = cropperData.imageType === 'card_image' ? 'card_image' : 'product_image';
    
    if (selectedValue === 'custom') {
      setCropperSettings(prev => ({
        ...prev,
        [imageType]: {
          ...prev[imageType],
          aspectRatio: prev[imageType].customRatio.width / prev[imageType].customRatio.height
        }
      }));
    } else {
      setCropperSettings(prev => ({
        ...prev,
        [imageType]: {
          ...prev[imageType],
          aspectRatio: parseFloat(selectedValue)
        }
      }));
    }
  };

  const handleCustomRatioChange = (dimension, value) => {
    const numValue = parseInt(value) || 1;
    const imageType = cropperData.imageType === 'card_image' ? 'card_image' : 'product_image';
    
    setCropperSettings(prev => ({
      ...prev,
      [imageType]: {
        ...prev[imageType],
        customRatio: {
          ...prev[imageType].customRatio,
          [dimension]: numValue
        },
        aspectRatio: dimension === 'width' 
          ? numValue / prev[imageType].customRatio.height 
          : prev[imageType].customRatio.width / numValue
      }
    }));
  };

  useEffect(() => {
    fetchBrands();
    
    if (isEditMode) {
      fetchProductDetails();
    }

    // Add click outside handler
    const handleClickOutside = (event) => {
      if (buttonPickerRef.current && !buttonPickerRef.current.contains(event.target)) {
        setShowButtonColorPicker(false);
      }
      if (cardPickerRef.current && !cardPickerRef.current.contains(event.target)) {
        setShowCardColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditMode,productId]);

  const fetchProductDetails = async () => {
    try {
      const data = await getProduct(productId);
      const product = data.product;
      
      // Fetch series for the product's brand
      if (product.brand?._id) {
        fetchSeries(product.brand._id);
      }

      const urlToBlob = async (url) => {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          return blob;
        } catch (error) {
          console.error('Error converting URL to Blob:', error);
          return null;
        }
      };

      // Convert existing images to Blobs
      let existingImages = [];
      if (product.images && product.images.length > 0) {
        const blobPromises = product.images.map(img => urlToBlob(img.url));
        existingImages = await Promise.all(blobPromises);
      }

      // Convert card image to Blob
      let cardImageBlob = null;
      if (product.card_image?.url) {
        cardImageBlob = await urlToBlob(product.card_image.url);
      }

      // Update form data with product details
      setFormData({
        name: product.name || '',
        description: product.description || '',
        stock: product.stock || 0,
        scale: product.scale || '',
        type: product.type || '',
        price: product.price || 0,
        offer: product.offer || 0,
        brand: product.brand?._id || '',
        series: product.series?._id || '',
        images: existingImages,
        card_image: cardImageBlob,
        card_image_preview: product.card_image?.url || null,
        image_previews: product.images?.map(img => img.url) || [],
        buttonColor: product.buttonColor || '#000000',
        cardColor: product.cardColor || '#ffffff',
        isActive: product.isActive ?? true
      });
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(error.message || 'Failed to load product details');
    }
  };

  const fetchBrands = async () => {
    // setIsLoading(true);
    try {
      const data = await getBrands();
      setBrands(data.brands || []);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error(error.message || 'Failed to load brands');
      setBrands([]);
    } finally {
      // setIsLoading(false);
    }
  };

  const fetchSeries = async (brandId) => {
    if (!brandId) return;
    
    try {
      const response = await getSeries(brandId);
      setSeries(response.series || []);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast.error(error.message || 'Failed to load series');
      setSeries([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate name (2-100 characters)
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      newErrors.name = 'Product name must be between 2 and 100 characters';
    }

    // Validate description (minimum 20 characters)
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    // Validate stock (non-negative integer)
    if (formData.stock === '') {
      newErrors.stock = 'Stock quantity is required';
    } else if (!Number.isInteger(Number(formData.stock)) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a non-negative whole number';
    }

    // Validate scale
    if (!formData.scale) {
      newErrors.scale = 'Scale is required';
    }

    // Validate type
    if (!formData.type) {
      newErrors.type = 'Product type is required';
    }

    // Validate price (non-negative number with 2 decimal places)
    if (formData.price === '') {
      newErrors.price = 'Price is required';
    } else if (isNaN(formData.price) || Number(formData.price) < 0) {
      newErrors.price = 'Price must be a non-negative number';
    } else if (!/^\d+(\.\d{0,2})?$/.test(formData.price)) {
      newErrors.price = 'Price can have at most 2 decimal places';
    }

    // Validate offer (0-100)
    if (formData.offer === '') {
      newErrors.offer = 'Offer percentage is required';
    } else if (isNaN(formData.offer) || Number(formData.offer) < 0 || Number(formData.offer) > 100) {
      newErrors.offer = 'Offer must be between 0 and 100';
    }

    // Validate brand
    if (!formData.brand) {
      newErrors.brand = 'Brand is required';
    }

    // Validate series
    if (!formData.series) {
      newErrors.series = 'Series is required';
    }

    // Validate images
    if (!isEditMode && (!formData.images || formData.images.length === 0)) {
      newErrors.images = 'At least one product image is required';
    }

    // Validate card image
    if (!isEditMode && !formData.card_image) {
      newErrors.card_image = 'Card image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Always update formData to keep the form in sync
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If in edit mode, also track what changed
    if (isEditMode) {
      setUpdateFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Handle brand selection
    if (name === 'brand') {
      
      
      setFormData(prev => ({ ...prev, series: '' }));
      if (isEditMode) {
        setUpdateFormData(prev => ({ ...prev, series: '' }));
      }
      if (value) {
        fetchSeries(value);
      } else {
        setSeries([]);
      }
    }

    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    const numberValue = value === '' ? 0 : Number(value);
  
    setFormData(prev => ({
      ...prev,
      [name]: numberValue
    }));
   
    if(isEditMode) {
      setUpdateFormData(prev => ({
        ...prev,
        [name]: numberValue
      }));
    }

    // Clear error when user starts typing
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const handleImageUpload = (e, type) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;

    if (type === 'card_image') {
      const imageUrl = URL.createObjectURL(files[0]);
      setCropperData({
        isOpen: true,
        imageUrl,
        imageType: type,
        file: files[0]
      });
    } else {
      const imageUrls = files.map(file => ({
        url: URL.createObjectURL(file),
        file
      }));
      setCropperData({
        isOpen: true,
        imageUrl: imageUrls[0].url,
        imageType: "additional",
        file: files[0]
      });
    }
  };

  const removeImage = (index) => {
    // Always update formData to keep the UI in sync
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      image_previews: prev.image_previews.filter((_, i) => i !== index)
    }));

    // If in edit mode, track the removed image index
    if (isEditMode) {
      setRemovedImageIndexes(prev => [...prev, index]);
      setUpdateFormData(prev => ({
        ...prev,
        removedImageIndexes: [...(prev.removedImageIndexes || []), index]
      }));
    }
  };

  const handleCropComplete = ({ url, blob }) => {
    if (cropperData.imageType === 'card_image') {
      setFormData(prev => ({
        ...prev,
        card_image: blob,
        card_image_preview: url
      }));
      if (isEditMode) {
        setUpdateFormData(prev => ({
          ...prev,
          card_image: blob
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, blob],
        image_previews: [...(prev.image_previews || []), url]
      }));
      if (isEditMode) {
        setUpdateFormData(prev => ({
          ...prev,
          images: [...(prev.images || []), blob],
          image_previews: [...(prev.image_previews || []), url]
        }));
      }
    }
    setCropperData({ isOpen: false, imageUrl: null, imageType: null, file: null });
  };

  const handleCropCancel = () => {
    setCropperData({ isOpen: false, imageUrl: null, imageType: null, file: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    try {
      // Form validation
      const validationErrors = [];
      if (!formData.name?.trim()) validationErrors.push('Product name is required');
      if (!formData.description?.trim()) validationErrors.push('Description is required');
      if (!formData.price) validationErrors.push('Price is required');
      if (!formData.brand) validationErrors.push('Brand is required');
      if (!formData.card_image) validationErrors.push('Card image is required');
      if(!formData.series) validationErrors.push('Series is required');

      if (validationErrors.length > 0) {
        validationErrors.forEach(error => toast.error(error));
        return;
      }

      let response;
      if (isEditMode) {
        // Include removedImageIndexes in the update data
        const updateDataWithRemovedImages = {
          ...updateFormData,
          removedImageIndexes: removedImageIndexes
        };
        response = await updateProduct(productId, updateDataWithRemovedImages);
        toast.success('Product updated successfully!');
      } else {
        response = await addProduct(formData);
        toast.success('Product added successfully!');
      }
      
      // Navigate to products list
      navigate('/admin/products');

    } catch (error) {
      toast.error(error.message || `Failed to ${isEditMode ? 'update' : 'add'} product`);
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} product:`, error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Add New Product</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                    rows="3"
                    required
                  />
                  {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleNumberInput}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    required
                  />
                  {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Scale</label>
                  <select
                    name="scale"
                    value={formData.scale}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.scale ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Scale</option>
                    {scales.map(scale => (
                      <option key={scale} value={scale}>{scale}</option>
                    ))}
                  </select>
                  {errors.scale && <p className="mt-1 text-xs text-red-500">{errors.scale}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Type</option>
                    {productTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
                </div>
              </div>
            </div>

            {/* Colors Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Button Color</label>
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                      style={{ backgroundColor: formData.buttonColor }}
                      onClick={() => setShowButtonColorPicker(!showButtonColorPicker)}
                    />
                    {showButtonColorPicker && (
                      <div className="absolute z-10" ref={buttonPickerRef}>
                        <SketchPicker
                          color={formData.buttonColor}
                          onChange={(color) => setFormData(prev => ({
                            ...prev,
                            buttonColor: color.hex
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Card Color</label>
                  <div className="flex items-center space-x-4">
                    <div
                      className="w-12 h-12 rounded-lg border-2 border-gray-300 cursor-pointer shadow-sm"
                      style={{ backgroundColor: formData.cardColor }}
                      onClick={() => setShowCardColorPicker(!showCardColorPicker)}
                    />
                    {showCardColorPicker && (
                      <div className="absolute z-10" ref={cardPickerRef}>
                        <SketchPicker
                          color={formData.cardColor}
                          onChange={(color) => setFormData(prev => ({
                            ...prev,
                            cardColor: color.hex
                          }))}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Price and Brand Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Price & Brand</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleNumberInput}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    required
                  />
                  {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Offer (%)</label>
                  <input
                    type="number"
                    name="offer"
                    value={formData.offer}
                    onChange={handleNumberInput}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.offer ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max="100"
                    required
                  />
                  {errors.offer && <p className="mt-1 text-xs text-red-500">{errors.offer}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Brand</label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.brand ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Brand</option>
                    {brands.map(brand => (
                      <option key={brand._id} value={brand._id}>{brand.name}</option>
                    ))}
                  </select>
                  {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand}</p>}
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700">Series</label>
                  <select
                    name="series"
                    value={formData.series}
                    onChange={handleInputChange}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.series ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                    disabled={!formData.brand}
                  >
                    <option value="">Select Series</option>
                    {series.map(series => (
                      <option key={series._id} value={series._id}>{series.name}</option>
                    ))}
                  </select>
                  {errors.series && <p className="mt-1 text-xs text-red-500">{errors.series}</p>}
                </div>
              </div>
            </div>

            {/* Images Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-700">Images</h3>
              
              {/* Card Image */}
              <div className="mb-6">
                <label className="block mb-2 font-medium text-gray-700">Card Image</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50">
                    <input
                      type="file"
                      onChange={(e) => handleImageUpload(e, 'card_image')}
                      accept="image/*"
                      className="hidden"
                    />
                    {formData.card_image_preview ? (
                      <img src={formData.card_image_preview} alt="Card preview" className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <div className="text-center">
                        <FaImage className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-400">Add Card Image</span>
                      </div>
                    )}
                  </label>
                </div>
                {errors.card_image && <p className="mt-1 text-xs text-red-500">{errors.card_image}</p>}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">Additional Images</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.image_previews.map((image, index) => (
                    <div key={index} className="relative group">
                      <img src={image} alt={`Product ${index + 1}`} className="w-32 h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  
                  <label className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => handleImageUpload(e, 'additional')}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="text-center">
                      <FaImage className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-400">Add Images</span>
                    </div>
                  </label>
                </div>
                {errors.images && <p className="mt-1 text-xs text-red-500">{errors.images}</p>}
              </div>
            </div>

            {/* Active Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    isActive: e.target.checked
                  }))}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="font-medium text-gray-700">Active</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              {isEditMode ? 'Update Product' : 'Add Product'}
            </button>
          </form>
        </div>

        {/* Preview Section */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">Card Preview</h3>
            <div className="flex justify-center bg-gray-50 p-6 rounded-lg shadow-md">
              <ProductCard
                name={formData.name}
                scale={formData.scale}
                price={formData.price}
                card_image={formData.card_image_preview}
                brand={brands.find(b => b._id === formData.brand)?.name}
                buttonColor={formData.buttonColor}
                cardColor={formData.cardColor}
              />
            </div>
          </div>
        </div>
        
      </div>
      <Modal 
        isOpen={cropperData.isOpen} 
        onClose={() => setCropperData({ isOpen: false, imageUrl: null, imageType: null, file: null })}
      >
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Crop {cropperData.imageType === 'card_image' ? 'Card' : 'Product'} Image
          </h2>
          
          <div className="mb-4 space-y-2">
            <div className="flex items-center space-x-4">
              <label className="font-medium">Aspect Ratio:</label>
              <select 
                className="border rounded px-2 py-1"
                onChange={handleAspectRatioChange}
                value={
                  cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].aspectRatio === 
                  cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].customRatio.width / 
                  cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].customRatio.height 
                    ? 'custom' 
                    : cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].aspectRatio
                }
              >
                {aspectRatioOptions.map(option => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].aspectRatio === 
              (cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].customRatio.width / 
               cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].customRatio.height) && (
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="1"
                  className="border rounded px-2 py-1 w-20"
                  value={cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].customRatio.width}
                  onChange={(e) => handleCustomRatioChange('width', e.target.value)}
                  placeholder="Width"
                />
                <span>:</span>
                <input
                  type="number"
                  min="1"
                  className="border rounded px-2 py-1 w-20"
                  value={cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].customRatio.height}
                  onChange={(e) => handleCustomRatioChange('height', e.target.value)}
                  placeholder="Height"
                />
              </div>
            )}
          </div>

          {cropperData.imageUrl && (
            <ImageCropper
              imageUrl={cropperData.imageUrl}
              onCropComplete={handleCropComplete}
              onCancel={handleCropCancel}
              aspectRatio={cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].aspectRatio}
              circularCrop={false}
              minWidth={cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].minWidth}
              minHeight={cropperSettings[cropperData.imageType === 'card_image' ? 'card_image' : 'product_image'].minHeight}
            />
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AddProduct;
