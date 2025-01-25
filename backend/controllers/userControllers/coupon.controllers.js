import User from "../../models/user_model.js";
import Coupon from "../../models/coupon_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const fetchAllCoupons = async (req, res) => {
    try {
        // console.log("working");

       
        const coupons = await Coupon.find({
            isActive: true,
            expiryDate: { $gt: new Date() }, 
          });
          
       
          const user = await User.findById(req.user.userId).select('appliedCoupon');
          if (!user || user.appliedCoupon.length === 0) {
          
            return res.status(HttpStatus.OK).json({
              success: true,
              message: HttpMessage.OK,
              coupons, 
            });
          }
          
          
          const availableCoupons = coupons.filter(coupon => {
           
            const userCoupon = user.appliedCoupon.find(appliedCoupon =>
              appliedCoupon.coupon.toString() === coupon._id.toString()
            );
          
            
            if (!userCoupon) return true;
          

            return userCoupon.count < coupon.userLimit;
          });

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
        // Check if the coupon is already applied
        const existingCoupon = user.appliedCoupons.find(coupon => coupon.couponId === couponId);

        if (existingCoupon) {
            if(existingCoupon.userLimit>user.appliedCoupon.count){
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: 'Coupon usage limit reached'
                });
            }
          
        }

        // Add coupon to user's applied coupons with count
        user.appliedCoupons.push({ couponId, count: 1 });
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