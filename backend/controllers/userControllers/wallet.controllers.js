import Wallet from "../../models/wallet_model.js";
import User from "../../models/user_model.js";
import { HttpStatus } from "../../constants/http.constants.js";

export const getWallet = async (req, res) => {
    try {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        const userData = {
            fullName: user.fullName,
            phone: user.phone,
            email: user.email
        }
        const wallet = await Wallet.findOne({ user: userId })
  .populate({
    path: 'transactionHistory',
    options: { sort: { timestamp: -1 } }, // Sort by 'timestamp' in descending order
    
    
  });
//   console.log(wallet);
        if (!wallet) {
            const wallet = await Wallet.create({
                user: userId,
                amount: 0,
                transactionHistory: []

            })

            return res.status(HttpStatus.OK).json({
                success: false,
                message: '',
                wallet,
                userData
            });
        }

        return res.status(HttpStatus.OK).json({
            success: true,
            message: 'Wallet found',
            wallet, userData
        });
    } catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error fetching wallet',
            error: error.message
        });
    }
};