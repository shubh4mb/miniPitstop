import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getSalesReport, getRevenueChartData } from '../../api/admin.api';
import { toast } from 'react-hot-toast';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
      console.error('Error fetching sales data:', error);
      toast.error(error.message || 'Failed to fetch sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [timeFilter, customDateRange]);

  // Prepare chart data
  const chartData = {
    labels: orders.map(order => format(new Date(order.orderDate), 
      timeFilter === 'today' ? 'HH:mm' : 
      timeFilter === 'week' ? 'EEE' : 
      timeFilter === 'month' ? 'dd MMM' : 
      timeFilter === 'year' ? 'MMM' :
      'dd MMM'
    )),
    datasets: [
      {
        label: 'Sales Revenue',
        data: orders.map(order => order.totalAmount),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Sales Revenue Over Time',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue (₹)',
        },
      },
    },
  };

  const handleCustomDateSubmit = () => {
    setTimeFilter('custom');
    setShowCustomDatePicker(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sales Report</h1>
        <div className="flex items-center space-x-2">
          {['today', 'week', 'month', 'year'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setTimeFilter(filter);
                setShowCustomDatePicker(false);
              }}
              className={`px-4 py-2 rounded-md ${
                timeFilter === filter
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
          <button
            onClick={() => setShowCustomDatePicker(!showCustomDatePicker)}
            className={`px-4 py-2 rounded-md ${
              timeFilter === 'custom'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomDatePicker && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center space-x-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Start Date</label>
              <DatePicker
                selected={customDateRange.startDate}
                onChange={date => setCustomDateRange(prev => ({ ...prev, startDate: date }))}
                className="px-3 py-2 border rounded-md"
                dateFormat="dd/MM/yyyy"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">End Date</label>
              <DatePicker
                selected={customDateRange.endDate}
                onChange={date => setCustomDateRange(prev => ({ ...prev, endDate: date }))}
                className="px-3 py-2 border rounded-md"
                dateFormat="dd/MM/yyyy"
                minDate={customDateRange.startDate}
              />
            </div>
            <button
              onClick={handleCustomDateSubmit}
              className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{statistics.totalOrders}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Revenue</h3>
          <p className="text-2xl font-bold">₹{statistics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Average Order Value</h3>
          <p className="text-2xl font-bold">₹{statistics.averageOrderValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm">Total Coupon Savings</h3>
          <p className="text-2xl font-bold text-green-600">₹{statistics.couponStats.totalDiscount.toFixed(2)}</p>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Payment Methods */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm mb-3">Payment Methods</h3>
          <div className="space-y-2">
            {Object.entries(statistics.paymentMethodStats).map(([method, count]) => (
              <div key={method} className="flex justify-between items-center">
                <span className="capitalize">{method}</span>
                <div className="flex items-center">
                  <span className="font-medium">{count}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    ({((count / statistics.totalOrders) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coupon Usage */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-gray-500 text-sm mb-3">Coupon Usage</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Total Coupons Used</span>
              <span>{statistics.couponStats.totalCouponsUsed}</span>
            </div>
            <div className="border-t pt-2">
              {Object.entries(statistics.couponStats.couponUsage).map(([code, count]) => (
                <div key={code} className="flex justify-between items-center mt-1">
                  <span className="font-medium">{code}</span>
                  <div className="flex items-center">
                    <span>{count}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      ({((count / statistics.couponStats.totalCouponsUsed) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Recent Orders Table */}
      <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden">
        <h2 className="text-xl font-semibold p-4 border-b">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon Used
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coupon Savings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.slice(0, 10).map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(order.orderDate), 'dd MMM yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{order.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.couponApplied ? (
                      <span className="text-green-600">{order.couponApplied.code}</span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {order.couponDiscount > 0 ? `₹${order.couponDiscount.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' : 
                        order.orderStatus === 'shipped' ? 'bg-blue-100 text-blue-800' : 
                        'bg-yellow-100 text-yellow-800'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {order.paymentMethod}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesReport;