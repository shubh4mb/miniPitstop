import mongoose from 'mongoose';

const userSchema= new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username:{
        type: String,
        unique: true,
        sparse: true
    },
    password:{
        type: String,
        required: function() {
            return this.authProvider === 'local';
        }
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        required: false,
    },
    authProvider: {
        type: String,
        required: true,
        enum: ['local', 'google'],
        default: 'local'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
appliedCoupon:[{
    coupon: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true
    },
    count: {
        type: Number,
        default: 1
    }
}],

 
},{timestamps: true})

  

const User = mongoose.model('User', userSchema);
export default User;