import jwt from 'jsonwebtoken';
import { HttpStatus } from '../constants/http.constants.js';

// import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Add user info to request object
   
      
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Middleware to check if user is admin
export const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

// Middleware to check if user is accessing their own data
export const verifyUser = (req, res, next) => {
  if (req.user && (req.user.role === 'user' || req.user?.user.email === req.params.email)) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Unauthorized to access this resource.'
    });
  }
};