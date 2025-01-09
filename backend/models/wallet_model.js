import mongoose from "mongoose";

const walletSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    transactionHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            required: true
        }
    ]
})

const Wallet = mongoose.model('Wallet', walletSchema);
export default Wallet