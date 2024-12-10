import { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  hideOtpComponent, 
  incrementAttempt
} from '../redux_store/slices/auth/otpSlice';
import { verifyOTP , resendOTP } from '../api/auth.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Otp = () => {
  const [otp, setOtp] = useState(new Array(6).fill("")); 
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    const storedExpiry = localStorage.getItem('otpExpiry');
    if (storedExpiry) {
      const remainingTime = Math.max(0, Math.floor((parseInt(storedExpiry) - Date.now()) / 1000));
      return remainingTime > 0 ? remainingTime : 120;
    }
    return 120;
  });
  const inputRefs = useRef([]);
  const timerRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const email = useSelector((state) => state.otp.email);
  const attempts = useSelector((state) => state.otp.attempts);
  const maxAttempts = useSelector((state) => state.otp.maxAttempts);

  useEffect(() => {
    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Only send initial OTP if there's no timer running
    if (!localStorage.getItem('otpExpiry')) {
      handleResendOTP();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Start or resume timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current);
          localStorage.removeItem('otpExpiry');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Cleanup timer
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleResendOTP = async () => {
    if (resending || timeLeft > 0) return;

    setResending(true);
    try {
      const response = await resendOTP(email);
      setResending(false);
      
      // Reset timer
      const newExpiry = Date.now() + 120 * 1000; // 120 seconds from now
      localStorage.setItem('otpExpiry', newExpiry.toString());
      setTimeLeft(120);
      
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }

      toast.success(response.data.message || 'New OTP sent successfully');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setResending(false);
      const errorMessage = error.message || 'Failed to resend OTP';
      
      // Handle expired or not found cases
      if (error.response?.status === 404 || errorMessage.includes('expired')) {
        toast.error('Registration session expired. Please sign up again.');
        dispatch(hideOtpComponent());
        navigate('/signup');
        return;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleVerifyOTP = async () => {
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOTP(email, otpValue);
      toast.success(response.data.message || 'Email verified successfully');
      dispatch(hideOtpComponent());
      navigate('/login');
    } catch (error) {
      console.error('OTP verification error:', error);
      const errorMessage = error.message || 'Failed to verify OTP';
      
      // Handle expired OTP or not found cases
      if (error.response?.status === 404 || errorMessage.includes('expired')) {
        toast.error('Registration session expired. Please sign up again.');
        dispatch(hideOtpComponent());
        navigate('/signup');
        return;
      }
      
      if (errorMessage.includes('Invalid OTP') || errorMessage.includes('incorrect')) {
        dispatch(incrementAttempt());
        const remainingAttempts = maxAttempts - (attempts + 1);
        
        if (remainingAttempts > 0) {
          toast.error(`Invalid OTP. ${remainingAttempts} attempts remaining`);
        } else {
          toast.error('Maximum attempts reached. Please sign up again.');
          dispatch(hideOtpComponent());
          navigate('/signup');
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Move to previous input on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Format time to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full md:w-[52%] bg-red-600 text-white p-8 flex flex-col justify-center items-center rounded-r-lg">
      <h2 className="text-2xl font-bold mb-6">Verify Your Email</h2>
      <p className="text-center mb-6">
        We have sent a verification code to<br />
        <span className="font-semibold">{email}</span>
      </p>

      <div className="flex gap-2 mb-6">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOTPChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 text-center text-xl font-bold text-black border-2 rounded-lg focus:border-red-400 focus:outline-none"
          />
        ))}
      </div>

      {attempts > 0 && attempts < maxAttempts && (
        <p className="text-sm mb-4">
          {maxAttempts - attempts} attempts remaining
        </p>
      )}

      <div className="flex flex-col items-center gap-4">
        {/* Timer display */}
        <div className="text-sm text-gray-600">
          {timeLeft > 0 ? (
            <span>OTP expires in: {formatTime(timeLeft)}</span>
          ) : (
            <span>OTP expired</span>
          )}
        </div>
        
        {/* Resend button */}
        <button
          onClick={handleResendOTP}
          disabled={resending || timeLeft > 0}
          className={`text-sm ${
            timeLeft > 0
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-blue-600 hover:text-blue-800'
          }`}
        >
          {resending ? 'Sending...' : timeLeft > 0 ? `resend will available after otp expires` : 'Resend OTP'}
        </button>
      </div>

      <button
        onClick={handleVerifyOTP}
        disabled={loading || otp.join('').length !== 6}
        className="bg-white text-red-600 px-6 py-2 rounded-lg font-semibold mb-4 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
    </div>
  );
};

export default Otp;
