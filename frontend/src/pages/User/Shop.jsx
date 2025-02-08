import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import FilterBar from '../../components/user/filterBar/FilterBar';
import ProductCard from '../../components/ProductCard';
import { filteredProducts } from '../../api/user.api';
import { toast } from 'react-toastify';
import { FiFilter } from 'react-icons/fi';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    priceRange: { min: 0, max: 10000 },
    brands: [],
    scale: [],
    sortBy: 'default',
  });
  const itemsPerPage = 8;

  const fetchFilteredProducts = async (filters, page = 1) => {
    try {
      setLoading(true);
      const searchQuery = searchParams.get('search');
      const response = await filteredProducts({ 
        ...filters, 
        page, 
        limit: itemsPerPage,
        search: searchQuery 
      });
     
      setProducts(response.products);
      setTotalPages(response.totalPages || Math.ceil(response.totalCount / itemsPerPage));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts(currentFilters);
  }, [searchParams]);

  const handleFilterChange = async (filters) => {
    setCurrentPage(1);
    setCurrentFilters(filters);
    await fetchFilteredProducts(filters, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFilteredProducts(currentFilters, page);
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  return (
    <div className="relative">
      {/* Mobile Filter Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="bg-blue-500 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
        >
          <FiFilter size={24} />
        </button>
      </div>

      <div className="flex gap-6 pt-3 relative">
        {/* Filter Sidebar - Mobile */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed inset-0 z-40 bg-white md:hidden"
            >
              <div className="h-full overflow-y-auto p-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                <FilterBar onFilterChange={handleFilterChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Sidebar - Desktop */}
        <div className="w-[18%] min-h-screen hidden md:block">
          <FilterBar onFilterChange={handleFilterChange} />
        </div>

        {/* Products and Pagination */}
        <div className="w-full md:w-[82%] rounded-lg px-4 md:px-0">
          {/* Heading */}
          <div className=" text-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {searchParams.get('search') ? 'Search Results' : 'Our Products'}
            </h1>
            {searchParams.get('search') && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <p className="text-gray-500">
                  Showing results for "{searchParams.get('search')}"
                </p>
                <button
                  onClick={clearSearch}
                  className="text-red-600 hover:text-red-700 text-sm font-medium hover:underline"
                >
                  View all products
                </button>
              </div>
            )}
            <p className="text-gray-500 mt-2">Browse our products and services</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No products found matching your filters.</p>
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
                    />
                  </motion.div>
                ))}
              </motion.div>

              {/* Numbered Pagination */}
              <motion.div 
                className="flex justify-center mt-6 space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {Array.from({ length: totalPages }, (_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`px-3 py-2 rounded-lg ${
                      currentPage === index + 1
                        ? 'bg-blue-500 text-white'
                        : 'text-blue-500 hover:bg-blue-100'
                    }`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </motion.button>
                ))}
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Overlay for mobile filter */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}
    </div>
  );
};

export default Shop;
