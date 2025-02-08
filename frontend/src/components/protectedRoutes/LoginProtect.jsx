import {useState,useEffect}from 'react'
import { isAuth,} from '../../utils/auth.utils';
import { Navigate } from 'react-router-dom';

const LoginProtect = ({children}) => {

    const[authenticated,setAuthenticated]=useState(null)
    const [loading,setLoading]=useState(false)

    useEffect(() => {
        const checkAuth = async () => {
          
          setLoading(true)
          try {
            const response = await isAuth();
            
            

            
            setAuthenticated(response.data.isAuthenticated);
        
          } catch (error) {
            console.error('Auth check failed:', error);
            setAuthenticated(false);
          
          } finally {
            setLoading(false);
          }
        };
    
        checkAuth();
      });

      if (loading) {
        return <div>Loading...</div>; // Or your loading component
      }

       if (authenticated) {
   
          return <Navigate to={ '/home'} replace />;
        }
        else {
            return children
        }

  
  
}

export default LoginProtect