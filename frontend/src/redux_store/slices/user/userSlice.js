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
            state.fullName = '';
            state.email = '';
        }
    }
});

export const { setUser, clearUserData } = userSlice.actions;
export default userSlice.reducer;