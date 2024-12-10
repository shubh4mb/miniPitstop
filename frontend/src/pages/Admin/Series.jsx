// import React from 'react';
import { useState , useEffect} from 'react';
import DataTable from '../../components/admin/table/DataTable';
import { getAllSeries, toggleBrandStatus } from '../../api/admin.api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Series = () => {
  const navigate = useNavigate();
  const [series, setSeries] = useState([]);
 
  const fetchSeries = async () => {
    try {
      const response = await getAllSeries();
      setSeries(response.series);
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error(error.message || 'Failed to load brands');
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const handleToggleActive = async (seriesId, currentStatus) => {
    try {
      await toggleBrandStatus(seriesId, !currentStatus);
      
      // Refresh the brands list
      fetchSeries();
      toast.success('Brand status updated successfully');
    } catch (error) {
      console.error('Error toggling brand status:', error);
      toast.error(error.message || 'Failed to update brand status');
    }
  };
  
  const columns = [
    { field: 'name', header: 'Series Name' },
  
    { field: 'offer', header: 'Offer' },
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

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Brands</h1>
        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
         onClick={() => navigate('/admin/addSeries')}
         >
          Add Brand
        </button>
      </div>

      <DataTable 
        columns={columns} 
        data={series}
      />
    </div>
  );
};

export default Series;
