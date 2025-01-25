import Razorpay from 'razorpay';
import { HttpStatus } from '../../constants/http.constants.js';
import crypto from 'crypto';
import Order from '../../models/order_model.js';
import Product from '../../models/product_model.js';
import Coupon from '../../models/coupon_model.js';
import Cart from '../../models/cart_model.js';
import dotenv from 'dotenv';
import User from '../../models/user_model.js';
import Wallet from '../../models/wallet_model.js';
import Transaction from '../../models/transaction_model.js';

dotenv.config();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET;

if (!RAZORPAY_KEY_ID || !RAZORPAY_SECRET) {
    console.error('Razorpay credentials are missing:', {
        RAZORPAY_KEY_ID: !!RAZORPAY_KEY_ID,
        RAZORPAY_SECRET: !!RAZORPAY_SECRET
    });
    throw new Error('Razorpay credentials are not configured');
}

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_SECRET
});

export const createRazorpayOrder = async (req, res) => {
    try {
        const { items, totalAmount, shippingAddress, appliedCoupon } = req.body;
        const userId = req.user.userId;

        let subTotalBeforeOffer = 0;
        let subTotalAfterOffer = 0;

        for (const item of items) {
            const product = await Product.findById(item.product).populate('brand', 'offer').populate('series', 'offer');
            
            if (!product || product.stock < item.quantity) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: `Insufficient stock for product ${product?.name || item.product}`
                });
            }

            subTotalBeforeOffer += item.quantity * item.price;
            const maxOffer = Math.max(product.offer || 0, product.brand?.offer || 0, product.series?.offer || 0);
            subTotalAfterOffer += item.quantity * item.price - (item.quantity * item.price * maxOffer) / 100;
        }

        let finalAmount = subTotalAfterOffer;
        let couponDiscount = 0;
        let couponDetails = null;

        if (appliedCoupon) {
            const coupon = await Coupon.findById(appliedCoupon);
            if (!coupon) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Invalid coupon'
                });
            }

            const validationResult = await coupon.isValidForUser(userId, subTotalAfterOffer);
            if (!validationResult.valid) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: validationResult.message
                });
            }

            couponDiscount = coupon.calculateDiscount(subTotalAfterOffer);
            finalAmount = subTotalAfterOffer - couponDiscount;
            couponDetails = {
                code: coupon.code,
                discountAmount: couponDiscount
            };
        }

        const options = {
            amount: Math.round(finalAmount * 100), 
            currency: 'INR',
            receipt: 'order_' + Date.now(),
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(HttpStatus.OK).json({
            success: true,
            order: razorpayOrder,
            orderDetails: {
                items,
                totalAmount: finalAmount,
                shippingAddress,
                appliedCoupon: couponDetails,
                subTotalBeforeOffer,
                subTotalAfterOffer,
                couponDiscount
            }
        });
    } catch (error) {
        console.error('Razorpay order creation error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error creating Razorpay order',
            error: error.message
        });
    }
};

export const verifyRazorpayPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderDetails 
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Missing required Razorpay fields'
            });
        }

        if (!orderDetails || !orderDetails.items || !orderDetails.totalAmount || !orderDetails.shippingAddress) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Missing required order details'
            });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;
        if (!isAuthentic) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        const {
            items,
            totalAmount,
            shippingAddress,
            appliedCoupon,
            subTotalBeforeOffer,
            subTotalAfterOffer,
            couponDiscount
        } = orderDetails;

        const user = await User.findById(req.user.userId);
        // console.log(appliedCoupon);
        if(appliedCoupon){
        const existingCoupon = user.appliedCoupon.find(coupon => coupon.coupon.toString() === appliedCoupon.toString());
        const currentCoupon = await Coupon.findById(appliedCoupon);

        if (existingCoupon) {
            if(currentCoupon.userLimit<existingCoupon.count){
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Coupon usage limit reached'
                });
            }
            existingCoupon.count += 1;
        } else {
            user.appliedCoupon.push({ coupon: appliedCoupon, count: 1 });
        }
        await user.save();
        }

       
       

        const order = new Order({
            user: req.user.userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: 'razorpay',
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
            orderDate: new Date(),
            couponApplied: appliedCoupon  || null,
            subTotalBeforeOffer,
            subTotalAfterOffer,
            couponDiscount
        });

        await order.save();

        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

        await Cart.findOneAndUpdate(
            { user: req.user.userId },
            { $set: { item: [] } }
        );

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Payment verified and order placed successfully',
            order
        });
    } catch (error) {
        console.error('Razorpay verification error:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

export const createWallet = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: Math.round(amount * 100), 
            currency: 'INR',
            receipt: 'wallet_' + Date.now(),
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Wallet created successfully',
            order: razorpayOrder
        });
    } catch (error) {
        console.error('Error creating wallet:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error creating wallet',
            error: error.message
        });
    }
};

export const verifyWallet = async (req, res) => {
    try{
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            amount
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Missing required Razorpay fields'
            });
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;
        if (!isAuthentic) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Payment verification failed'
            });
        }

        const transaction = {
            userId: req.user.userId,
            amount: amount,
            type: 'credit',
            status: 'success',
            timestamp: new Date()
        };
        const transactionResult = await Transaction.create(transaction);
        if (!transactionResult) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Error creating transaction'
            });
        }

        const existingWallet = await Wallet.findOne({ user: req.user.userId });
        if (existingWallet) {
            existingWallet.amount += amount;
            existingWallet.transactionHistory.push(transactionResult._id);

            await existingWallet.save();
        } else {
            const wallet = new Wallet({
                user: req.user.userId,
                amount: amount,
                transactionHistory: [transactionResult._id]
                
            });
            
            await wallet.save();
        }

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Payment verified and wallet created successfully',
        
        });
    }catch(error){
        console.error('Error verifying wallet payment:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error verifying wallet payment',
            error: error.message
        });
    }
}

export const createRetryRazorpayPayment = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId;
        const order = await Order.findById(orderId).populate('items.product');
        
        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Order not found'
            });
        }

        if (order.user.toString() !== userId) {
            return res.status(HttpStatus.FORBIDDEN).json({
                success: false,
                message: 'You are not authorized to access this order'
            });
        }

        if (order.paymentStatus === 'paid') {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Order already paid'
            });
        }

        const options = {
            amount: Math.round(order.totalAmount * 100), 
            currency: 'INR',
            receipt: `retry_${order.orderNumber}_${Date.now()}`,
        };

        const razorpayOrder = await razorpay.orders.create(options);
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();
        return res.status(HttpStatus.OK).json({
            success: true,
            order: razorpayOrder
        });
    } catch (error) {
        console.error('Error creating retry Razorpay order:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Error creating payment order'
        });
    }
};

export const verifyRetryRazorpayPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', RAZORPAY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }

        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = 'paid';
        order.paymentDetails = {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            method: 'razorpay'
        };

        await order.save();

        const updatedStock = Promise.all(
            order.items.map(async (item) => {
                const product = await Product.findById(item.product);
                if (product) {
                    await Product.findByIdAndUpdate(
                        item.product,
                        { $inc: { stock: -item.quantity } }
                    );
                }
            })
        )

        await updatedStock;

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Payment verified successfully',
            order
        });
    } catch (error) {
        console.error('Error verifying retry payment:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Error verifying payment'
        });
    }
};
