import  { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getSingleOrder, updateOrderStatus } from '../../api/admin.api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const AdminSingleOrder = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'];

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await getSingleOrder(orderId);
      setOrder(response.order);
    } catch (error) {
      //('Error fetching order:', error);
      toast.error(error.message || 'Failed to fetch order details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdating(true);
      await updateOrderStatus(orderId, newStatus);
      toast.success('Order status updated successfully');
      fetchOrder(); // Refresh order details
    } catch (error) {
      //('Error updating order status:', error);
      toast.error(error.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800">Order not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="admin-glass-effect rounded-lg shadow-lg p-6">
        {/* Order Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.slice(-6)}</h1>
            <div className="flex items-center space-x-4">
              <select
                className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={order.orderStatus}
                onChange={(e) => handleStatusUpdate(e.target.value)}
                disabled={updating}
              >
                {statusOptions.map((orderStatus) => (
                  <option key={orderStatus} value={orderStatus} className="capitalize">
                    {orderStatus}
                  </option>
                ))}
              </select>
              <span className="px-4 py-2 rounded-full text-sm font-semibold capitalize"
                style={{
                  backgroundColor: order.status === 'pending' ? '#FEF3C7' :
                    order.status === 'processing' ? '#DBEAFE' :
                      order.status === 'shipped' ? '#D1FAE5' :
                        order.status === 'delivered' ? '#BBF7D0' :
                          order.status === 'cancelled' ? '#FEE2E2' : '#F3F4F6',
                  color: order.status === 'pending' ? '#92400E' :
                    order.status === 'processing' ? '#1E40AF' :
                      order.status === 'shipped' ? '#065F46' :
                        order.status === 'delivered' ? '#166534' :
                          order.status === 'cancelled' ? '#991B1B' : '#374151'
                }}
              >
                {order.orderStatus}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <p className="text-gray-600">
              Ordered on {format(new Date(order.createdAt), 'PPP')}
            </p>
            <p className="text-gray-600">
              Last updated: {format(new Date(order.updatedAt), 'PPP')}
            </p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.email}</p>
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item._id} className="flex items-center p-4 border rounded-lg"
                style={{
                  backgroundColor: item.product.card_color || '#ffffff'
                }}>
                <div className="flex-shrink-0 w-24 h-24">
                  <img
                    src={item.product.card_image.url}
                    alt={item.product.name}
                    className="w-full h-full object-contain rounded-md"
                  />
                </div>
                <div className="ml-6 flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{item.product.name}</h3>
                  <p className="text-gray-600">{item.product.description}</p>
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className="text-sm font-medium text-gray-900">₹{item.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {/* <p className="font-medium">{order.shippingAddress.fullName}</p> */}
              <p className="text-gray-600">{order.shippingAddress.phone}</p>
              <p className="text-gray-600">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium capitalize">{order.paymentMethod}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Order Timeline</h2>
            <div className="space-y-4">
              {order.statusHistory.map((history, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-4 w-4 rounded-full bg-blue-500 mt-2"></div>
                  </div>
                  <div className="ml-4">
                    <p className="font-medium capitalize">{history.status}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(history.timestamp), 'PPP p')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSingleOrder;
