import User from "../../models/user_model.js";
import Coupon from "../../models/coupon_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const fetchAllCoupons = async (req, res) => {
    try {
        // console.log("working");
        
        // Get all active coupons
        const coupons = await Coupon.find({ 
            isActive: true,
            expiryDate: { $gt: new Date() } // Only get non-expired coupons
        })
        // console.log("coupons",coupons);
        

        // Get user's applied coupons
        const user = await User.findById(req.user.userId).select('appliedCoupon');
        // console.log(user);
        if(user.appliedCoupon.length === 0){
            return res.status(HttpStatus.OK).json({
                success: true,
                message: HttpMessage.OK,
                coupons
            });
        }
        
        // Filter out coupons that user has already used
        const availableCoupons = coupons.filter(coupon => 
            !user.appliedCoupons.some(appliedCoupon => 
                appliedCoupon.coupon.toString() === coupon._id.toString()
            )
        );
        // console.log(availableCoupons);
        
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            coupons: availableCoupons
        });
    } catch (error) {
        console.error('Error in fetchAllCoupons:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { couponId } = req.body;
        const userId = req.user.userId;

        // Find the coupon and check if it's valid
        const coupon = await Coupon.findOne({
            _id: couponId,
            isActive: true,
            expiryDate: { $gt: new Date() }
        });

        if (!coupon) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'Coupon not found or expired'
            });
        }

        // Check if user has already used this coupon
        const user = await User.findById(userId);
        if (user.appliedCoupons.includes(couponId)) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Coupon already used'
            });
        }

        // Add coupon to user's applied coupons
        user.appliedCoupons.push(couponId);
        await user.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Coupon applied successfully',
            discount: {
                type: coupon.discountType,
                value: coupon.discountValue
            }
        });
    } catch (error) {
        console.error('Error in applyCoupon:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR
        });
    }
};