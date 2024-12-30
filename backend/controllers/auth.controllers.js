import User from "../models/user_model.js";
import Admin from "../models/admin_model.js";
import OTP from "../models/otp_model.js";
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import {sendOTPEmail} from '../services/emailOtp.service.js'
import { HttpMessage , HttpStatus } from "../constants/http.constants.js";
import jwt from 'jsonwebtoken';
import { validateSignupData } from "../utils/validation.utils.js";

// Make sure dotenv is configured to load environment variables
dotenv.config();





export const signup = async (req, res) => {
  const { fullName, username, email, phone, password } = req.body;

  const validation = validateSignupData({ fullName, username, email, phone, password });
  
  if (!validation.isValid) {
    return res.status(validation.status).json({ message: validation.message });
  }

  const trimmedData = validation.trimmedData;


  try {

    const existingUser = await User.findOne({ email: trimmedData.email });
    if (existingUser) {
      // Check if user is registered with Google
      if (existingUser.authProvider === 'google') {
        return res.status(HttpStatus.CONFLICT).json({ 
          message: 'This email is already registered with Google. Please use Google Sign In instead.',
          authProvider: 'google'
        });
      }
      return res.status(HttpStatus.CONFLICT).json({ message: 'Email already registered' });
    }
    

 

    const usernameExists = await User.findOne({ username: trimmedData.username });
    if (usernameExists) {
      return res.status(HttpStatus.CONFLICT).json({ message: 'Username already taken' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const existingOTP = await OTP.findOne({ email: trimmedData.email });
    if (existingOTP) {
      existingOTP.otp = otp;
      existingOTP.attempts = 0;
      existingOTP.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      existingOTP.userData = {
        fullName: trimmedData.fullName,
        username: trimmedData.username,
        phone: trimmedData.phone,
        password: trimmedData.password
      };
      existingOTP.isVerified = false;
      await existingOTP.save();
    } else {
      await OTP.create({
        email: trimmedData.email,
        otp,
        userData: {
          fullName: trimmedData.fullName,
          username: trimmedData.username,
          phone: trimmedData.phone,
          password: trimmedData.password
        }
      });
    }

    await sendOTPEmail(trimmedData.email, otp);

    res.status(HttpStatus.CREATED).json({ 
      message: HttpMessage.CREATED,
      email: trimmedData.email
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
  }
};

export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'No OTP found for this email' });
    }

    // Check if OTP is expired or nullified
    if (!otpRecord.otp || otpRecord.isOtpExpired()) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (otpRecord.isMaxAttemptsReached()) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Maximum OTP verification attempts reached' });
    }

    if (otpRecord.otp !== otp) {
      await otpRecord.incrementAttempts();
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Invalid OTP' });
    }

    // Create new user from stored data
    const newUser = await User.create({
      fullName: otpRecord.userData.fullName,
      username: otpRecord.userData.username,
      email: otpRecord.email,
      phone: otpRecord.userData.phone,
      password: otpRecord.userData.password,
      isActive: true
    });

    // Delete the OTP record after successful verification
    await OTP.deleteOne({ _id: otpRecord._id });

    res.status(HttpStatus.OK).json({
      message: HttpMessage.OK,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        isVerified: newUser.isVerified
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
  }
};

export const resendOTP = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Email is required' });
  }

  try {
    const otpRecord = await OTP.findOne({ email });
    
    if (!otpRecord) {
      return res.status(HttpStatus.NOT_FOUND).json({
        message: 'No OTP record found. Please sign up again.'
      });
    }
    // Check if current OTP exists and hasn't expired
    if (otpRecord.otp && !otpRecord.isOtpExpired()) {
      const remainingTime = Math.ceil((otpRecord.otpExpiresAt - new Date()) / 1000);
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: 'Current OTP is still valid',
        remainingTime
      });
    }

    // Generate and set new OTP
    const newOtp = crypto.randomInt(100000, 999999).toString();
    
    // Update OTP and its expiry
    otpRecord.otp = newOtp;
    otpRecord.otpExpiresAt = new Date(Date.now() + 120 * 1000); // 120 seconds
    otpRecord.attempts = 0;
    await otpRecord.save();

    // Send new OTP email
    await sendOTPEmail(email, newOtp);

    res.status(HttpStatus.OK).json({
      message: 'New OTP has been sent to your email',
      expiresIn: 120 // seconds
    });

  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  

  try {
    const user = await User.findOne({ email });
    
    
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ 
        success: false,
        message: "User not found "
      });
    }

    
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ 
        success: false,
        message: "Wrong Credentials "
      });
    }
    
    if(user.isActive === false){
      return res.status(HttpStatus.FORBIDDEN).json({ 
        success: false,
        message: "Your account is blocked  "
      });
    } 

    // if(user.isRefreshTokenExpired()){
    //   const refreshToken = jwt.sign({userId:user._id, role: "user", email:user.email, fullName:user.fullName}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    // const hashedToken = await bcrypt.hash(refreshToken, 10);
    // user.refreshToken = hashedToken;
    // await user.save();
    // }

   
    const accessToken = jwt.sign({userId:user._id, role: "user", email:user.email, fullName:user.fullName}, process.env.JWT_SECRET, { expiresIn: '5m' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 60 * 1000 // 30 minutes in milliseconds
    })
    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpMessage.OK,
      data: {
        fullName: user.fullName,
        email: user.email,
        
      }
    });
    ;


  } catch (error) {
    console.error('Login error:', error);
    res.
    status(HttpStatus.INTERNAL_SERVER_ERROR).
    json({ 
      success: false,
      message: HttpMessage.INTERNAL_SERVER_ERROR
    })
  }
};

export const googleSignup = async (req, res, next) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: HttpMessage.BAD_REQUEST });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(HttpStatus.CONFLICT).json({
        success: false,
        message: `Email already exists${user.authProvider === 'google' ? ' and is registered through Google' : ''}`,
      });
    }

    const username = email.split('@')[0] + '_' + Math.random().toString(36).substring(2, 7);
    try {
      user = new User({
        fullName: name,
        email,
        username,
        authProvider: 'google',
        isVerified: true
      });

      await user.save();
    } catch (error) {
      if (error.code === 11000) { // Duplicate key error
        return next(new ApiError(HttpStatus.BAD_REQUEST, HttpMessage.BAD_REQUEST));
      }
      throw error; // Let the global error handler catch other errors
    }

    const accessToken = jwt.sign({userId:user._id, role: "user", email:user.email, fullName:user.fullName}, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
    })
    res.status(HttpStatus.CREATED).json({
      success: true,
      message: HttpMessage.CREATED,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      success: false, 
      message: HttpMessage.INTERNAL_SERVER_ERROR 
    });
  }
};

export const googleLogin = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, authProvider: 'google' });
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'Please sign up with Google first'
      });
    }

    // Generate access token
    const accessToken = jwt.sign({userId:user._id, role: "user", email:user.email, fullName:user.fullName}, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes in milliseconds
    })
    res.status(HttpStatus.OK).json({
      success: true,
      message: HttpMessage.OK,
      data: {
        user: {
          fullName: user.fullName,
          email: user.email,
          isVerified: user.isActive
        }
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: HttpMessage.INTERNAL_SERVER_ERROR
    });
  }
};

export const verify = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        isAuthenticated: false
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    const admin = await Admin.findById(decoded.adminId);
    

    if (!user && !admin) {
      
      return res.status(HttpStatus.UNAUTHORIZED).json({
        isAuthenticated: false
      });
    }
    if(user){
    res.json({
      isAuthenticated: true,
      role: decoded.role,
      isActive: user.isActive
    });
  }
  if(admin){    
    res.json({
      isAuthenticated: true,
      role: "admin",
      isActive: true
    });
  }
    
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      isAuthenticated: false
    });
  }
};

export const me = async (req, res) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        success: false,
        message: 'No token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      success: true,
      role: decoded.role,
      email: decoded.email,
      fullName: decoded.fullName
    });
  } catch (error) {
    res.status(HttpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    sameSite: 'strict',
    path: '/'
  });
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

export const adminLogin = async (req, res) => {
  
  
  const {email,password} =req.body;
  try{
    const admin=await Admin.findOne({email});
    if(!admin){
      return res.status(HttpStatus.UNAUTHORIZED).json({ 
        success: false,
        message: HttpMessage.UNAUTHORIZED
      });
    }
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ 
        success: false,
        message: HttpMessage.UNAUTHORIZED
      });
    }
    const accessToken = jwt.sign({adminId:admin._id, role: "admin", email:admin.email, fullName:admin.fullName}, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 // 15 minutes in milliseconds
    
  }
  )
  res.status(HttpStatus.OK).json({
    success: true,
    message: HttpMessage.OK,
    data: {
      fullName: admin.fullName,
      email: admin.email,
      
    }
  });
  }
  catch(error){
    console.error('Login error:', error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ 
      success: false,
      message: HttpMessage.INTERNAL_SERVER_ERROR
    })
  }
}