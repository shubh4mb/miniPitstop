import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuth, getUserRole } from '../../utils/auth.utils';

const UserProtectedRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [authStatus, role] = await Promise.all([
          isAuth(),
          getUserRole()
        ]);
        setAuthenticated(authStatus);
        setUserRole(role);
      } catch (error) {
        console.error('Auth check failed:', error);
        setAuthenticated(false);
        setUserRole(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
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