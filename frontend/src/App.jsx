import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/User/Signup";
import Login from "./pages/User/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserLayout from "./components/layouts/UserLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Products from "./pages/Admin/Products";
import Brands from "./pages/Admin/Brands";
import AddProduct from "./pages/Admin/AddProduct";
import AddBrand from "./pages/Admin/AddBrand";
import AddSeries from "./pages/Admin/AddSeries";
import Home from "./pages/User/Home";
import UserProtectedRoute from "./components/protectedRoutes/UserProtectedRoutes";
import Series from "./pages/Admin/Series";
import AdminLogin from "./pages/Admin/AdminLogin";
import Product from "./pages/User/Product";
import Profile from "./pages/User/Profile.jsx";
import UserAccountLayout from "./components/layouts/UserAccountLayout";
import Address from "./pages/User/Address";
import Addresses from "./pages/User/Addresses";
import Shop from "./pages/User/Shop";
import Cart from "./pages/User/Cart";
import Checkout from "./pages/User/Checkout";
import OrderHistory from "./pages/User/OrderHistory";
import Order from "./pages/Admin/Order";
import AddBanner from "./pages/Admin/AddBanner";
import AddCoupons from "./pages/Admin/AddCoupons";
import Coupons from "./pages/Admin/Coupon";
import SingleOrder from "./pages/User/SingleOrder";
import AdminSingleOrder from "./pages/Admin/SingleOrder";
import Wishlist from "./pages/User/Wishlist";
import SalesReport from "./pages/Admin/SalesReport";
import Wallet from "./pages/User/Wallet";
import ChangePassword from "./pages/User/ChangePassword";
import LoginProtect from "./components/protectedRoutes/LoginProtect.jsx";
import NotFound from "./components/NotFound";

function App() {
  return (
    <BrowserRouter future={{ 
      v7_relativeSplatPath: true,
      v7_startTransition: true 
    }}>
      <ToastContainer 
        position="top-right"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover={false}
        theme="colored"
        limit={1}
      />
      <Routes>
        {/* User Routes */}
        <Route path="/login" element={<LoginProtect><Login/></LoginProtect>} />
        <Route path="/signup" element={<LoginProtect><Signup /></LoginProtect>} />
        <Route path='checkout' element={<Checkout/>}/>
        <Route  element={<UserLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path='product/:productId' element={
            <Product/>
          } />
          {/* <Route path="/home" element={<UserProtectedRoute requiredRole="user"><Home /></UserProtectedRoute>} /> */}
          <Route path='/home' element={<Home/>} />

          <Route path="/shop" element={<Shop/>} />
          
        </Route> 

        <Route element={<UserAccountLayout />}>
          <Route path="/profile/dashboard" element={<UserProtectedRoute requiredRole="user"><Profile /></UserProtectedRoute>} />  
          <Route path="/profile/address" element={<UserProtectedRoute requiredRole="user"><Address /></UserProtectedRoute>} />
          <Route path="/profile/addresses" element={<UserProtectedRoute requiredRole="user"><Addresses /></UserProtectedRoute>} />
          <Route path="/profile/cart" element={<UserProtectedRoute requiredRole="user"><Cart /></UserProtectedRoute>} />
          <Route path="/profile/orderhistory" element={<UserProtectedRoute requiredRole="user"><OrderHistory /></UserProtectedRoute>} />
          <Route path="/profile/order/:orderId" element={<UserProtectedRoute requiredRole="user"><SingleOrder /></UserProtectedRoute>} />
          <Route path="/profile/wishlist" element={<UserProtectedRoute requiredRole="user"><Wishlist /></UserProtectedRoute>} />
          <Route path="/profile/wallet" element={<UserProtectedRoute requiredRole="user"><Wallet /></UserProtectedRoute>} />
          <Route path="/profile/changePassword" element={<UserProtectedRoute requiredRole="user"><ChangePassword /></UserProtectedRoute>} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin/>} />
        
        <Route path="/admin" element={<UserProtectedRoute requiredRole="admin"><AdminLayout /></UserProtectedRoute>}>
          <Route index element={<Navigate to="/admin/login" replace />} />
          <Route path="login" element={<AdminLogin/>} />
          <Route path="dashboard" element={
            <UserProtectedRoute requiredRole="admin">
              <Dashboard />
            </UserProtectedRoute>
          } />
          <Route path="users" element={
            <UserProtectedRoute requiredRole="admin">
              <Users />
            </UserProtectedRoute>
          } />
          <Route path="products" element={
            <UserProtectedRoute requiredRole="admin">
              <Products />
            </UserProtectedRoute>
          } />
          <Route path="brands" element={
            <UserProtectedRoute requiredRole="admin">
              <Brands />
            </UserProtectedRoute>
          } />
          <Route path="addproduct" element={
            <UserProtectedRoute requiredRole="admin">
              <AddProduct />
            </UserProtectedRoute>
          } />
          <Route path="addproduct/:productId" element={
            <UserProtectedRoute requiredRole="admin">
              <AddProduct />
            </UserProtectedRoute>
          } />
          <Route path="addbrand" element={
            <UserProtectedRoute requiredRole="admin">
              <AddBrand />
            </UserProtectedRoute>
          } />
          <Route path="addbrand/:brandId" element={
            <UserProtectedRoute requiredRole="admin">
              <AddBrand />
            </UserProtectedRoute>
          } />
          <Route path="addseries" element={
            <UserProtectedRoute requiredRole="admin">
              <AddSeries />
            </UserProtectedRoute>
          } />
          <Route path="series" element={
            <UserProtectedRoute requiredRole="admin">
              <Series />
            </UserProtectedRoute>
          } />
          <Route path="orders" element={
            <UserProtectedRoute requiredRole="admin">
              <Order />
            </UserProtectedRoute>
          } />
          <Route path="order/:orderId" element={
            <UserProtectedRoute requiredRole="admin">
              <AdminSingleOrder />
            </UserProtectedRoute>
          } />
          <Route path="addBanner" element={
            <UserProtectedRoute requiredRole="admin">
              <AddBanner />
            </UserProtectedRoute>
          } />
          <Route path="addcoupon" element={
            <UserProtectedRoute requiredRole="admin">
              <AddCoupons />
            </UserProtectedRoute>
          } />
          <Route path="coupons" element={
            <UserProtectedRoute requiredRole="admin">
              <Coupons />
            </UserProtectedRoute>
          } />
           <Route path="coupon/:id" element={
            <UserProtectedRoute requiredRole="admin">
              <AddCoupons />
            </UserProtectedRoute>
          } />
          <Route path="salesReport" element={
            <UserProtectedRoute requiredRole="admin">
              <SalesReport />
            </UserProtectedRoute>
          } />
        </Route>
        <Route path="*" element={<NotFound />} />
       
      </Routes>
    </BrowserRouter>
  );
}

export default App;
