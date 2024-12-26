import express from 'express'
import {  fetchUserDetails, updateUserDetails } from '../controllers/userControllers/user.controllers.js'
import { getAddresses, updateAddress , addAddress , deleteAddress } from '../controllers/userControllers/address.controllers.js'
import { verifyToken } from '../middleware/auth.middleware.js'
import { placeOrder } from '../controllers/userControllers/order.controllers.js'
import { filterProducts } from '../controllers/sharedControllers/products.controllers.js';
import { addToCart , removeFromCart , getCart , updateCartItemQuantity } from '../controllers/userControllers/cart.controllers.js';
import { getUserOrders, cancelOrder, returnOrder } from '../controllers/userControllers/order.controllers.js';
// import signup from '../controllers/user.controllers.js'
const router = express.Router();
router.use(verifyToken);
router.get('/userDetails', fetchUserDetails);
router.patch('/userDetails', updateUserDetails);
router.post('/addAddress', addAddress);
router.get('/addresses', getAddresses);
router.patch('/address/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);
router.post('/products/filter', filterProducts);
router.post('/addToCart', addToCart);
router.delete('/removeFromCart/:productId', removeFromCart);
router.get('/cart', getCart)
router.patch('/updateCartItemQuantity/:itemId', updateCartItemQuantity)
router.post('/placeOrder', placeOrder)
router.get('/orders', getUserOrders)
router.post('/orders/:orderId/cancel', cancelOrder);
router.post('/orders/:orderId/return', returnOrder);

export default router