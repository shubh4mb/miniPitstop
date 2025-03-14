import Product from "../../models/product_model.js";
import Cart from "../../models/cart_model.js";
import { HttpStatus, HttpMessage } from "../../constants/http.constants.js";
import User from "../../models/user_model.js";

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            }); 
        }
        if(product.stock < 1){
            console.log("workinggsgsdgsdg");
            
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Product is out of stock"
            });
        }

        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            const newCart = new Cart({
                user: user._id,
                item: [{ product: productId, quantity: 1 , price: product.price }]
            });
            await newCart.save();
            return res.status(HttpStatus.OK).json({
                success: true,
                message: HttpMessage.UPDATED,
                cart: newCart
            });
        } else {
            const existingItem = cart.item.find(item => item.product.toString() === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.item.push({ product: productId, quantity: 1,price: product.price });
            }
            await cart.save();
            return res.status(HttpStatus.OK).json({
                success: true,  
                message: HttpMessage.UPDATED,
                cart
            });
        }
    } catch (error) {
        console.error("Error in addToCart:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "production" ? error.message : undefined,
        });
    }    
}

export const getCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
                
            });
        }

        const cart = await Cart.findOne({ user: user._id })
            .populate({
                path: 'item.product',
                populate: [
                    {
                        path: 'brand',
                        model: 'Brand',
                        select: 'name offer'
                    },
                    {
                        path: 'series',
                        model: 'Series',
                        select: 'name offer'
                    }
                ]
            });
        if (!cart) {
            const userCart = new Cart({ 
                user: user._id
            });
            await userCart.save();
            return res.status(HttpStatus.OK).json({
                success: false,
                message: "Cart is empty"
            });
        }

        res.status(HttpStatus.OK).json({ 
            success: true, 
            message: HttpMessage.OK,
            cart
        });
    } catch (error) {
        console.error("Error in getCart:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Cart not found"
            });
        }

        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) { 
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }   

        const itemIndex = cart.item.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Item not found in cart"
            });
        }

        cart.item.splice(itemIndex, 1);
        await cart.save();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            cart
        });

    } catch (error) {
  
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const updateCartItemQuantity = async (req, res) => {
    
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }
        
        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
           
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Cart not found"
            });
        }

        const { itemId } = req.params;
        const { quantity } = req.body;
        
        const itemIndex = cart.item.findIndex(item => item.product.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Item not found in cart"
            });
        }
        const checkStock = await Product.findById(itemId);
        if(checkStock.stock < quantity){
            return res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: "Not enought Stock available"
            });
        }
        cart.item[itemIndex].quantity = quantity;
        await cart.save();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            cart
        });

    } catch (error) {
        console.error("Error in updateCartItemQuantity:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success:false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: HttpMessage.NOT_FOUND
            });
        }

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            return res.status(HttpStatus.NOT_FOUND).json({
                success: false,
                message: "Cart not found"
            });
        }

        cart.item = [];
        await cart.save();
        res.status(HttpStatus.OK).json({
            success: true,
            message: HttpMessage.UPDATED,
            cart
        });

    } catch (error) {
        console.error("Error in clearCart:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}

export const getCartProducts = async (req, res) => {
    try {
        const userExist = req.user?.userId;
        if(userExist){
            console.log("why am i working")
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: HttpMessage.NOT_FOUND
                });
            } 
            const cart = await Cart.findOne({ user: user._id });
            if (!cart) {
                return res.status(HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: "Cart not found"
                });
            }
            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpMessage.OK,
                cart
            });
        }
        else{
            res.status(HttpStatus.OK).json({
                success: true,
                message: HttpMessage.OK,
                cart: null
            });
        }
    

       

        // const products = await Product.find({ _id: { $in: cart.item } });
     
    } catch (error) {
        console.error("Error in getCartProducts:", error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: HttpMessage.INTERNAL_SERVER_ERROR,
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
}