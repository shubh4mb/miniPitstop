import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { googleLogin, login, forgotPassword } from '../../api/auth.api.js';
import { useDispatch, useSelector } from 'react-redux';
import { setUser , setUserWithExpiration } from '../../redux_store/slices/user/userSlice.js';
import { showOtpComponent } from '../../redux_store/slices/auth/otpSlice.js';
import Otp from '../../components/Otp.jsx';

const Login = () => {
  const expirationTime =  60*60 * 1000; // 120 seconds
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const showOtp = useSelector((state) => state.otp.showOtp);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const validateForm = () => {
    const errors = {};
    const trimmedData = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    if (!trimmedData.email) {
      errors.email = 'Email is required';
    }

    if (!trimmedData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await googleLogin();
      // Only proceed if we have a valid result (this will be undefined if popup was closed)
      if (result?.success && result?.data) {
        dispatch(setUser(result.data));
        dispatch(setUserWithExpiration(result.data, expirationTime));
        toast.success(result.message || 'Login successful!');
        navigate('/home');
      }
     
    } catch (error) {
      console.error('Login error:', error);
      if (error.message === 'Please sign up with Google first') {
        toast.error(error.message);
        navigate('/signup');
      } else if (error.message === 'Sign-in popup was closed') {
        // Don't show an error toast for intentional user action
        toast.info('Google sign-in was cancelled');
      } else {
        toast.error(error.message || 'An error occurred during login');
      }
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await login(formData);
      if (response.success) {
        dispatch(setUser(response.data));
        dispatch(setUserWithExpiration(response.data,expirationTime));
        toast.success('Login successful!');
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.message) {
        toast.error(error.message);
      } else if (error.message === 'Network Error') {
        toast.error('Unable to connect to server. Please try again later.');
      } else {
        toast.error('An error occurred during login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    
    if (!formData.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setResetLoading(true);
    try {
      const response = await forgotPassword(formData.email);
      if (response.success) {
        dispatch(showOtpComponent({ 
          email: formData.email,
          type: 'forgotPassword',
          otpExpiry: Date.now() + 120 * 1000 // 120 seconds
        }));
        toast.success(response.message || 'OTP sent to your email');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setResetLoading(false);
    }
  };

  if (showOtp) {
    return <Otp />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-600">
      <div className="w-full min-h-[500px] max-w-4xl h-auto md:h-[75%] bg-white rounded-lg shadow-md flex flex-col md:flex-row gap-5 p-5 md:p-0">
        <div className="w-full md:w-[48%] p-5 md:p-7">
          <h2 className="text-2xl font-bold text-center mb-6">Login to your account</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4 relative">
              <input
                className={`peer w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 placeholder-transparent ${
                  validationErrors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                type="email"
                id="email"
                name="email"
                placeholder="Enter your Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <label
                className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all duration-200 
                         peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                         peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 
                         peer-focus:text-sm peer-focus:text-blue-600"
                htmlFor="email"
              >
                Email
              </label>
              {validationErrors.email && (
                <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.email}</p>
              )}
            </div>

            <div className="mb-4 relative">
              <input
                className={`peer w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 placeholder-transparent ${
                  validationErrors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <label
                className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all duration-200 
                         peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                         peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 
                         peer-focus:text-sm peer-focus:text-blue-600"
                htmlFor="password"
              >
                Password
              </label>
              {validationErrors.password && (
                <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.password}</p>
              )}
            </div>

            <div className="mb-4 text-sm">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-red-600 hover:text-red-800 font-medium"
                disabled={resetLoading}
              >
                {resetLoading ? 'Sending OTP...' : 'Forgot your password?'}
              </button>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full py-2 mt-4 bg-red-500 text-white font-bold rounded hover:bg-red-600 focus:outline-none focus:bg-red-700 transition-colors duration-200"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative flex py-5 items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-600">Or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            type="button"
            className="w-full py-2 bg-white border border-gray-300 text-black font-bold rounded hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          >
            Continue with Google
          </button>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <span onClick={() => navigate('/signup')} className="text-red-600 hover:text-red-800 cursor-pointer">Sign up</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
