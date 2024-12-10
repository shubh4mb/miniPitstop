
import axiosInstance from '../../axiosConfig';

export const clearAuth = () => {
    // We'll need the backend to clear the HTTP-only cookie
    return axiosInstance.post('/api/auth/logout')
        .catch(error => {
            console.error('Error during logout:', error);
        });
};

export const isAuth = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/verify');
        return response.data.isAuthenticated;
    } catch (error) {
        console.error('Auth check failed:', error);
        return false;
    }
};

export const getUserRole = async () => {
    try {
        const response = await axiosInstance.get('/api/auth/me');
        return response.data.role;
    } catch (error) {
        console.error('Failed to get user role:', error);
        return null;
    }
};