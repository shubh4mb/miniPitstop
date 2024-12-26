import { useState, useEffect } from 'react';
import FilterBar from '../../components/user/filterBar/FilterBar';
import ProductCard from '../../components/ProductCard';
import { filteredProducts } from '../../api/user.api';
import { toast } from 'react-toastify';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 8; // Number of products per page

  const fetchFilteredProducts = async (filters, page = 1) => {
    try {
      setLoading(true);
      const response = await filteredProducts({ ...filters, page, limit: itemsPerPage });
      setProducts(response.products);
      setTotalPages(response.totalPages || Math.ceil(response.totalCount / itemsPerPage)); // Calculate total pages if not provided
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilteredProducts({
      priceRange: { min: 0, max: 10000 },
      brands: [],
      scale: [],
      sortBy: 'default',
    });
  }, []);

  const handleFilterChange = async (filters) => {
    setCurrentPage(1); // Reset to page 1 on filter change
    await fetchFilteredProducts(filters, 1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFilteredProducts(
      {
        priceRange: { min: 0, max: 10000 },
        brands: [],
        scale: [],
        sortBy: 'default',
      },
      page
    );
  };

  return (
    <div className="flex gap-6 pt-3">
      {/* Filter Sidebar */}
      <div className="w-[18%] min-h-screen hidden md:block">
        <FilterBar onFilterChange={handleFilterChange} />
      </div>

      {/* Products and Pagination */}
      <div className="w-full md:w-[82%] rounded-lg">
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
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product._id}
                  _id={product._id}
                  name={product.name}
                  scale={product.scale}
                  price={product.price}
                  card_image={product.card_image?.url}
                  brand={product.brand.name}
                  buttonColor={product.buttonColor}
                  cardColor={product.cardColor}
                />
              ))}
            </div>

            {/* Numbered Pagination */}
            <div className="flex justify-center mt-6 space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={`px-3 py-2 rounded-lg ${
                    currentPage === index + 1
                      ? 'bg-blue-500 text-white'
                      : 'text-blue-500 hover:bg-blue-100'
                  }`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Shop;
