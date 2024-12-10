import { clearAuth } from "../../../utils/auth.utils";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  return (
    <nav className="admin-glass-effect text-white p-4 w-[60%] mx-auto my-4 mb-6">
      <div className="mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold">MiniPitstop Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">Admin User</span>
          <button 
            className="glass-effect glass-effect-hover px-4 py-2"
            onClick={() => {
              // Add logout logic here
              clearAuth();
              navigate('/admin/login');
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;