import { useEffect ,useState} from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/admin/table/DataTable';
import { toast } from 'react-toastify';
import { getAllProducts, toggleProductStatus } from '../../api/admin.api';


const Products = () => {
  const [products, setProducts] = useState([]);
 
useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts()
      setProducts(response.products)
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.message || 'Failed to load products');
    }
  };

  const handleToggleActive = async (productId, currentStatus) => {
    try {
      await toggleProductStatus(productId, !currentStatus);
      
      // Refresh the brands list
      fetchProducts();
      toast.success('Brand status updated successfully');
    } catch (error) {
      console.error('Error toggling brand status:', error);
      toast.error(error.message || 'Failed to update brand status');
    }
  };

  

  // Column definitions
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
    { field: 'series', header: 'Series', render: (rowData) => rowData.series?.name || 'N/A' },
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
    console.log('Edit product:', product);
  };

 
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button 
          onClick={() => navigate('/admin/addproduct')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={products}
        onEdit={handleEdit}
        actions={['edit']}
      />
    </div>
  );
};

export default Products;
