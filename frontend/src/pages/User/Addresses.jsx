import { useEffect, useState } from 'react';
import { getAddresses, deleteAddress } from '../../api/user.api';
import { toast } from 'react-toastify';
import Address from './Address';

const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedDefault, setSelectedDefault] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.addresses);
      const defaultAddress = response.addresses.find(addr => addr.default);
      if (defaultAddress) {
        setSelectedDefault(defaultAddress._id);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
      console.error(error);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setShowAddressForm(true);
  };

  const handleDelete = async (address) => {
    try {
      await deleteAddress(address._id);
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to delete address');
      console.error(error);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSelectedDefault(addressId);
      // TODO: Add API call to update default address
      toast.success('Default address updated');
    } catch (error) {
      toast.error('Failed to update default address');
      console.error(error);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setShowAddressForm(true);
  };

  const handleAddressSubmitSuccess = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  if (showAddressForm) {
    return (
      <Address
        addressData={editingAddress}
        isEditing={!!editingAddress}
        onCancel={() => {
          setShowAddressForm(false);
          setEditingAddress(null);
        }}
        onSuccess={handleAddressSubmitSuccess}
      />
    );
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Addresses</h2>
        <button
          onClick={handleAddNew}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <span className="mr-2">+</span> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No addresses found. Add your first address!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className="rounded-lg p-4 shadow-md hover:shadow-md transition-shadow user-glass-effect"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{address.fullName}</h3>
                  <p className="text-gray-600">{address.phone}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Delete
                  </button>
                  {/* <input
                    type="radio"
                    name="defaultAddress"
                    checked={selectedDefault === address._id}
                    onChange={() => handleSetDefault(address._id)}
                    className="ml-2 cursor-pointer"
                  /> */}
                  {/* <span className="text-sm text-gray-500">Default</span> */}
                </div>
              </div>

              <div className="mt-2">
                <p className="text-gray-700 line-clamp-2 h-[50px] overflow-hidden">{address.address}</p>
                <p className="text-black-700">
                  {address.city}, {address.state} - {address.pincode}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;