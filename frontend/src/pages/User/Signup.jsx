import { useState} from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Otp from '../../components/Otp.jsx';
import { useDispatch, useSelector } from 'react-redux';
import { showOtpComponent } from '../../redux_store/slices/auth/otpSlice';
import { useNavigate } from 'react-router-dom';
import { signup , googleSignup} from '../../api/auth.api';
import { setUser , setUserWithExpiration } from '../../redux_store/slices/user/userSlice.js';




const Signup = () => {
  const dispatch = useDispatch();
  const showOtp = useSelector((state) => state.otp.showOtp);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [validationErrors, setValidationErrors] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Form validation function
  const validateForm = () => {
    const errors = {};
    const trimmedData = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim()
    };


    if (!trimmedData.fullName) {
      errors.fullName = 'Full name is required';
    } else if (!/^[a-zA-Z]+(?:\s[a-zA-Z]+)*$/.test(trimmedData.fullName)) {
      errors.fullName = 'Full name must contain only letters with single spaces between words';
    }

    // Validate username (no spaces allowed)
    if (!trimmedData.username) {
      errors.username = 'Username is required';
    } else if (trimmedData.username.length < 4 || trimmedData.username.length > 20) {
      errors.username = 'Username must be 4-20 characters long';
    } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedData.username)) {
      errors.username = 'Username can only contain letters, numbers, and underscores';
    }

    // Validate email
    if (!trimmedData.email) {
      errors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(trimmedData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!trimmedData.password) {
      errors.password = 'Password is required';
    } else if (trimmedData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(trimmedData.password)) {
      errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    // Validate phone (10 digits, starts with 6-9)
    if (!trimmedData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(trimmedData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number starting with 6-9';
    }

    // Validate confirm password
    if (!trimmedData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (trimmedData.password !== trimmedData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const result = await googleSignup();
  
      if (result?.success && result?.data) {
        dispatch(setUser(result.data));
        toast.success(result.data.message || 'Google sign-in successful!');
        navigate('/home');
      }
    } catch (error) {
      //('Login error:', error);
  
   
      const errorMessage = 
        error?.message === 'Network Error' 
          ? 'Unable to connect to server. Please try again later.' 
          : error?.message || 'An error occurred during login';
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
   

  // Form field change handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!validateForm()) {
    toast.error(Object.values(validationErrors)[0]);
      setLoading(false);
      return;
    }

    try {
      const res = await signup(formData);

      if (res.status === 201) {
        // Show success message and dispatch OTP component
        toast.success(res.data.message || 'Please verify your email.');
        dispatch(showOtpComponent({
          email: formData.email,
          type: 'signup',
          otpExpiry: Date.now() + 120 * 1000 // 120 seconds
        }));
      }
      
    } catch (error) {
     
      
      // Check if it's a Google auth user
      if (error.response?.data?.authProvider === 'google') {
        toast.info(error.response.data.message);
        // Clear only email field since it's registered with Google
        setFormData(prev => ({
          ...prev,
          email: ''
        }));
      } else if (error.statusCode=== 409) {
        // Handle other conflicts (duplicate email/username)
        toast.error(error.message);
        setFormData(prev => ({
          ...prev,
          email: '',
          username: ''
        }));
      } else {
        // Handle other errors
        toast.error(error.message || 'An error occurred during signup');
      }
    } finally {
      setLoading(false);
    }
  };

  if (showOtp) {
    return <Otp />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-600">
      <div className="w-[90%] min-h-[500px] max-w-4xl h-auto md:h-[75%] bg-white rounded-lg shadow-md flex flex-col md:flex-row gap-5 p-5 md:p-0">
      
          <div className="w-full p-5 md:p-7">
            <h2 className="text-2xl font-bold text-center mb-6 text-red-700">miniPitstop</h2>
            <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
            
            {/* Error Message Display */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errorMessage}
              </div>
            )}

            {/* Form for manual sign-up */}
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <input
                  className={`peer w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 placeholder-transparent ${
                    validationErrors.fullName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  
                />
                <label
                  className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all duration-200 
                           peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                           peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 
                           peer-focus:text-sm peer-focus:text-blue-600"
                  htmlFor="fullName"
                >
                  Full Name
                </label>
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.fullName}</p>
                )}
              </div>

              <div className="mb-4 relative">
                <input
                  className={`peer w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 placeholder-transparent ${
                    validationErrors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  type="text"
                  id="username"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  
                />
                <label
                  className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all duration-200 
                           peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                           peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 
                           peer-focus:text-sm peer-focus:text-blue-600"
                  htmlFor="username"
                >
                  Username
                </label>
                {validationErrors.username && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.username}</p>
                )}
              </div>

              <div className="mb-4 relative">
                <input
                  className={`peer w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 placeholder-transparent ${
                    validationErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  
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
                    validationErrors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  type="text"
                  id="phone"
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  
                />
                <label
                  className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all duration-200 
                           peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                           peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 
                           peer-focus:text-sm peer-focus:text-blue-600"
                  htmlFor="phone"
                >
                  Phone
                </label>
                {validationErrors.phone && (
                  <p className="text-red-500 text-xs mt-1 font-medium">{validationErrors.phone}</p>
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

              <div className="mb-4 relative">
                <input
                  className={`peer w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500 placeholder-transparent ${
                    validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  
                />
                <label
                  className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all duration-200 
                           peer-placeholder-shown:text-base peer-placeholder-shown:top-2 
                           peer-placeholder-shown:text-gray-500 peer-focus:-top-2.5 
                           peer-focus:text-sm peer-focus:text-blue-600"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                {validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 font-medium">
                    {validationErrors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-2 mt-4 bg-red-500 text-white font-bold rounded hover:bg-red-600 focus:outline-none focus:bg-red-700 transition-colors duration-200"
              >
                {loading ? 'Loading...' : 'Sign up'}
              </button>
              
            </form>

            {/* Google Sign-in Button */}
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full py-2 mt-3 bg-white border border-gray-300 text-black font-bold rounded hover:bg-gray-100 focus:outline-none transition-colors duration-200"
            >
              Continue with Google
            </button>
            <p
            onClick={() => navigate('/login')}
                disabled={loading}
                type="submit"
                className="w-full text-sm text-center py-2 mt-4  text-gray-400 hover:text-red-600  rounded cursor-pointer  focus:outline-none focus:bg-red-700 transition-colors duration-200"
              >
                Already have an account? Login
              </p>
          </div>

       
            


        

        {/* Background Image Section */}
        {/* <div className="hidden md:block bg-black w-full md:w-[52%]  rounded-tr-lg rounded-br-lg"></div> */}
      </div>
    </div>
  );
};

export default Signup;
