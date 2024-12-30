import Coupon from "../../models/coupon_model.js";

import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const addCoupon = async (req, res) => {
    const { code, discount, expiryDate, minAmount, discountType, minQuantity, maxRedemableAmount, isActive, description, maxQuantity, usageLimit, userLimit, startDate } = req.body;
    console.log(req.body);
    console.log("working");
    
    
    try{
        const existingCoupon = await Coupon.findOne({ code });
        if (existingCoupon) {
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Coupon code already exists",
            });
        }
        const newCoupon = new Coupon({
            code,
            discount,
            expiryDate,
            minAmount,
            discountType,
            minQuantity,
            maxRedemableAmount,
            isActive,
            description,
            maxQuantity,
            usageLimit,
            userLimit,
            startDate
        });
        newCoupon.save()

        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            newCoupon
        });
    }catch(error){
        console.error("Error in addCoupon:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }

};

export const fetchAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            coupons
        });
    } catch (error) {
        console.error("Error in fetchAllUsers:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};


export const fetchCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await Coupon.findById(id);
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            coupon
        });
    } catch (error) {
        console.error("Error in fetchAllUsers:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const { code, discount, expiryDate, minAmount, discountType, minQuantity, maxRedemableAmount, isActive, description, maxQuantity, usageLimit, userLimit, startDate } = req.body;
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            {   
                code,
                discount,
                expiryDate,
                minAmount,
                discountType,
                minQuantity,
                maxRedemableAmount,
                isActive,
                description,
                maxQuantity,
                usageLimit,
                userLimit,
                startDate
            },
            { new: true }
        );
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            updatedCoupon
        });
    } catch (error) {
        console.error("Error in updateCoupon:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};


