import express from 'express';
import { signup, verifyOTP, resendOTP, login, googleLogin, googleSignup , verify , logout , me , adminLogin } from '../controllers/auth.controllers.js';
import { verifyToken } from '../middleware/auth.middleware.js';
const router = express.Router();


// Auth routes
router.post('/signup', signup);
router.post('/verifyOtp', verifyOTP);
router.post('/resendOtp', resendOTP);
router.post('/login', login);
router.post('/googleLogin', googleLogin);
router.post('/googleSignup', googleSignup);
router.get('/verify', verify);
router.post('/logout', logout);
router.get('/me', me);
router.post('/adminLogin', adminLogin);


export default router;