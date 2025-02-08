import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { clearAuth } from '../../../utils/auth.utils';
import { useSelector, useDispatch } from 'react-redux';
import { searchBar } from '../../../api/user.api';
import { clearUserData } from '../../../redux_store/slices/user/userSlice';


const Navbar = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  const userData = useSelector((state) => state.user);
  const { fullName, email } = userData;

  const searchProducts = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await searchBar(query);
      // console.log(response.products);

      if (response?.success) {
        setSearchResults(response.products || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProducts(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    clearAuth();
    dispatch(clearUserData());
    navigate('/login')
  };

  return (
    <nav className="user-glass-effect  my-2 p-4 text-gray-600 relative z-50">
      <div className="container mx-auto flex justify-between items-center">

        <div className='flex items-center '>
          <div className="sm:text-xl lg:text-2xl  text-red-600 font-bold tracking-tight hover:text-red-700 transition-colors">
            miniPitstop

          </div>
          {location.pathname !== '/home' && <span onClick={() => navigate('/home')} className="mx-12  hover:text-red-600 transition-colors font-medium">Home</span>}
          <span onClick={() => navigate('/shop')} className="  mx-12 hover:text-red-600 transition-colors font-medium">Shop</span>
        </div>


        <div className="flex items-center space-x-6">

          <div className="relative">
            {/* Search Icon (Visible by default on small screens) */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`lg:hidden text-gray-400 hover:text-red-500 transition-colors ${showSearch ? 'hidden' : 'block'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Search Input (Visible when showSearch is true or on larger screens) */}
            {(showSearch || window.innerWidth >= 1024) && (
              <div className={`flex items-center lg:block ${showSearch ? 'block' : 'hidden'}`}>
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-10 pr-10 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-gray-200 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200 transition-all w-full lg:w-64"
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  value={searchQuery}
                />
                {/* Close Button for Small Screens */}
                <button
                  onClick={() => setShowSearch(false)}
                  className="lg:hidden absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Search Icon for Full Input */}
            {searchQuery && (
              <button
                onClick={handleSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            )}

            {/* Clear Button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

            {/* Search Results Dropdown */}
            {searchQuery && (
              <div className="absolute mt-2 w-full bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
                {loading ? (
                  <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
                ) : searchResults.length > 0 ? (
                  <>
                    {searchResults.map((product) => (
                      <div
                        key={product._id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-3"
                        onClick={() => {
                          navigate(`/product/${product._id}`);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <img
                          src={product.card_image.url}
                          alt={product.name}
                          className="w-12 h-12 object-contain rounded"
                        />
                        <div>
                          <p className="text-sm font-medium">{product.name}</p>
                        </div>
                      </div>
                    ))}
                    <div
                      className="px-4 py-2 text-center border-t border-gray-100 text-red-600 hover:bg-gray-50 cursor-pointer"
                      onClick={handleSearch}
                    >
                      View all results
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No products found
                    <div
                      className="mt-1 text-red-600 hover:underline cursor-pointer"
                      onClick={() => {
                        navigate('/shop');
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      View all products
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <Link to="/profile/wishlist" className="hidden md:flex hover:text-red-600 transition-colors items-center space-x-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {/* <span>Wishlist</span> */}
          </Link>
          <Link to="/profile/cart" className= " hidden md:flex hover:text-red-600 transition-colors  items-center space-x-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {/* <span>Cart</span> */}
          </Link>
          <div className="relative">
            {fullName ? (
              <>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 hover:text-red-600 transition-colors font-medium focus:outline-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{fullName}</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-3 w-48 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 z-[100]">
                    <div className="py-1">
                      <div
                        onClick={() => navigate('/profile/dashboard')}
                        className="group flex items-center px-4 py-2 text-sm normal-text-with-hover"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {fullName}
                      </div>
                      <a href="#" className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        Orders
                      </a>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="group flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => 
                 
                  navigate('/login')}
                className="flex items-center space-x-1 hover:text-red-600 transition-colors font-medium focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {/* <span>Login</span> */}
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;