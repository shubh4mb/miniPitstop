import Order from "../../models/order_model.js";
import Product from "../../models/product_model.js";
import Cart from "../../models/cart_model.js";
import Coupon from "../../models/coupon_model.js";
import Transaction from "../../models/transaction_model.js";
import Wallet from "../../models/wallet_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const placeOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, paymentMethod, appliedCoupon } = req.body;
        const userId = req.user.userId;
        console.log();
        
        let finalAmount = 0;
        let subTotalBeforeOffer = 0;
        let subTotalAfterOffer = 0;

        // Check stock availability for all items
        for (const item of items) {
            let maxOffer = 0;
            
            const product = await Product.findById(item.product).populate('brand','offer').populate('series','offer');
            if (!product || product.stock < item.quantity) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Insufficient stock for product ${product?.name || item.product}`
                });
            }
            subTotalBeforeOffer += item.quantity * item.price;
            maxOffer = Math.max(product.offer || 0, product.brand?.offer || 0, product.series?.offer || 0);
            subTotalAfterOffer += item.quantity * item.price - (item.quantity * item.price * maxOffer) / 100;
        }
        
        let couponDiscount = 0;
        if (appliedCoupon) {
            const coupon = await Coupon.findById(appliedCoupon);
            if (coupon) {

                couponDiscount = (subTotalAfterOffer * coupon.discount) / 100;
                if(couponDiscount > coupon.maxRedemableAmount){
                    couponDiscount = coupon.maxRedemableAmount;
                }
                finalAmount = subTotalAfterOffer - couponDiscount;
            } else {
                finalAmount = subTotalAfterOffer;
            }
        } else {
            finalAmount = subTotalAfterOffer;
        }

        // Create new order
        const order = new Order({
            user: userId,
            items,
            totalAmount: finalAmount,
            shippingAddress,
            paymentMethod,
            orderStatus: 'pending',
            orderDate: new Date(),
            couponApplied: appliedCoupon || null,
            subTotalBeforeOffer,
            subTotalAfterOffer,
            couponDiscount
        });

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        // Save order
        const savedOrder = await order.save();

        // Create transaction record
        const transaction = new Transaction({
            userId: userId,
            orderId: savedOrder._id,
            amount: finalAmount,
            type: 'debit',
            description: `Payment for order #${savedOrder._id}`,
            status: paymentMethod === 'wallet' ? 'success' : 'pending'
        });

        // Save transaction
        const savedTransaction = await transaction.save();

        // If payment method is wallet, update wallet balance
        if (paymentMethod === 'wallet') {
            const wallet = await Wallet.findOne({ user: userId });
            if (!wallet || wallet.amount < finalAmount) {
                await Order.findByIdAndDelete(savedOrder._id);
                await Transaction.findByIdAndDelete(savedTransaction._id);
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: "Insufficient wallet balance"
                });
            }

            // Update wallet balance and add transaction to history
            await Wallet.findOneAndUpdate(
                { user: userId },
                { 
                    $inc: { amount: -finalAmount },
                    $push: { transactionHistory: savedTransaction._id }
                }
            );
        }

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
        const userId = req.user.userId;

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

        // Update product stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: item.quantity } }
            );
        }

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
        const userId = req.user.userId;

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

export const getSingleOrder  = async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId)
            .populate({
                path: 'items.product',
                select: 'name description  card_image card_color button_color' // Add any other product fields you want to include
            })
            // .populate('user', 'name email'); // Add user details if needed

        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Order not found'
            });
        }

        return res.status(HttpStatus.OK).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
}