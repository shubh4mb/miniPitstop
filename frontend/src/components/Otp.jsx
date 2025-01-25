import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  hideOtpComponent, 
  incrementAttempt,
  setOtpExpiry
} from '../redux_store/slices/auth/otpSlice';
import { verifyOTP, resendOTP, verifyForgotPasswordOTP } from '../api/auth.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import ResetPassword from './ResetPassword';

const Otp = () => {
  const [otp, setOtp] = useState(new Array(6).fill("")); 
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResetPassword, setShowResetPassword] = useState(false);
  
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const dismountTimerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const email = useSelector((state) => state.otp.email);
  const attempts = useSelector((state) => state.otp.attempts);
  const maxAttempts = useSelector((state) => state.otp.maxAttempts);
  const otpExpiry = useSelector((state) => state.otp.otpExpiry);
  const verificationType = useSelector((state) => state.otp.verificationType);

  // Set up dismount timer (6 minutes)
  useEffect(() => {
    dismountTimerRef.current = setTimeout(() => {
      toast.error('OTP session expired. Please try again.');
      dispatch(hideOtpComponent());
      if (verificationType === 'signup') {
        navigate('/signup');
      } else {
        navigate('/login');
      }
    }, 6 * 60 * 1000); // 6 minutes

    return () => {
      if (dismountTimerRef.current) {
        clearTimeout(dismountTimerRef.current);
      }
    };
  }, [dispatch, navigate, verificationType]);

  // Initialize timer from Redux state
  useEffect(() => {
    if (otpExpiry) {
      const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
    }
  }, [otpExpiry]);

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timeLeft]);

  const handleVerifyOTP = async () => {
    if (loading || otp.some(digit => !digit)) return;

    setLoading(true);
    try {
      const otpValue = otp.join('');
      let response;

      if (verificationType === 'forgotPassword') {
        response = await verifyForgotPasswordOTP(email, otpValue);
        if (response.success) {
          toast.success(response.message || 'OTP verified successfully');
          setShowResetPassword(true);
        }
      } else {
        console.log(email);
        
        response = await verifyOTP(email, otpValue);
        console.log(response);
        
        
        if (response.success) {
          toast.success(response.message || 'OTP verified successfully');
          dispatch(hideOtpComponent());
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      dispatch(incrementAttempt());
      
      const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP';
      toast.error(errorMessage);
      
      // Clear OTP fields on error
      setOtp(new Array(6).fill(""));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    if (timeLeft > 0) return;
    
    setResending(true);
    try {
      const response = await resendOTP(email);
      if (response.message) {
        setTimeLeft(120); // Restart 120 seconds timer
        toast.success(response.message || 'OTP resent successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      {showResetPassword ? (
        <ResetPassword email={email} onSuccess={() => dispatch(hideOtpComponent())} />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-red-600 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-6 rounded-lg shadow-lg">
            <div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Enter Verification Code
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                We've sent a code to {email}
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <div className="flex justify-center gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    maxLength="1"
                    className="w-12 h-12 text-center text-2xl border rounded-lg focus:outline-none focus:border-red-500"
                    value={digit}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    disabled={loading}
                  />
                ))}
              </div>

              <div>
                <button
                  onClick={handleVerifyOTP}
                  disabled={loading || otp.some(digit => !digit)}
                  className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                    ${loading || otp.some(digit => !digit)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    }`}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {timeLeft > 0 ? (
                    `Resend code in ${timeLeft}s`
                  ) : (
                    <button
                      onClick={handleResendOTP}
                      disabled={resending}
                      className="text-red-600 hover:text-red-500 font-medium focus:outline-none"
                    >
                      {resending ? 'Sending...' : 'Resend code'}
                    </button>
                  )}
                </p>
              </div>

              {attempts > 0 && (
                <div className="text-center text-sm text-gray-600">
                  <p>Attempts remaining: {maxAttempts - attempts}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Otp;
