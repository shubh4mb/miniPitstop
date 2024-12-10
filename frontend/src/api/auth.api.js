import axiosInstance from '../../axiosConfig.js';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../../firebase.config.js';




// Auth API functions
export const signup = async (userData) => {
  const response = await axiosInstance.post('/api/auth/signup', {
    fullName: userData.fullName,
    username: userData.username,
    email: userData.email,
    phone: userData.phone,
    password: userData.password
  });
  return response;
};

export const googleSignup = async () => {
  try {
    // Step 1: Firebase Authentication
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Extract necessary user details from Firebase response
    const userData = {
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL || '',
      uid: user.uid
    };

    // Step 2: Backend Authentication
    try {
      const response = await axiosInstance.post('/api/auth/googleSignup', userData);
      
      return {
        success: true,
        status: response.status,
        data: response.data,
        user: response.data.user || userData
      };
    } catch (backendError) {
      throw {
        type: 'BACKEND_ERROR',
        message: backendError.response?.data?.message || 'Backend authentication failed',
        originalError: backendError
      };
    }
  } catch (error) {
    if (error.type === 'BACKEND_ERROR') {
      throw error;
    }

    let errorMessage = 'Google sign-in failed';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed';
        break;
      case 'auth/cancelled-popup-request':
        errorMessage = 'Sign-in request was cancelled';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked by the browser';
        break;
      case 'auth/network-request-failed':
        errorMessage = 'Network error occurred during sign-in';
        break;
      default:
        errorMessage = error.message || 'An unexpected error occurred';
    }

    throw {
      type: 'FIREBASE_ERROR',
      code: error.code,
      message: errorMessage,
      originalError: error
    };
  }
};

export const verifyOTP = async (email, otp) => {
  const response = await axiosInstance.post('/api/auth/verifyOtp', { email, otp });
  return response;
};

export const resendOTP = async (email) => {
  const response = await axiosInstance.post('/api/auth/resendOtp', { email });
  return response;
};

export const googleLogin = async () => {
  try {
    // Step 1: Firebase Authentication
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Step 2: Backend Authentication
    const response = await axiosInstance.post('/api/auth/googleLogin', { email: user.email });
    
    if (response.data.success) {
      // Store user data and token
      localStorage.setItem('accessToken', response.data.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
      
      return {
        success: true,
        message: 'Login successful'
      };
    }
  } catch (error) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in popup was closed');
    } else if (error.code === 'auth/cancelled-popup-request') {
      // Ignore this error as it's just indicating that a new popup was opened
      return;
    } else if (error.response?.status === 401) {
      throw new Error('Please sign up with Google first');
    } else {
      console.error('Google login error:', error);
      throw new Error(error.response?.data?.message || 'Failed to login with Google');
    }
  }
};

export const login = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/auth/login', formData);
  return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
    
  }

};  

export const adminLogin = async (formData) => {
  try {
    const response = await axiosInstance.post('/api/auth/adminLogin', formData);
  return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
    
  }

};  
