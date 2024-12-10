import { Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuth, getUserRole } from '../../utils/auth.utils';

const AdminProtectedRoute = ({ children }) => {
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
    return <div>Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  if (userRole !== 'admin') {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminProtectedRoute;