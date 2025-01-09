import Razorpay from 'razorpay';
import { HttpStatus } from '../../constants/http.constants.js';
import crypto from 'crypto';
import Order from '../../models/order_model.js';
import Product from '../../models/product_model.js';
import Coupon from '../../models/coupon_model.js';
import Cart from '../../models/cart_model.js';
import dotenv from 'dotenv';

dotenv.config();

// Check if environment variables are properly loaded
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

        // Calculate totals
        let subTotalBeforeOffer = 0;
        let subTotalAfterOffer = 0;

        // Check stock and calculate totals
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

        // Validate and apply coupon if provided
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

            // Validate coupon for the user and cart amount
            const validationResult = await coupon.isValidForUser(userId, subTotalAfterOffer);
            if (!validationResult.valid) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: validationResult.message
                });
            }

            // Calculate coupon discount
            couponDiscount = coupon.calculateDiscount(subTotalAfterOffer);
            finalAmount = subTotalAfterOffer - couponDiscount;
            couponDetails = {
                code: coupon.code,
                discountAmount: couponDiscount
            };

            // Track coupon usage (only track if payment is successful)
            // This will be done in the verify payment endpoint
        }

        await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { item: [] } }
        );

        const options = {
            amount: Math.round(finalAmount * 100), // Razorpay expects amount in paise
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

        // Validate required fields
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

        // Verify the payment signature
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

        // Create order after successful payment
        const {
            items,
            totalAmount,
            shippingAddress,
            appliedCoupon,
            subTotalBeforeOffer,
            subTotalAfterOffer,
            couponDiscount
        } = orderDetails;

        // Track coupon usage if a coupon was applied
        if (appliedCoupon) {
            const coupon = await Coupon.findOne({ appliedCoupon });
            if (coupon) {
                await coupon.trackUsage(req.user.userId);
            }
        }

        const order = new Order({
            user: req.user.userId,
            items,
            totalAmount,
            shippingAddress,
            paymentMethod: 'razorpay',
            paymentStatus: 'completed',
            orderStatus: 'confirmed',
            orderDate: new Date(),
            couponApplied: appliedCoupon  || null,
            subTotalBeforeOffer,
            subTotalAfterOffer,
            couponDiscount
        });

        await order.save();

        // Update product stock
        for (const item of items) {
            await Product.findByIdAndUpdate(
                item.product,
                { $inc: { stock: -item.quantity } }
            );
        }

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
