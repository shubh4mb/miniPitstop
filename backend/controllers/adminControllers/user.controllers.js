import User from "../../models/user_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";

export const fetchUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.OK,
            users,
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

export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        // Find existing user    
        const user = await User.findById(userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        // Update user status
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { isActive: Boolean(isActive) },
            { new: true }
        );        
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            user: updatedUser
        });

    } catch (error) {
        console.error("Error in updateUserStatus:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });        
    }
};