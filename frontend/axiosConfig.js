import axios from 'axios';
import { clearAuth } from './src/utils/auth.utils.js';


const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3037',
    timeout: 30000, // Default timeout of 30 seconds
    withCredentials: true, // Important for cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor for handling file uploads
instance.interceptors.request.use(
    (config) => {
        // Increase timeout for file uploads
        if (config.headers['Content-Type']?.includes('multipart/form-data')) {
            config.timeout = 60000; // 60 seconds for file uploads
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.log(error);
        console.log(error.response);
        
        
        if (error.response?.status === 401 && error.response?.data?.message.toLowerCase().includes('token')) {
            // Clear auth data and redirect to login
            clearAuth();
            
            window.location.href = '/login';
          }
        // Handle timeout errors
        if (error.code === 'ECONNABORTED') {
            const customError = new Error(
                'Request took too long to complete. Please try again or reduce the file sizes.'
            );
            customError.isTimeout = true;
            return Promise.reject(customError);
        }

        // Enhance error message for better user feedback

        const errorMessage = error.response?.data?.message || error.message;
        const enhancedError = new Error(errorMessage);
        enhancedError.originalError = error;
        enhancedError.statusCode = error.response?.status;
        // console.log(enhancedError);
        
        
        return Promise.reject(enhancedError);
    }
);

export default instance;