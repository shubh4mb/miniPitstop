// store.js
import { configureStore } from '@reduxjs/toolkit';
import otpSlice from './slices/auth/otpSlice';
import filterSlice from './slices/user/filterSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Uses localStorage by default
import { combineReducers } from '@reduxjs/toolkit';
import userSlice from './slices/user/userSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['otp', 'user'] // Only persist the otp slice
};

const rootReducer = combineReducers({
  otp: otpSlice,
  filter:filterSlice,
  user:userSlice
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
