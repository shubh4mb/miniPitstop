import Order from '../../models/order_model.js';
import Wallet from '../../models/wallet_model.js';
import Transaction from '../../models/transaction_model.js';

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

   

 

        // Update the order
        order.orderStatus = status;
        await order.save();

        if(status === 'returned') {
           
            
            
            const transaction = new Transaction({
                userId: order.user,
                amount: order.totalAmount,
                type: 'refund',
                status: 'success'
            });
            
            await transaction.save();
            const wallet = await Wallet.findOne({ user: order.user });
            if (wallet) {

                await Wallet.findOneAndUpdate(
                    { user: order.user },
                    {
                        $inc: { amount: order.totalAmount }, 
                        $push: { transactionHistory: transaction._id } 
                    }
                );
            }
            else{
                const wallet=new Wallet({
                    user: order.user,
                    amount: order.totalAmount,
                    transactionHistory: [transaction._id]
                });
                await wallet.save();
            }
        }

        if(status === 'delivered'&& order.paymentMethod === 'cod') {
          
            order.paymentStatus = 'paid';
            await order.save();
        }
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

export const getOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findById(orderId)
            .populate('user', 'name email')
            .populate('items.product', 'name price card_image');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching order details'

        });
    }
};