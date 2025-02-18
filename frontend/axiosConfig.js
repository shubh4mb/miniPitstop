import axios from 'axios';
import store from './src/redux_store/store.js';
import { clearUserData } from './src/redux_store/slices/user/userSlice.js';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL ,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor for handling file uploads
instance.interceptors.request.use(
    (config) => {
        if (config.headers['Content-Type']?.includes('multipart/form-data')) {
            config.timeout = 60000;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // console.log('Error in axios interceptor:', error.response?.data);
        
        if (error.response?.status === 401 && error?.response?.data?.message.includes('token')) {
            error.response.data.message = 'Please Login to your account';
            // console.log('Clearing user data and redirecting...');
            
            // Clear Redux store state
            store.dispatch(clearUserData());
            
            // Clear cookies or local storage if needed
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
            
            // Redirect to home page
            // window.location.href = '/home';
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
        
        return Promise.reject(enhancedError);
    }
);

export default instance;