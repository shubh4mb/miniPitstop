import { createSlice } from '@reduxjs/toolkit';

const otpSlice = createSlice({
  name: 'otp',
  initialState: {
    showOtp: false,
    email: '',
    attempts: 0,
    maxAttempts: 3,
    otpExpiry: null
  },
  reducers: {
    showOtpComponent: (state, action) => {
      state.showOtp = true;
      state.email = action.payload;
      state.attempts = 0;
    },
    hideOtpComponent: (state) => {
      state.showOtp = false;
      state.email = '';
      state.attempts = 0;
      state.otpExpiry = null;
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