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

    useEffect(() => {
        if (id) {
            setIsEditing(true);
            getCoupon();
        }
    }, [id]);

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

    const generateCouponCode = () => {
        const prefix = 'MINI'; // Your prefix
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = prefix + '-';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
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
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">{isEditing ? 'Edit Coupon' : 'Add New Coupon'}</h1>

            <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
                {/* Coupon Code with Generator */}
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Coupon Code
                        </label>
                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter or generate coupon code"
                            required
                        />
                    </div>
                    <button
                        type="button"
                        onClick={generateCouponCode}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                        Generate Code
                    </button>
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
                        placeholder="Enter coupon description"
                        rows="4"
                        required
                    />
                </div>

                {/* Discount Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Discount Type
                        </label>
                        <select
                            name="discountType"
                            value={formData.discountType}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select discount type</option>
                            <option value="percentage">Percentage</option>
                            <option value="amount">Fixed Amount</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Discount Value
                        </label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={formData.discountType === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                            min="0"
                            max={formData.discountType === 'percentage' ? "100" : undefined}
                            required
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Start Date
                        </label>
                        <input
                            type="datetime-local"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Expiry Date
                        </label>
                        <input
                            type="datetime-local"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Total Usage Limit
                        </label>
                        <input
                            type="number"
                            name="usageLimit"
                            value={formData.usageLimit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Maximum total uses"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Per User Limit
                        </label>
                        <input
                            type="number"
                            name="userLimit"
                            value={formData.userLimit}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Uses per user"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* Minimum Requirements */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Minimum Purchase Amount
                        </label>
                        <input
                            type="number"
                            name="minAmount"
                            value={formData.minAmount}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Minimum cart value"
                            min="0"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-gray-700 mb-2">
                            Maximum Discount Amount
                        </label>
                        <input
                            type="number"
                            name="maxRedemableAmount"
                            value={formData.maxRedemableAmount}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Maximum discount value"
                            min="0"
                            required
                        />
                    </div>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="text-lg font-medium text-gray-700">
                        Active Coupon
                    </label>
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
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                    >
                        {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Coupon' : 'Add Coupon')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default AddCoupons;