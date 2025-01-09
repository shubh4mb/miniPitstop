import  { useState } from 'react';
import { format } from 'date-fns';
import { cancelOrder, returnOrder } from '../api/user.api';
import ConfirmationModal from './ConfirmationModal';
import {useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderCard = ({ order, onOrderUpdate, isAdmin = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);

    const getStatusClass = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            case 'return_requested':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCancel = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await cancelOrder(order._id);
            if (response.success) {
                onOrderUpdate && onOrderUpdate();
            }
        } catch (err) {
            setError(err.message || 'Failed to cancel order');
        } finally {
            setLoading(false);
            setShowCancelModal(false);
        }
    };

    const handleReturn = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await returnOrder(order._id);
            if (response.success) {
                onOrderUpdate && onOrderUpdate();
            }
        } catch (err) {
            setError(err.message || 'Failed to return order');
        } finally {
            setLoading(false);
            setShowReturnModal(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            setLoading(true);
            setError(null);
            await onOrderUpdate(order._id, newStatus);
        } catch (err) {
            setError(err.message || 'Failed to update order status');
            toast.error(err.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    const showCancelButton = !isAdmin && ['pending', 'confirmed'].includes(order.orderStatus.toLowerCase());
    const showReturnButton = !isAdmin && order.orderStatus.toLowerCase() === 'delivered';

    const renderAdminControls = () => {
        if (!isAdmin) return null;

        const nextStatus = {
            'pending': 'confirmed',
            'confirmed': 'shipped',
            'shipped': 'delivered'
        };

        const currentStatus = order.orderStatus.toLowerCase();
        const nextStatusValue = nextStatus[currentStatus];

        return nextStatusValue ? (
            <button

                onClick={(e) => { e.stopPropagation(); handleStatusUpdate(nextStatusValue) }}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                Mark as {nextStatusValue.charAt(0).toUpperCase() + nextStatusValue.slice(1)}
            </button>
        ) : null;
    };

    const getOrderDetailPath = () => {
        if (isAdmin) {
            return `/admin/order/${order._id}`;
        }
        return `/profile/order/${order._id}`;
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-4" 
                onClick={() => navigate(getOrderDetailPath())}
                style={{ cursor: 'pointer' }}
            >
                <div className="flex justify-between items-center mb-4" >
                    <h3 className="text-lg font-semibold text-gray-800">
                        Order #{order._id.slice(-6)}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                    </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                    Placed on: {format(new Date(order.orderDate), 'PPP')}
                </p>
                {isAdmin && order.user && (
                    <p className="text-gray-600 text-sm mb-4">
                        Customer: {order.user.name} ({order.user.email})
                    </p>
                )}
                <div className="mb-4">
                    <h4 className="text-gray-800 font-medium mb-2">Items:</h4>
                    <div className="space-y-2">
                        {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-gray-800 flex-1">{item.product.name}</span>
                                <span className="text-gray-600 mx-4">Qty: {item.quantity}</span>
                                <span className="text-gray-800 font-medium">₹{item.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                        {showCancelButton && (
                            <button
                                onClick={(e) => {e.stopPropagation(); setShowCancelModal(true)}}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
                            >
                                Cancel Order
                            </button>
                        )}
                        {showReturnButton && (
                            <button
                                onClick={(e) => {e.stopPropagation(); setShowReturnModal(true)}}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
                            >
                                Return Order
                            </button>
                        )}
                        {renderAdminControls()}
                    </div>
                    <div className="text-right">
                        <p className="text-gray-600">Total:</p>
                        <p className="text-xl font-bold text-gray-800">₹{order.totalAmount}</p>
                    </div>
                </div>
                {error && (
                    <p className="mt-4 text-red-500 text-sm">{error}</p>
                )}
            </div>

            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={handleCancel}
                title="Cancel Order"
                message="Are you sure you want to cancel this order?"
                confirmText="Yes, Cancel Order"
                cancelText="No, Keep Order"
            />

            <ConfirmationModal
                isOpen={showReturnModal}
                onClose={() => setShowReturnModal(false)}
                onConfirm={handleReturn}
                title="Return Order"
                message="Are you sure you want to return this order?"
                confirmText="Yes, Return Order"
                cancelText="No, Keep Order"
            />
        </>
    );
};

export default OrderCard;
