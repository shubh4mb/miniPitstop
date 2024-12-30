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
      // setOrders(orders.map((orders) =>{
      //   const updatedOrder = [ ...orders ];
      //   return updatedOrder.map((order) => {
      //     if (order._id === orderId) {
      //       order.orderStatus = newStatus;
      //     }
      //     return order;
      //   });
      // } 
      
      // ));

      if (response.success) {
        console.log("wrorjdsf");
        
        // Update the order in the local state
        setOrders(orders.map(order => 
          order._id === orderId 
            ? { ...order, orderStatus: newStatus }
            : order
        ));
        toast.success('Order status updated successfully');

      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Error updating order status');
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchOrders}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      <div className="grid gap-6">
        {orders.map(order => (
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
    </div>
  );
};

export default Order;