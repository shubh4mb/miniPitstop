import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/admin.api';
import OrderCard from '../../components/OrderCard';
import { toast } from 'react-toastify';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      if (response.success) {
        setOrders(response.orders);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdate = async (orderId, newStatus) => {
    try {
      const response = await updateOrderStatus(orderId, newStatus);

      if (response.success) {
        // Update the order in the local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        ));
        toast.success('Order status updated successfully');
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onOrderUpdate={handleOrderUpdate}
              isAdmin={true}
            />
          ))}
          {orders.length === 0 && (
            <p className="text-center text-gray-500">No orders found</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Order;