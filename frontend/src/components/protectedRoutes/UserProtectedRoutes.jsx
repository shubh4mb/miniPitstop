import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuth,} from '../../utils/auth.utils';
import { toast } from 'react-toastify';


const UserProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isActive, setIsActive] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      
      
      try {
        const response = await isAuth();
        
        
        const authStatus = response.data.isAuthenticated;
        const role = response.data.role;
        const isActive = response.data.isActive;
        setAuthenticated(authStatus);
        setUserRole(role);
        setIsActive(isActive);
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  });

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  if(isActive === false){ 
    toast.error('Your account is blocked');
    return <Navigate to="/" replace />;
  }

  if (!authenticated) {
    // Redirect to appropriate login page based on required role
    return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect based on role mismatch
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/'} replace />;
  }

  return children;
};

export default UserProtectedRoute;