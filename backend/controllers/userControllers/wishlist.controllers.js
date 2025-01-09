import Wishlist from "../../models/wishlist_model.js";
import { HttpStatus , HttpMessage } from "../../constants/http.constants.js";

export const fetchWishlist = async (req , res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.userId }).populate('items.product');
        res.status(HttpStatus.OK).json({ message: HttpMessage.OK , wishlist });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR , error: error.message });
    }
}

export const addToWishlist = async (req , res) => {
    try {
        const { productId } = req.body;
        console.log(req.user.userId);
        
        const wishlist = await Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            const newWishlist = new Wishlist({ user: req.user.userId, items: [{ product: productId }] });
            await newWishlist.save();
            res.status(HttpStatus.CREATED).json({ message: HttpMessage.CREATED , wishlist: newWishlist });
        } else {
            if(wishlist.items.some(item => item.product.toString() === productId.toString())) {
                wishlist.items = wishlist.items.filter(item => item.product.toString() !== productId.toString());
                await wishlist.save();
                res.status(HttpStatus.OK).json({ message:"Product removed from wishlist" , wishlist });
            }
            else{
                wishlist.items.push({ product: productId });
                await wishlist.save();
                res.status(HttpStatus.OK).json({ message: "Product added to wishlist" , wishlist });
            }

            
           
        }
    } catch (error) {
        console.error('Error adding item to wishlist:', error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR , error: error.message });
    }
}