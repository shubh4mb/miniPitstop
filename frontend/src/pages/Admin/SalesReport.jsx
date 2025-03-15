import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getSalesReport, downloadSalesReport , downloadSalesReportExcel} from '../../api/admin.api';
import { toast } from 'react-hot-toast';

const SalesReport = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    paymentMethodStats: {},
    couponStats: {
      totalCouponsUsed: 0,
      totalDiscount: 0,
      couponUsage: {}
    }
  });
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchSalesData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = timeFilter === 'custom' ? customDateRange : {};
      const response = await getSalesReport(timeFilter, startDate, endDate);
      
      if (response.success) {
        setOrders(response.data.orders);
        setStatistics(response.data.statistics);
      } else {
        toast.error(response.message || 'Failed to fetch sales data');
      }
    } catch (error) {
      //('Error fetching sales data:', error);
      toast.error(error.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [timeFilter, customDateRange]);

  const handlePDFDownload = async () => {
    try {
      const { startDate, endDate } = timeFilter === 'custom' ? customDateRange : {};
      const response = await downloadSalesReport(timeFilter, startDate, endDate);
      
      if (response.success) {
        // Create a blob from the Excel data
        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'sales-report.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        toast.error(response.message || 'Failed to download report');
      }
    } catch (error) {
      //('Error downloading report:', error);
      toast.error(error.message || 'Failed to download report');
    }
  };

  const handleExcelDownload = async () => {
    try {
      toast.loading('Generating Excel report...');
      const { startDate, endDate } = timeFilter === 'custom' ? customDateRange : {};
      const response = await downloadSalesReportExcel(timeFilter, startDate, endDate);
      
      if (response.success) {
        // Create a blob from the Excel data
        const blob = new Blob([response.data], { 
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sales-report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        
        // Trigger download
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.dismiss();
        toast.success('Report downloaded successfully');
      } else {
        toast.dismiss();
        toast.error(response.message || 'Failed to download report');
      }
    } catch (error) {
      //('Error downloading report:', error);
      toast.dismiss();
      toast.error('Failed to download report. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <button
          onClick={handlePDFDownload}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          PDF Download
        </button>

        <button
          onClick={handleExcelDownload}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Excel Download
        </button>

      </div>

      {/* Time Filter */}
      <div className="mb-6">
        <select
          value={timeFilter}
          onChange={(e) => {
            setTimeFilter(e.target.value);
            if (e.target.value === 'custom') {
              setShowCustomDatePicker(true);
            } else {
              setShowCustomDatePicker(false);
            }
          }}
          className="border rounded-md px-3 py-2"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom Range</option>
        </select>

        {showCustomDatePicker && (
          <div className="mt-4 flex gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <DatePicker
                selected={customDateRange.startDate}
                onChange={date => setCustomDateRange(prev => ({ ...prev, startDate: date }))}
                className="border rounded-md px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <DatePicker
                selected={customDateRange.endDate}
                onChange={date => setCustomDateRange(prev => ({ ...prev, endDate: date }))}
                className="border rounded-md px-3 py-2"
              />
            </div>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{statistics.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">₹{statistics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Average Order Value</h3>
          <p className="text-2xl font-bold">₹{statistics.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Coupons Used</h3>
          <p className="text-2xl font-bold">{statistics.couponStats.totalCouponsUsed}</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center">No orders found</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{order.orderNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(order.orderDate), 'PPp')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.user?.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{order.totalAmount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{order.paymentMethod}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesReport;