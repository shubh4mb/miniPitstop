import Order from '../../models/order_model.js';

export const fetchAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .populate('items.product', 'name price').sort({ orderDate: -1 });

        res.status(200).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching orders'
        });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'return_requested', 'returned'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Additional validation for status transitions
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Validate status transitions
        const validTransitions = {
            'pending': ['confirmed', 'cancelled'],
            'confirmed': ['shipped', 'cancelled'],
            'shipped': ['delivered', 'cancelled'],
            'delivered': ['return_requested'],
            'return_requested': ['returned', 'delivered'], // Can either accept or reject return
            'returned': [],
            'cancelled': []
        };

        if (!validTransitions[order.orderStatus].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status transition'
            });
        }

        // Update the order
        order.orderStatus = status;
        await order.save();

        const updatedOrder = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('items.product', 'name price');

        res.status(200).json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating order status'
        });
    }
};