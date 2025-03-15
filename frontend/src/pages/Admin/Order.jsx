import React, { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../api/admin.api';
import DataTable from '../../components/admin/table/DataTable';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const Order = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getAllOrders(page, pagination.itemsPerPage);
      if (response.success) {
        setOrders(response.orders);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch orders');
      }
    } catch (err) {
      setError('Error fetching orders');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (order, status) => {
    setSelectedOrder(order);
    setNewStatus(status);
    setShowModal(true);
  };

  const handleOrderUpdate = async () => {
    try {
      const response = await updateOrderStatus(selectedOrder._id, newStatus);

      if (response.success) {
        // Refresh the orders to get the updated data
        fetchOrders(pagination.currentPage);
        toast.success('Order status updated successfully');
        setShowModal(false);
      } else {
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (error) {
      //('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handlePageChange = (page) => {
    fetchOrders(page);
  };

  const handleView = (order) => {
    setViewOrder(order);
    setShowViewModal(true);
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return `${address.fullName}, ${address.city}, ${address.state}, ${address.pincode}`;
  };

  const getStatusBadgeClass = (status) => {
    const statusClasses = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'cancelled': 'bg-red-100 text-red-800',
      'delivered': 'bg-green-100 text-green-800',
      'return_requested': 'bg-pink-100 text-pink-800',
      'returned': 'bg-orange-100 text-orange-800'
    };
    return statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'shipped': 'Shipped',
      'cancelled': 'Cancelled',
      'delivered': 'Delivered',
      'return_requested': 'Return Requested',
      'returned': 'Returned'
    };
    return statusLabels[status] || status;
  };

  const columns = [
    { 
      field: 'orderId', 
      header: 'Order ID',
      render: (rowData) => rowData._id.substring(0, 8) + '...'
    },
    { 
      field: 'user', 
      header: 'Customer',
      render: (rowData) => rowData.user?.fullName || 'N/A'
    },
    {
      field: 'totalAmount',
      header: 'Total Amount',
      render: (rowData) => `₹${rowData.totalAmount.toFixed(2)}`
    },
    {
      field: 'paymentMethod',
      header: 'Payment Method',
      render: (rowData) => rowData.paymentMethod.charAt(0).toUpperCase() + rowData.paymentMethod.slice(1)
    },
    {
      field: 'orderDate',
      header: 'Order Date',
      render: (rowData) => format(new Date(rowData.orderDate), 'dd/MM/yyyy HH:mm')
    },
    {
      field: 'orderStatus',
      header: 'Status',
      render: (rowData) => (
        <div className="flex items-center">
          <select
            value={rowData.orderStatus}
            onChange={(e) => handleStatusChange(rowData, e.target.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(rowData.orderStatus)}`}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirm</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="return_requested">Return Requested</option>
            <option value="returned">Returned</option>
          </select>
        </div>
      )
    },
    {
      field: 'items',
      header: 'Items',
      render: (rowData) => rowData.items.length
    },
    {
      field: 'paymentStatus',
      header: 'Payment',
      render: (rowData) => (
        <span className={`px-2 py-1 rounded-full text-xs ${rowData.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {rowData.paymentStatus}
        </span>
      )
    }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Management</h1>
      </div>

      <DataTable 
        columns={columns} 
        data={orders}
        onView={handleView}
        actions={['view']}
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} orders
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

      {/* Status Update Confirmation Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Status Update</h2>
            <p className="mb-4">
              Are you sure you want to change the status of order{' '}
              <span className="font-semibold">#{selectedOrder._id.substring(0, 8)}</span> from{' '}
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(selectedOrder.orderStatus)}`}>
                {getStatusLabel(selectedOrder.orderStatus)}
              </span>{' '}
              to{' '}
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(newStatus)}`}>
                {getStatusLabel(newStatus)}
              </span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleOrderUpdate}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details View Modal */}
      {showViewModal && viewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Order Information */}
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Order Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600">Order ID</p>
                    <p className="font-medium">{viewOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">{format(new Date(viewOrder.orderDate), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(viewOrder.orderStatus)}`}>
                      {getStatusLabel(viewOrder.orderStatus)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{viewOrder.paymentMethod.charAt(0).toUpperCase() + viewOrder.paymentMethod.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${viewOrder.paymentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {viewOrder.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{viewOrder.user?.fullName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Email</p>
                    <p className="font-medium">{viewOrder.user?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{viewOrder.user?.phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="col-span-2 md:col-span-1 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
                <p className="whitespace-pre-wrap">{formatAddress(viewOrder.shippingAddress)}</p>
              </div>

              {/* Order Items */}
              <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-2">{item.product.name}</td>
                          <td className="px-4 py-2">{item.quantity}</td>
                          <td className="px-4 py-2">₹{item.price.toFixed(2)}</td>
                          <td className="px-4 py-2">₹{(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-2 text-right font-medium">Subtotal:</td>
                        <td className="px-4 py-2 font-medium">₹{viewOrder.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;