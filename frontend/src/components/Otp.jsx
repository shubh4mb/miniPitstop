import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  hideOtpComponent, 
  incrementAttempt,
  setOtpExpiry
} from '../redux_store/slices/auth/otpSlice';
import { verifyOTP, resendOTP } from '../api/auth.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Otp = () => {
  const [otp, setOtp] = useState(new Array(6).fill("")); 
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const email = useSelector((state) => state.otp.email);
  const attempts = useSelector((state) => state.otp.attempts);
  const maxAttempts = useSelector((state) => state.otp.maxAttempts);
  const otpExpiry = useSelector((state) => state.otp.otpExpiry);

  // Initialize timer from Redux state
  useEffect(() => {
    if (otpExpiry) {
      const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
      setTimeLeft(remaining);
    }
  }, [otpExpiry]);

  useEffect(() => {
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Send initial OTP if needed
    if (!otpExpiry || Date.now() >= otpExpiry) {
      handleResendOTP();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current);
            dispatch(setOtpExpiry(null));
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
  }, [timeLeft, dispatch]);

  const handleResendOTP = async () => {
    if (resending || timeLeft > 0) return;

    setResending(true);
    try {
      const response = await resendOTP(email);
      setResending(false);
      
      // Reset timer and store expiry in Redux
      const newExpiry = Date.now() + 120 * 1000; // 120 seconds from now
      dispatch(setOtpExpiry(newExpiry));
      setTimeLeft(120);
      
      // Clear existing OTP fields
      setOtp(new Array(6).fill(""));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      toast.success(response.data.message || 'New OTP sent successfully');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setResending(false);
      const errorMessage = error.message || 'Failed to resend OTP';
      
      if (error.response?.status === 404 || errorMessage.includes('expired')) {
        toast.error('Registration session expired. Please sign up again.');
        dispatch(hideOtpComponent());
        navigate('/signup');
        return;
      }
      
      toast.error(errorMessage);
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

  const handleVerifyOTP = async () => {
    if (loading || otp.some(digit => !digit)) return;

    setLoading(true);
    try {
      const otpValue = otp.join('');
      const response = await verifyOTP(email, otpValue);
      setLoading(false);
      toast.success(response.data.message || 'OTP verified successfully');
      dispatch(hideOtpComponent());
      navigate('/login');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setLoading(false);
      dispatch(incrementAttempt());
      
      const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP';
      toast.error(errorMessage);
      
      // Clear OTP fields on error
      setOtp(new Array(6).fill(""));
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-6">Enter OTP</h2>
        <p className="text-gray-600 text-center mb-6">
          We've sent a verification code to<br />
          <span className="font-medium">{email}</span>
        </p>
        
        <div className="flex justify-center gap-2 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={el => inputRefs.current[index] = el}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              className="w-12 h-12 border-2 rounded-lg text-center text-xl font-bold"
            />
          ))}
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">
            Time remaining: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </p>
          <button
            onClick={handleResendOTP}
            disabled={timeLeft > 0 || resending}
            className={`text-blue-600 hover:text-blue-800 ${(timeLeft > 0 || resending) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {resending ? 'Sending...' : 'Resend OTP'}
          </button>
          <p className="text-sm text-gray-500 mt-1">
            Attempts remaining: {maxAttempts - attempts}
          </p>
        </div>

        <button
          onClick={handleVerifyOTP}
          disabled={loading || otp.some(digit => !digit)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>
      </div>
    </div>
  );
};

export default Otp;
