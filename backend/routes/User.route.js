import express from 'express'
import {  fetchUserDetails, updateUserDetails } from '../controllers/userControllers/user.controllers.js'
import { getAddresses, updateAddress , addAddress , deleteAddress } from '../controllers/userControllers/address.controllers.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { placeOrder } from '../controllers/userControllers/order.controllers.js'
import { filterProducts , searchedProducts } from '../controllers/sharedControllers/products.controllers.js';
import { addToCart , removeFromCart , getCart , updateCartItemQuantity } from '../controllers/userControllers/cart.controllers.js';
import { getUserOrders, cancelOrder, returnOrder } from '../controllers/userControllers/order.controllers.js';
// import signup from '../controllers/user.controllers.js'
import { getSingleOrder } from '../controllers/userControllers/order.controllers.js';
import { fetchWishlist , addToWishlist } from '../controllers/userControllers/wishlist.controllers.js';
import { fetchAllCoupons } from '../controllers/userControllers/coupon.controllers.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../controllers/userControllers/razorpay.controllers.js';
const router = express.Router();
// Routes that require authentication
router.get('/userDetails', verifyToken, fetchUserDetails);
router.patch('/userDetails', verifyToken, updateUserDetails);
router.post('/addAddress', verifyToken, addAddress);
router.get('/addresses', verifyToken, getAddresses);
router.patch('/address/:addressId', verifyToken, updateAddress);
router.delete('/addresses/:addressId', verifyToken, deleteAddress);
router.post('/addToCart', verifyToken, addToCart);
router.delete('/removeFromCart/:productId', verifyToken, removeFromCart);
router.get('/cart', verifyToken, getCart);
router.patch('/updateCartItemQuantity/:itemId', verifyToken, updateCartItemQuantity);

router.post('/placeOrder', verifyToken, placeOrder);
router.get('/orders', verifyToken, getUserOrders);
router.post('/orders/:orderId/cancel', verifyToken, cancelOrder);
router.post('/orders/:orderId/return', verifyToken, returnOrder);
router.get('/order/:orderId', verifyToken, getSingleOrder);
router.get('/wishlist',verifyToken,fetchWishlist);
router.post('/wishlist',verifyToken,addToWishlist);
router.get('/allCoupons',verifyToken,fetchAllCoupons);
router.post('/razorpay/create-order', verifyToken, createRazorpayOrder);
router.post('/razorpay/verify', verifyToken, verifyRazorpayPayment);


// Public routes
router.post('/products/filter', filterProducts);
router.get('/products/search',searchedProducts);



export default router