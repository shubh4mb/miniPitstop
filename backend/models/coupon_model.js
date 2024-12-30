import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['percentage', 'amount']
    },
    discount: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    expiryDate: {
        type: Date,
        required: true
    },
    minAmount: {
        type: Number,
        required: true,
        min: 0
    },
    maxRedemableAmount: {
        type: Number,
        required: true,
        min: 0
    },
    usageLimit: {
        type: Number,
        required: true,
        min: 0
    },
    userLimit: {
        type: Number,
        required: true,
        min: 0
    },
    usedCount: {
        type: Number,
        default: 0
    },
    
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Add indexes for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

// Add methods to check coupon validity
couponSchema.methods.isValid = function(userId, cartAmount) {
    const now = new Date();
    
    // Check if coupon is active and not expired
    if (!this.isActive || now < this.startDate || now > this.expiryDate) {
        return {
            valid: false,
            message: 'Coupon is inactive or expired'
        };
    }

    // Check usage limit
    if (this.usedCount >= this.usageLimit) {
        return {
            valid: false,
            message: 'Coupon usage limit exceeded'
        };
    }

    // Check minimum amount
    if (cartAmount < this.minAmount) {
        return {
            valid: false,
            message: `Minimum purchase amount of ₹${this.minAmount} required`
        };
    }

    // Check per user limit
    const userUsage = this.usedBy.find(u => u.userId.toString() === userId.toString());
    if (userUsage && userUsage.usedCount >= this.userLimit) {
        return {
            valid: false,
            message: 'You have exceeded the usage limit for this coupon'
        };
    }

    return {
        valid: true,
        message: 'Coupon is valid'
    };
};

// Calculate discount amount
couponSchema.methods.calculateDiscount = function(cartAmount) {
    let discountAmount = 0;
    
    if (this.discountType === 'percentage') {
        discountAmount = (cartAmount * this.discount) / 100;
    } else {
        discountAmount = this.discount;
    }

    // Cap discount at maxRedemableAmount
    return Math.min(discountAmount, this.maxRedemableAmount);
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;