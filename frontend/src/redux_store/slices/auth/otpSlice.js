import { createSlice } from '@reduxjs/toolkit';

const otpSlice = createSlice({
  name: 'otp',
  initialState: {
    showOtp: false,
    email: '',
    attempts: 0,
    maxAttempts: 3,
    otpExpiry: null,
    verificationType: 'signup' // 'signup' or 'forgotPassword'
  },
  reducers: {
    showOtpComponent: (state, action) => {
      state.showOtp = true;
      state.email = action.payload.email;
      state.attempts = 0;
      state.otpExpiry = action.payload.otpExpiry;
      state.verificationType = action.payload.type || 'signup';
    },
    hideOtpComponent: (state) => {
      state.showOtp = false;
      state.email = '';
      state.attempts = 0;
      state.otpExpiry = null;
      state.verificationType = 'signup';
    },
    incrementAttempt: (state) => {
      state.attempts += 1;
      if (state.attempts >= state.maxAttempts) {
        state.showOtp = false;
        state.email = '';
        state.attempts = 0;
        state.otpExpiry = null;
      }
    },
    setOtpExpiry: (state, action) => {
      state.otpExpiry = action.payload;
    }
  },
});

export const { 
  showOtpComponent, 
  hideOtpComponent, 
  incrementAttempt,
  setOtpExpiry
} = otpSlice.actions;

export default otpSlice.reducer;