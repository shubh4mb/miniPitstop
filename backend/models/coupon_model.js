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
        min: 1,
        default: 1
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
couponSchema.index({ expiryDate: 1 });
couponSchema.index({ isActive: 1 });

// Check if coupon is valid for a user
couponSchema.methods.isValidForUser = async function(userId, cartAmount) {
    const now = new Date();
    
    // Check if coupon is active and within valid dates
    if (!this.isActive || now < this.startDate || now > this.expiryDate) {
        return {
            valid: false,
            message: 'Coupon is inactive or expired'
        };
    }

    // Check overall usage limit
    if (this.usageLimit > 0 && this.usedCount >= this.usageLimit) {
        return {
            valid: false,
            message: 'Coupon usage limit exceeded'
        };
    }

    // Check minimum amount requirement
    if (cartAmount < this.minAmount) {
        return {
            valid: false,
            message: `Minimum purchase amount of ₹${this.minAmount} required`
        };
    }

    // Check user's usage limit
    const user = await mongoose.model('User').findById(userId);
    const userCouponUsage = user.appliedCoupon.find(c => 
        c.coupon.toString() === this._id.toString()
    );

    if (userCouponUsage && userCouponUsage.count >= this.userLimit) {
        return {
            valid: false,
            message: `You can only use this coupon ${this.userLimit} time${this.userLimit > 1 ? 's' : ''}`
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

// Track coupon usage
couponSchema.methods.trackUsage = async function(userId) {
    // Increment overall usage count
    this.usedCount += 1;

    // Update user's usage count
    const user = await mongoose.model('User').findById(userId);
    const existingUsage = user.appliedCoupon.find(c => 
        c.coupon.toString() === this._id.toString()
    );

    if (existingUsage) {
        existingUsage.count += 1;
    } else {
        user.appliedCoupon.push({
            coupon: this._id,
            count: 1
        });
    }

    await Promise.all([
        this.save(),
        user.save()
    ]);
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;