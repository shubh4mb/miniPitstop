import React, { useEffect, useState } from 'react';
import { getUserOrders } from '../../api/user.api';
import OrderCard from '../../components/OrderCard';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await getUserOrders();
            if (response.success) {
                setOrders(response.orders);
            } else {
                setError('Failed to fetch orders');
            }
        } catch (err) {
            setError('Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    );
    
    if (error) return (
        <div className="text-center text-red-600 p-10">
            {error}
        </div>
    );
    
    if (orders.length === 0) return (
        <div className="text-center text-gray-600 p-10">
            No orders found
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
                Order History
            </h2>
            <div className="space-y-6">
                {orders.map((order) => (
                    <OrderCard 
                        key={order._id} 
                        order={order} 
                        onOrderUpdate={fetchOrders}
                    />
                ))}
            </div>
        </div>
    );
};

export default OrderHistory;