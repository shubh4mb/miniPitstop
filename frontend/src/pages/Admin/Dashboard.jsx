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
import { format } from 'date-fns';
import { getRevenueChartData } from '../../api/admin.api';
import { toast } from 'react-hot-toast';
import DatePicker from 'react-datepicker';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [timeFilter, setTimeFilter] = useState('today');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(),
    endDate: new Date()
  });
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = timeFilter === 'custom' ? customDateRange : {};
      const response = await getRevenueChartData(timeFilter, startDate, endDate);
      console.log('Response data:', response); // Debug log
      if (response.success && response.data) {
        // If orders are directly in response.data
        const ordersData = Array.isArray(response.data) ? response.data : 
                          response.data.orders ? response.data.orders : [];
        console.log('Processed orders:', ordersData); // Debug log
        setOrders(ordersData);
      } else {
        toast.error(response.message || 'Failed to fetch chart data');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      toast.error(error.message || 'Failed to fetch chart data');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [timeFilter, customDateRange]);

  // Prepare chart data
  const chartData = {
    labels: orders?.map(order => {
      const date = new Date(order.orderDate);
      return format(date, 
        timeFilter === 'today' ? 'HH:mm' : 
        timeFilter === 'week' ? 'EEE' : 
        timeFilter === 'month' ? 'dd MMM' : 
        timeFilter === 'year' ? 'MMM' :
        'dd MMM'
      );
    }) || [],
    datasets: [
      {
        label: 'Sales Revenue',
        data: orders?.map(order => Number(order.totalAmount)) || [],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
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
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  return (
    <div className="w-[100%] bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-3xl font-bold">150</p>
        </div>
        <div className="bg-green-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Active Bookings</h3>
          <p className="text-3xl font-bold">25</p>
        </div>
        <div className="bg-yellow-100 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Total Services</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Revenue Overview</h2>
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
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                <DatePicker
                  selected={customDateRange.startDate}
                  onChange={date => setCustomDateRange(prev => ({ ...prev, startDate: date }))}
                  selectsStart
                  startDate={customDateRange.startDate}
                  endDate={customDateRange.endDate}
                  className="px-3 py-2 border rounded-md"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">End Date</label>
                <DatePicker
                  selected={customDateRange.endDate}
                  onChange={date => setCustomDateRange(prev => ({ ...prev, endDate: date }))}
                  selectsEnd
                  startDate={customDateRange.startDate}
                  endDate={customDateRange.endDate}
                  minDate={customDateRange.startDate}
                  className="px-3 py-2 border rounded-md"
                  dateFormat="dd/MM/yyyy"
                />
              </div>
              <button
                onClick={() => {
                  setTimeFilter('custom');
                  setShowCustomDatePicker(false);
                }}
                className="mt-6 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Apply
              </button>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[400px]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <Bar data={chartData} options={chartOptions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;