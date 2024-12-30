import Coupon from '../models/coupon_model.js';

export const getCoupons = async () => {
    try {
        const coupons = await Coupon.find();
        
    } catch (error) {
        console.error('Error fetching coupons:', error);
        throw error;
    }
};