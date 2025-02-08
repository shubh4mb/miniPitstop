import { useState , useEffect } from 'react'
import { addCoupon , fetchCoupon, updateCoupon } from '../../api/admin.api.js';
import { toast } from 'react-toastify';
import { useNavigate ,useParams} from 'react-router-dom';

const AddCoupons = () => {
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();
    const {id} = useParams();
    
    const [formData, setFormData] = useState({
        code: '',
        discount: 0,
        expiryDate: '',
        minAmount: 0,
        discountType: '',
        minQuantity: 0,
        maxRedemableAmount: 0,
        isActive: true,
        description: '',
        maxQuantity: 0,
        usageLimit: 0,
        userLimit: 0,
        startDate: ''
    });

    const [errors, setErrors] = useState({
        code: '',
        discount: '',
        expiryDate: '',
        minAmount: '',
        discountType: '',
        minQuantity: '',
        maxRedemableAmount: '',
        description: '',
        maxQuantity: '',
        usageLimit: '',
        userLimit: '',
        startDate: ''
    });

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            getCoupon();
        }
    }, [id]);

    const validateForm = () => {
        const newErrors = {};
        
        // Validate code
        if (!formData.code.trim()) {
            newErrors.code = 'Coupon code is required';
        } else if (!/^[A-Z0-9-]{4,15}$/.test(formData.code.trim())) {
            newErrors.code = 'Coupon code must be 4-15 characters long and contain only uppercase letters, numbers, and hyphens';
        }

        // Validate discount
        if (!formData.discount) {
            newErrors.discount = 'Discount is required';
        } else if (formData.discountType === 'percentage') {
            if (formData.discount <= 0 || formData.discount > 100) {
                newErrors.discount = 'Percentage discount must be between 1 and 100';
            }
        } else if (formData.discountType === 'amount') {
            if (formData.discount <= 0) {
                newErrors.discount = 'Fixed discount must be greater than 0';
            }
        }

        // Validate discountType
        if (!formData.discountType) {
            newErrors.discountType = 'Discount type is required';
        }

        // Validate minAmount
        if (formData.minAmount < 0) {
            newErrors.minAmount = 'Minimum amount cannot be negative';
        }

        // Validate minQuantity
        if (formData.minQuantity < 0) {
            newErrors.minQuantity = 'Minimum quantity cannot be negative';
        }

        // Validate maxRedemableAmount
        if (formData.maxRedemableAmount < 0) {
            newErrors.maxRedemableAmount = 'Maximum redeemable amount cannot be negative';
        }

        // Validate description
        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }

        // Validate maxQuantity
        if (formData.maxQuantity < 0) {
            newErrors.maxQuantity = 'Maximum quantity cannot be negative';
        }

        // Validate usageLimit
        if (formData.usageLimit < 0) {
            newErrors.usageLimit = 'Usage limit cannot be negative';
        }

        // Validate userLimit
        if (formData.userLimit < 0) {
            newErrors.userLimit = 'User limit cannot be negative';
        }

        // Validate dates
        if (!formData.startDate) {
            newErrors.startDate = 'Start date is required';
        }

        if (!formData.expiryDate) {
            newErrors.expiryDate = 'Expiry date is required';
        }

        const start = new Date(formData.startDate);
        const expiry = new Date(formData.expiryDate);
        const now = new Date();

        if (start < now) {
            newErrors.startDate = 'Start date cannot be in the past';
        }

        if (expiry <= start) {
            newErrors.expiryDate = 'Expiry date must be after start date';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
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
            toast.error('Please fix the validation errors before submitting');
            return;
        }
        setLoading(true);
        try {
            // Validate dates
            const start = new Date(formData.startDate);
            const expiry = new Date(formData.expiryDate);
            
            if (start >= expiry) {
                toast.error('Expiry date must be after start date');
                return;
            }

            if (isEditing) {
                await updateCoupon(id, formData);
                toast.success('Coupon updated successfully!');
            } else {
                await addCoupon(formData);
                toast.success('Coupon added successfully!');
            }
            
            navigate(-1);
        } catch (error) {
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'add'} coupon`);
        } finally {
            setLoading(false);
        }
    };

    const generateCouponCode = () => {
        const prefix = 'MINI'; // Your prefix
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = prefix + '-';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const getCoupon = async () => {
        try {
            setLoading(true);
            const response = await fetchCoupon(id);
            if (response.coupon) {
                const coupon = response.coupon;
                setFormData({
                    ...coupon,
                    startDate: new Date(coupon.startDate).toISOString().slice(0, 16),
                    expiryDate: new Date(coupon.expiryDate).toISOString().slice(0, 16)
                });
            }
        } catch (error) {
            toast.error(error.message || 'Failed to fetch coupon');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Edit Coupon' : 'Add New Coupon'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Coupon Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Coupon Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                name="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                className={`mt-1 block w-full rounded-md shadow-sm ${
                                    errors.code ? 'border-red-500' : 'border-gray-300'
                                } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                                required
                            />
                            <button
                                type="button"
                                onClick={generateCouponCode}
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                Generate
                            </button>
                        </div>
                        {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code}</p>}
                    </div>

                    {/* Discount Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Discount Type</label>
                        <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.discountType ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="percentage">Percentage</option>
                            <option value="amount">Fixed Amount</option>
                        </select>
                        {errors.discountType && <p className="mt-1 text-xs text-red-500">{errors.discountType}</p>}
                    </div>

                    {/* Discount Value */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Discount {formData.discountType === 'percentage' ? '(%)' : '(₹)'}
                        </label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.discount ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            min="0"
                            max={formData.discountType === 'percentage' ? "100" : undefined}
                            required
                        />
                        {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount}</p>}
                    </div>

                    {/* Minimum Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Minimum Amount (₹)</label>
                        <input
                            type="number"
                            name="minAmount"
                            value={formData.minAmount}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.minAmount ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            min="0"
                        />
                        {errors.minAmount && <p className="mt-1 text-xs text-red-500">{errors.minAmount}</p>}
                    </div>

                    {/* Maximum Redeemable Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Max Redeemable Amount (₹)</label>
                        <input
                            type="number"
                            name="maxRedemableAmount"
                            value={formData.maxRedemableAmount}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.maxRedemableAmount ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            min="0"
                        />
                        {errors.maxRedemableAmount && <p className="mt-1 text-xs text-red-500">{errors.maxRedemableAmount}</p>}
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.startDate ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            required
                        />
                        {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>}
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                        <input
                            type="datetime-local"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.expiryDate ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            required
                        />
                        {errors.expiryDate && <p className="mt-1 text-xs text-red-500">{errors.expiryDate}</p>}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows="3"
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            required
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
                    </div>

                    {/* Usage Limits */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
                        <input
                            type="number"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.usageLimit ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            min="0"
                        />
                        {errors.usageLimit && <p className="mt-1 text-xs text-red-500">{errors.usageLimit}</p>}
                    </div>

                    {/* Per User Limit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Per User Limit</label>
                        <input
                            type="number"
                            name="userLimit"
                            value={formData.userLimit}
                            onChange={handleInputChange}
                            className={`mt-1 block w-full rounded-md shadow-sm ${
                                errors.userLimit ? 'border-red-500' : 'border-gray-300'
                            } focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm`}
                            min="0"
                        />
                        {errors.userLimit && <p className="mt-1 text-xs text-red-500">{errors.userLimit}</p>}
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={formData.isActive}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">Active</label>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {loading ? 'Saving...' : (isEditing ? 'Update Coupon' : 'Create Coupon')}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddCoupons;