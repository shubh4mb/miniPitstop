import User from "../../models/user_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js"
import Address from "../../models/address_model.js";
import bcrypt from 'bcrypt';

export const fetchUserDetails = async (req, res) => {
    try {
        
        
        const user = await User.findById(req.user.userId).select('-password');
       
        
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            user
        });
    } catch (error) {
        console.error("Error in fetchUserDetails:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const updateUserDetails = async (req, res) => {
    try {
        const { fullName, username , phone } = req.body;

        const user = await User.findById(req.user.userId);
        if (!user) {    
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        user.fullName = fullName;
        user.username = username;
        user.phone = phone;
        await user.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            user
        });
    } catch (error) {
        console.error("Error in updateUserDetails:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'User not found'
            });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user's password
        user.password = hashedPassword;
        await user.save();

        res.status(HttpStatus.OK).json({
            success: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error("Error in resetPassword:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
