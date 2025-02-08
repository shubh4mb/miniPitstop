import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    fullName: '',
    email: ''
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.fullName = action.payload.fullName;
            state.email = action.payload.email;
        },
        clearUserData: (state) => {
            return initialState; // This ensures a complete reset to initial state
        }
    }
});

export const { setUser, clearUserData } = userSlice.actions;
export default userSlice.reducer;

// Thunk action creator for setting user with expiration
export const setUserWithExpiration = (user, expirationTime) => (dispatch) => {
    dispatch(setUser(user));
    setTimeout(() => {
        dispatch(clearUserData());
    }, expirationTime);
};