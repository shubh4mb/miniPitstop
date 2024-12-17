import express from 'express'
import {  fetchUserDetails, updateUserDetails } from '../controllers/userControllers/user.controllers.js'
import { getAddresses, updateAddress , addAddress , deleteAddress } from '../controllers/userControllers/address.controllers.js'
import { verifyToken } from '../middleware/auth.middleware.js'
// import signup from '../controllers/user.controllers.js'
const router = express.Router();
router.use(verifyToken);
router.get('/userDetails', fetchUserDetails);
router.patch('/userDetails', updateUserDetails);
router.post('/addAddress', addAddress);
router.get('/addresses', getAddresses);
router.patch('/address/:addressId', updateAddress);
router.delete('/addresses/:addressId', deleteAddress);



export default router