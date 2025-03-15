import { useState , useEffect } from 'react';
import { format } from 'date-fns';
import { cancelOrder, returnOrder, downloadInvoice, createRetryRazorpayPayment, verifyRetryRazorpayPayment , retryPayment} from '../api/user.api';
import ConfirmationModal from './ConfirmationModal';
import {useNavigate} from 'react-router-dom';
import { toast } from 'react-toastify';

const OrderCard = ({ order, onOrderUpdate, isAdmin = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
         
        };
        script.onerror = () => {
            //('Failed to load Razorpay script');
        };
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

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

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
    };

    const handlePaymentRetry = async (orderId) => {
        setShowPaymentMethodModal(true);
    };

    const handlePaymentSubmit = async () => {
        try {
            setLoading(true);
            setError(null);

            if (selectedPaymentMethod === 'razorpay') {
                await handleRazorpayPayment();
            } else if (selectedPaymentMethod === 'wallet') {
                await handleWalletPayment();
            } else if (selectedPaymentMethod === 'cod') {
                await handleCODPayment();
            }
        } catch (err) {
            setError(err.message || 'Failed to process payment');
            toast.error(err.message || 'Failed to process payment');
        } finally {
            setLoading(false);
            setShowPaymentMethodModal(false);
        }
    };

    const handleRazorpayPayment = async () => {
        try {
            const { success, order: razorpayOrder } = await createRetryRazorpayPayment(order._id);

            if (!success) {
                throw new Error('Error creating payment order');
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                name: 'MiniPitstop',
                description: 'Payment for your order',
                order_id: razorpayOrder.id,
                handler: async function (response) {
                    try {
                        const verifyData = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            orderId: order._id
                        };

                        const verificationResult = await verifyRetryRazorpayPayment(verifyData);
                        
                        if (verificationResult.success) {
                            toast.success('Payment successful!');
                            onOrderUpdate && onOrderUpdate();
                        } else {
                            toast.error(verificationResult.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        //('Payment verification error:', error);
                        toast.error(error?.message || 'Error verifying payment');
                    }
                },
                modal: {
                    ondismiss: function () {
                       
                        toast.info('Payment was not completed. Please try again.');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            //('Razorpay payment error:', error);
            throw new Error('Error initiating payment');
        }
    };

    const handleWalletPayment = async () => {
        const response = await retryPayment(order._id, 'wallet');
        if (response.success) {
            toast.success('Payment successful using wallet!');
            onOrderUpdate && onOrderUpdate();
        } else {
            throw new Error(response.message || 'Wallet payment failed');
        }
    };

    const handleCODPayment = async () => {
        const response = await retryPayment(order._id, 'cod');
        if (response.success) {
            toast.success('Order updated to Cash on Delivery!');
            onOrderUpdate && onOrderUpdate();
        } else {
            throw new Error(response.message || 'Failed to update to COD');
        }
    };

    const showCancelButton = !isAdmin && ['pending', 'confirmed' ,'shipped'].includes(order.orderStatus.toLowerCase())&& !['failed', ].includes(order.paymentStatus.toLowerCase());
    
    const showReturnButton = !isAdmin && order.orderStatus.toLowerCase() === 'delivered';

    const showInvoiceButton = order.orderStatus.toLowerCase() !== 'pending' && order.paymentStatus.toLowerCase() === 'paid' && ['wallet', 'razorpay'].includes(order.paymentMethod.toLowerCase())

    const showPaymentRetryButton = !isAdmin && order.paymentStatus.toLowerCase() === 'failed';

    const renderAdminControls = () => {
        if (!isAdmin) return null;

        const nextStatus = {
            'pending': 'confirmed',
            'confirmed': 'shipped',
            'shipped': 'delivered',
            'return_requested': 'returned'
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

    const handleDownloadInvoice = async (orderId) => {
        try {
            setLoading(true);
            setError(null);
            await downloadInvoice(orderId);
            toast.success('Invoice downloaded successfully');
        } catch (err) {
            setError(err.message || 'Failed to download invoice');
            toast.error(err.message || 'Failed to download invoice');
        } finally {
            setLoading(false);
        }
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
                       Order Status: {order.orderStatus}
                    </span>
                    <span>
                       Payment: {order.paymentStatus}
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
                        {showInvoiceButton && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadInvoice(order._id);
                                }}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Downloading...' : 'Download Invoice'}
                            </button>
                        )}
                        {showPaymentRetryButton && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePaymentRetry(order._id); }}
                                disabled={loading}
                                className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50"
                            >
                                Retry Payment
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

            {/* Payment Method Modal */}
            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center ${showPaymentMethodModal ? '' : 'hidden'}`}>
                <div className="bg-white p-6 rounded-lg max-w-md w-full">
                    <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
                    <div className="space-y-4">
                        {[
                            { id: 'cod', name: 'Cash on Delivery' },
                            { id: 'razorpay', name: 'Pay with Razorpay' },
                            { id: 'wallet', name: 'Wallet' }
                        ].map((method) => (
                            <div
                                key={method.id}
                                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                    selectedPaymentMethod === method.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-blue-300'
                                }`}
                                onClick={() => handlePaymentMethodSelect(method.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <span className="font-medium">{method.name}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button
                            onClick={() => setShowPaymentMethodModal(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePaymentSubmit}
                            disabled={!selectedPaymentMethod || loading}
                            className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Proceed'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderCard;
