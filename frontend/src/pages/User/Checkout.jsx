import { useState, useEffect } from 'react';
import { getAddresses } from '../../api/user.api';
import { toast } from 'react-toastify';
import { placeOrder } from '../../api/user.api';
import { useLocation, useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  
  const cartItems = location.state?.cartItems || [];
  const total = location.state?.total || 0;

  useEffect(() => {
    if (!location.state?.cartItems) {
      toast.error('No cart items found');
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [location.state, navigate]);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.addresses);
      // Set default address as selected
      const defaultAddress = response.addresses.find(addr => addr.default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.addresses.length > 0) {
        // If no default address, select the first one
        setSelectedAddress(response.addresses[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
      console.error(error);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (step === 2 && !selectedPaymentMethod) {
      toast.error('Please select a payment method');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleChangeAddress = () => {
    setShowAllAddresses(true);
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    setShowAllAddresses(false);
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    try {
        console.log("working");
        
      const orderData = {
        items: cartItems,
        totalAmount: total,
        shippingAddress: selectedAddress,
        paymentMethod: selectedPaymentMethod
      };
      await placeOrder(orderData);
      toast.success('Order placed successfully!');
      navigate('/orders'); // Navigate to orders page after successful order
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order');
    }
  };

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: '💵' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'upi', name: 'UPI', icon: '📱' },
  ];

  return (
    <div className="user-layout max-w-4xl mx-auto p-4">
      {/* Progress Steps */}
      <div className="flex justify-center space-x-4 mb-8">
        <div className={`px-4 py-2 rounded-md ${step === 1 ? 'bg-black text-white' : 'text-gray-700'}`}>
          Delivery Address
        </div>
        <div className={`px-4 py-2 rounded-md ${step === 2 ? 'bg-black text-white' : 'text-gray-700'}`}>
          Payment
        </div>
      </div>

      {/* Content */}
      <div className="mt-8">
        {step === 1 && (
          <div>
            {!showAllAddresses ? (
              // Show selected address
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Delivery Address</h2>
                  <button
                    onClick={handleChangeAddress}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Change Address
                  </button>
                </div>
                {selectedAddress ? (
                  <div className="border rounded-lg p-4 shadow-sm">
                    <h3 className="font-semibold text-lg">{selectedAddress.fullName}</h3>
                    <p className="text-gray-600 mb-1">{selectedAddress.phone}</p>
                    <p className="text-gray-800">{selectedAddress.address}</p>
                    <p className="text-gray-800">
                      {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
                    </p>
                  </div>
                ) : (
                  <p className="text-red-600">No delivery address available. Please add an address.</p>
                )}
              </div>
            ) : (
              // Show address selection
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Select Delivery Address</h2>
                  <button
                    onClick={() => setShowAllAddresses(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Cancel
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress?._id === address._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      onClick={() => handleAddressSelect(address)}
                    >
                      <h3 className="font-semibold text-lg">{address.fullName}</h3>
                      <p className="text-gray-600 mb-1">{address.phone}</p>
                      <p className="text-gray-800">{address.address}</p>
                      <p className="text-gray-800">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.default && (
                        <span className="inline-block mt-2 text-sm text-blue-600">Default Address</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Payment Options */}
            <div>
              <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="border rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex justify-between text-sm">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>Rs. {item.product.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-3 mt-3">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>Rs. {total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-3">
                      <span>Total</span>
                      <span>Rs. {total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <button
            onClick={handleBack}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
        )}
        {step < 2 && (
          <button
            onClick={handleNext}
            className="ml-auto px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Next
          </button>
        )}
        {step === 2 && (
          <button
            onClick={handlePlaceOrder}
            className="ml-auto px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            disabled={!selectedPaymentMethod}
          >
            Place Order
          </button>
        )}
      </div>
    </div>
  );
};

export default Checkout;