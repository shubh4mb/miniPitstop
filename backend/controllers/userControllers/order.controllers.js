import Order from "../../models/order_model.js";
import Product from "../../models/product_model.js";
import Cart from "../../models/cart_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod } = req.body;
        const userId = req.user.userId;

        // Check stock availability for all items
        for (const item of items) {
            const product = await Product.findById(item.product);
            if (!product || product.stock < item.quantity) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Insufficient stock for product ${product ? product.name : 'Unknown'}`
                });
            }
        }

        // Create new order
        const order = new Order({
            user: userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: 'pending',
            orderDate: new Date()
        });

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Save order
        await order.save();

        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { item: [] } }
        );

        return res.status(HttpStatus.CREATED).json({
            success: true,
            message: "Order placed successfully",
            order
        });
    } catch (error) {
        console.error("Error placing order:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
};

export const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId })
            .populate('items.product')
            .sort({ orderDate: -1 });

        return res.status(HttpStatus.OK).json({
            success: true,
            orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
};

export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be cancelled
        if (!['pending', 'confirmed'].includes(order.orderStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Order cannot be cancelled at this stage'
            });
        }

        order.orderStatus = 'cancelled';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling order'
        });
    }
};

export const returnOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user._id;

        const order = await Order.findOne({ _id: orderId, user: userId });
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Check if order can be returned
        if (order.orderStatus !== 'delivered') {
            return res.status(400).json({
                success: false,
                message: 'Only delivered orders can be returned'
            });
        }

        order.orderStatus = 'return_requested';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Return request submitted successfully',
            order
        });
    } catch (error) {
        console.error('Error returning order:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting return request'
        });
    }
};
