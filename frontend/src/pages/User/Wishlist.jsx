import  {useState , useEffect} from 'react'
import {motion} from 'framer-motion'
import {toast} from 'react-toastify'
import {fetchWishlist} from '../../api/user.api'
import ProductCard from '../../components/ProductCard'
import { useNavigate } from 'react-router-dom'

const Wishlist = () => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const getWishlist = async () => {
    setLoading(true);
    try {
      const response = await fetchWishlist();
      
      
      // Check if wishlist exists and has items
      if (response?.wishlist?.items) {
        // Map through items to get product details
        const wishlistProducts = response.wishlist.items.map(item => item.product);
        setProducts(wishlistProducts);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error('Failed to fetch wishlist');
      setProducts([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getWishlist();
  }, []);

  return (
    <div className="flex gap-6 pt-3 min-h-screen">
      <div className="w-full">
        {/* Heading */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          <p className="text-gray-500 mt-2">Products you've saved for later</p>
        </div>

        {/* Products Section */}
        <div className="w-full md:w-[82%] rounded-lg">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
          ) : !products || products.length === 0 ? (
            <div className="flex flex-col justify-center items-center h-64 space-y-4">
              <img 
                src="/empty-wishlist.png" 
                alt="Empty Wishlist" 
                className="w-32 h-32 opacity-50"
              />
              <p className="text-xl text-gray-500 font-medium">Your wishlist is empty</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/shop')}
                className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                Explore Products
              </motion.button>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <motion.div 
                className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {products.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <ProductCard
                      _id={product._id}
                      name={product.name}
                      scale={product.scale}
                      price={product.price}
                      card_image={product.card_image?.url}
                      brand={product.brand.name}
                      buttonColor={product.buttonColor}
                      cardColor={product.cardColor}
                      isInWishlist={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;