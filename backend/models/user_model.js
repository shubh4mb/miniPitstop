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
    // refreshToken: {
    //     type: String,
    //     default: null

    // },
    // refreshTokenExpiresAt: {
    //     type: Date,
    //     required: true,
    //     default: function() {
    //       return new Date(Date.now() + 120 * 1000); // 120 seconds from now
    //     }
    //   },
},{timestamps: true})

// userSchema.methods.isRefreshTokenExpired = function() {
//     return this.refreshTokenExpiresAt < new Date();
//   };
// userSchema.methods.nullifyRefreshTokenIfExpired = async function() {
//     if (this.isRefreshTokenExpired()) {
//       this.refreshToken = null;
//       await this.save();
//       return true;
//     }
//     return false;
//   };
  

const User = mongoose.model('User', userSchema);
export default User;