import { useState } from 'react';
// import axios from '../../../axiosConfig.js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { googleLogin, login } from '../../api/auth.api.js';

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    email: '',
    password: ''
  });
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Form validation function
  const validateForm = () => {
    const errors = {};
    const trimmedData = {
      email: formData.email.trim(),
      password: formData.password.trim()
    };

    // Validate email/username
    if (!trimmedData.email) {
      errors.email = 'Email';
    }

    // Validate password
    if (!trimmedData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Google Sign-In handler
  const handleGoogleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await googleLogin();
      if (result?.success) {
        toast.success('Login successful!');
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);

      if (error.message === 'Please sign up with Google first') {
        toast.error(error.message);
        navigate('/signup');
      } else {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };
  // Form field change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();


    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {


      const data = await login(formData);


      if (data.success) {


        toast.success('Login successful!');
        navigate('/home');
      }
    } catch (error) {
      console.log(error.message);

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

  return (
    // <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    //   <div className="max-w-md w-full space-y-8">
    //     <div>
    //       <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //         Sign in to your account
    //       </h2>
    //     </div>
    //     <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
    //       <div className="rounded-md shadow-sm -space-y-px">
    //         <div>
    //           <label htmlFor="email" className="sr-only">
    //             Email or Username
    //           </label>
    //           <input
    //             id="email"
    //             name="email"
    //             type="text"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="Email "
    //             value={formData.email}
    //             onChange={handleChange}
    //           />
    //           {validationErrors.emailOrUsername && (
    //             <p className="text-red-500 text-xs mt-1">{validationErrors.emailOrUsername}</p>
    //           )}
    //         </div>
    //         <div>
    //           <label htmlFor="password" className="sr-only">
    //             Password
    //           </label>
    //           <input
    //             id="password"
    //             name="password"
    //             type="password"
    //             required
    //             className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
    //             placeholder="Password"
    //             value={formData.password}
    //             onChange={handleChange}
    //           />
    //           {validationErrors.password && (
    //             <p className="text-red-500 text-xs mt-1">{validationErrors.password}</p>
    //           )}
    //         </div>
    //       </div>

    //       <div className="flex items-center justify-between">
    //         <div className="text-sm">
    //           <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
    //             Forgot your password?
    //           </Link>
    //         </div>
    //       </div>

    //       <div>
    //         <button
    //           type="submit"
    //           disabled={loading}
    //           className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
    //             loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
    //           } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    //         >
    //           {loading ? (
    //             <span className="flex items-center">
    //               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    //               </svg>
    //               Signing in...
    //             </span>
    //           ) : (
    //             'Sign in'
    //           )}
    //         </button>
    //       </div>

    //       <div className="mt-6">
    //         <div className="relative">
    //           <div className="absolute inset-0 flex items-center">
    //             <div className="w-full border-t border-gray-300"></div>
    //           </div>
    //           <div className="relative flex justify-center text-sm">
    //             <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
    //           </div>
    //         </div>

    //         <div className="mt-6">
    //           <button
    //             onClick={handleGoogleSignIn}
    //             disabled={loading}
    //             className={`w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 ${
    //               loading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:bg-gray-50'
    //             } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
    //           >
    //             <img
    //               className="h-5 w-5 mr-2"
    //               src="https://www.svgrepo.com/show/475656/google-color.svg"
    //               alt="Google logo"
    //             />
    //             {loading ? 'Signing in...' : 'Sign in with Google'}
    //           </button>
    //         </div>
    //       </div>
    //     </form>

    //     <div className="text-center">
    //       <p className="text-sm text-gray-600">
    //         Dont have an account?{' '}
    //         <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
    //           Sign up
    //         </Link>
    //       </p>
    //     </div>
    //   </div>
    // </div>

    <div className="flex items-center justify-center min-h-screen bg-red-600">
    <div className="w-full min-h-[500px] max-w-4xl h-auto md:h-[75%] bg-white rounded-lg shadow-md flex flex-col md:flex-row gap-5 p-5 md:p-0">
      <div className="w-full md:w-[48%] p-5 md:p-7">
        <h2 className="text-2xl font-bold text-center mb-6">Login to your account</h2>
        
        {/* {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {errorMessage}
          </div>
        )} */}

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
            <Link href="/forgot-password" className="text-red-600 hover:text-red-800">
              Forgot your password?
            </Link>
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
          <span className="text-gray-600">Dont have an account? </span>
          <Link href="/signup" className="text-red-600 hover:text-red-800 font-medium">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Login;
