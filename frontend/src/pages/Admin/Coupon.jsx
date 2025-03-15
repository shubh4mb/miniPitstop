import {useState,useEffect} from 'react'
import { fetchCoupons, updateCouponStatus } from '../../api/admin.api.js';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/table/DataTable';

const Coupon = () => {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]); 

    useEffect(() => {
        fetchAllCoupons();
    }, []);

    const fetchAllCoupons = async () => {
        try {
            const response = await fetchCoupons();
            if (response.success && Array.isArray(response.coupons)) {
                setCoupons(response.coupons);
            } else {
                setCoupons([]);
            }
        } catch (error) {
            //(error);
            setCoupons([]);
            toast.error('Failed to fetch coupons');
        }
    };

    const handleToggleActive = async (couponId, currentStatus) => {
        try {
            await updateCouponStatus(couponId, !currentStatus);
            fetchAllCoupons();
            toast.success('Coupon status updated successfully');
        } catch (error) {
            //('Error toggling coupon status:', error);
            toast.error(error.message || 'Failed to update coupon status');
        }
    };

    const handleEdit = (coupon) => {
        navigate(`/admin/coupon/${coupon._id}`);
    };

    const columns = [
        { field: 'code', header: 'Code' },
        { 
            field: 'discount', 
            header: 'Discount',
            render: (rowData) => (
                <span>
                    {rowData.discountType === 'percentage' 
                        ? `${rowData.discount}%` 
                        : `₹${rowData.discount}`}
                </span>
            )
        },
        { field: 'discountType', header: 'Type' },
        { field: 'maxRedemableAmount', header: 'Max Discount' },
        { field: 'minAmount', header: 'Min Purchase' },
        {
            field: 'expiryDate',
            header: 'Expires',
            render: (rowData) => (
                <span>
                    {new Date(rowData.expiryDate).toLocaleDateString()}
                </span>
            )
        },
        {
            field: 'isActive',
            header: 'Status',
            render: (rowData) => (
                <div className="flex items-center justify-center">
                    <button
                        onClick={() => handleToggleActive(rowData._id, rowData.isActive)}
                        className={`
                            relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                            ${rowData.isActive ? 'bg-blue-600' : 'bg-gray-200'}
                        `}
                        role="switch"
                        aria-checked={rowData.isActive}
                    >
                        <span
                            className={`
                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                                transition duration-200 ease-in-out
                                ${rowData.isActive ? 'translate-x-5' : 'translate-x-0'}
                            `}
                        />
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Coupons</h1>
                <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                    onClick={() => navigate('/admin/addcoupon')}
                >
                    Add Coupon
                </button>
            </div>

            <DataTable 
                columns={columns} 
                data={coupons}
                onEdit={handleEdit}
                actions={['edit']}
            />
        </div>
    );
};

export default Coupon;