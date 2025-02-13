import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/table/DataTable';
import { toast } from 'react-toastify';
import { getAllProducts, toggleProductStatus , bestSellingProducts} from '../../api/admin.api';


const Products = () => {
  const [products, setProducts] = useState([]);
  const [showBestSelling, setShowBestSelling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  const handlePageChange = (page) => {
    if (showBestSelling) {
      fetchBestSellingProducts(page);
    } else {
      fetchProducts(page);
    }
  };

  useEffect(() => {
    if (showBestSelling) {
      fetchBestSellingProducts();
    } else {
      fetchProducts(pagination.currentPage);
    }
  }, [showBestSelling]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getAllProducts(page, pagination.itemsPerPage);
      setProducts(response.products);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchBestSellingProducts = async () => {
    try {
      setLoading(true);
      const response = await bestSellingProducts();
 
      if (response.success) {
        setProducts(response.products); 
      } else {
        toast.error(response.message || 'Failed to fetch best selling products');
      }
    } catch (error) {
      console.error('Error fetching best selling products:', error);
      toast.error('Failed to fetch best selling products');
    } finally {
      setLoading(false);
    }
  };

  

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await toggleProductStatus(productId, !currentStatus);
      if (showBestSelling) {
        fetchBestSellingProducts();
      } else {
        fetchProducts(pagination.currentPage);
      }
      toast.success('Product status updated successfully');
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast.error(error.message || 'Failed to update product status');
    }
  };


  const columns = [
    { field: 'name', header: 'Product Name' },
    { 
      field: 'card_image', 
      header: 'Card Image',
      render: (rowData) => (
        <div className="w-16 h-16 flex items-center justify-center">
          {rowData.card_image?.url ? (
            <img 
              src={rowData.card_image.url}
              alt={`${rowData.name} card_image`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/placeholder-card_image.png';
              }}
            />
          ) : (
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
        </div>
      )
    },
    { field: 'brand', header: 'Brand', render: (rowData) => rowData.brand?.name || 'N/A' },
    // { field: 'series', header: 'Series', render: (rowData) => rowData.series?.name || 'N/A' },
    { field: 'scale', header: 'Scale' },
    { field: 'type', header: 'Type' },
    { 
      field: 'price', 
      header: 'Price',
      render: (rowData) => {
        const price = Number(rowData.price);
        return `₹${isNaN(price) ? '0.00' : price.toFixed(2)}`;
      }
    },
    {
      field: 'offer',
      header: 'Offer (%)',
      render: (rowData) => {
        const offer = Number(rowData.offer);
        return offer > 0 ? `${offer}%` : '-';
      }
    },
    ...(showBestSelling ? [
      {
        field: 'totalSold',
        header: 'Units Sold',
        render: (rowData) => rowData.totalSold || 0
      },
      {
        field: 'totalRevenue',
        header: 'Total Revenue',
        render: (rowData) => `₹${(rowData.totalRevenue || 0).toFixed(2)}`
      }
    ] : []),
    { 
      field: 'stock', 
      header: 'Stock',
      render: (rowData) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          rowData.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {rowData.stock > 0 ? `In Stock (${rowData.stock})` : 'Out of Stock'}
        </span>
      )
    },
    {
      field: 'isActive',
      header: 'Status',
      render: (rowData) => (
        <div className="flex items-center justify-center">
          <button
            onClick={() => handleToggleActive(rowData._id, rowData.isActive)}
            className={`
              relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
              transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${rowData.isActive ? 'bg-blue-600' : 'bg-gray-200'}
            `}
            role="switch"
            aria-checked={rowData.isActive}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
                transition duration-200 ease-in-out
                ${rowData.isActive ? 'translate-x-5' : 'translate-x-0'}
              `}
            />
          </button>
        </div>
      )
    }
  ];

  const navigate = useNavigate();

  const handleEdit = (product) => {
    navigate(`/admin/addproduct/${product._id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex items-center gap-4">
         
          <button
            onClick={() => setShowBestSelling(!showBestSelling)}
            className={`px-4 py-2 rounded ${
              showBestSelling
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {showBestSelling ? 'Show All Products' : 'Show Best Selling'}
          </button>
          <button 
            onClick={() => navigate('/admin/addproduct')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Add Product
          </button>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={products}
        onEdit={handleEdit}
        actions={['edit']}
      />

      {/* Only show pagination for regular products, not best selling */}
      {!showBestSelling && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} products
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className={`px-3 py-1 rounded ${pagination.currentPage === 1 ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-3 py-1 rounded ${pagination.currentPage === pagination.totalPages ? 'bg-gray-200 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
