import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getBrands, addSeries } from '../../api/admin.api';



const AddSeries = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [formData, setFormData] = useState({
    brandId: '',
    name: '',
    description: '',
    isActive: true,
    offer: 0
  });



  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    setFormData(prev => ({
      ...prev,
      isActive: e.target.checked
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Form validation
    const validationErrors = [];
    if (!formData.brandId) validationErrors.push('Please select a brand');
    if (!formData.name?.trim()) validationErrors.push('Series name is required');
    if (!formData.description?.trim()) validationErrors.push('Description is required');

    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error));
      return;
    }

    setLoading(true);
    try {
      // Clean form data before submission
      const cleanedFormData = {
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        offer: Number(formData.offer) || 0
      };

      const response = await addSeries(cleanedFormData);
      
      // Handle success
      toast.success('Series added successfully!');
      
      // Reset form
      setFormData({
        brandId: '',
        name: '',
        description: '',
        isActive: true,
        offer: 0
      });

      // Optionally refresh brand list or redirect
      // await fetchBrands();
      navigate('/admin/brands');

    } catch (error) {
      // Error is already handled by the API function with specific messages
      toast.error(error.message);
      console.error('Error adding series:', error);
     
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getBrands();
        setBrands(response.brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error(error.message || 'Error fetching brands');
      }
    };
    fetchBrands();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Add New Series</h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Brand Selection */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Select Brand
          </label>
          <select
            name="brandId"
            value={formData.brandId}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select a brand</option>
            {brands.map(brand => (
              <option key={brand._id} value={brand._id}>
                {brand.name}
              </option>
            ))}
          </select>
        </div>

        {/* Series Name */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Series Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter series name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-lg font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter series description"
            rows="4"
            required
          />
        </div>

        {/* Listed and Offer Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Listed Status */}
          <div className="flex items-center space-x-2">
            <label className="text-lg font-medium text-gray-700">
              Listed
            </label>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter offer percentage"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {loading ? 'Adding...' : 'Add Series'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSeries;