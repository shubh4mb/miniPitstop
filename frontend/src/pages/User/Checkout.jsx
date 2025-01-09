import { useState, useEffect } from 'react';
import { getAddresses, placeOrder, createRazorpayOrder, verifyRazorpayPayment } from '../../api/user.api';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Address from './Address';

const Checkout = () => {

  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [razorpayOrder, setRazorpayOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const cartItems = location.state?.cartItems || [];
  const total = location.state?.total || 0;
  const appliedCoupon = location.state?.coupon || null;

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = calculateTotal();
    if (subtotal < appliedCoupon.minAmount) {
      return 0;
    }

    let discount = 0;
    if (appliedCoupon.discountType === 'percentage') {
      discount = (subtotal * appliedCoupon.discount) / 100;
    } else {
      discount = appliedCoupon.discount;
    }

    // Apply maximum redemption amount limit
    if (appliedCoupon.maxRedemableAmount && discount > appliedCoupon.maxRedemableAmount) {
      discount = appliedCoupon.maxRedemableAmount;
    }

    return discount;
  };

  const calculateTotalWithoutOffer = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.originalPrice || item.product.price) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const maxOffer = Math.max(
        item.product.offer || 0,
        item.product.brand?.offer || 0,
        item.product.series?.offer || 0
      );
      const priceAfterOffer = item.product.price - (item.product.price * maxOffer) / 100;
      return total + (priceAfterOffer * item.quantity);
    }, 0);
  };

  const getFinalTotal = () => {
    const subtotal = calculateTotal();
    const couponDiscount = calculateDiscount();
    return subtotal - couponDiscount;
  };

  useEffect(() => {
    if (!location.state?.cartItems) {
      toast.error('No cart items found');
      navigate('/cart');
      return;
    }
    fetchAddresses();
  }, [location.state, navigate]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.addresses);
      const defaultAddress = response.addresses.find(addr => addr.default);
      if (defaultAddress) {
        setSelectedAddress(defaultAddress);
      } else if (response.addresses.length > 0) {
        setSelectedAddress(response.addresses[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch addresses');
      console.error(error);
    }
  };

  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
  };

  const handleAddressFormSuccess = () => {
    setShowAddressForm(false);
    fetchAddresses();
    toast.success('Address added successfully');
  };

  const handleAddressFormCancel = () => {
    setShowAddressForm(false);
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

  const handleRazorpayPayment = async () => {
    try {
      const orderData = {
        items: cartItems,
        totalAmount: getFinalTotal(),
        shippingAddress: selectedAddress,
        appliedCoupon: appliedCoupon?._id
      };

      const { success, order, orderDetails } = await createRazorpayOrder(orderData);

      if (!success) {
        toast.error('Error creating payment order');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'MiniPitstop',
        description: 'Payment for your order',
        order_id: order.id,
        handler: async function (response) {
          try {
            console.log('Razorpay response:', response);
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                items: cartItems,
                totalAmount: getFinalTotal(),
                shippingAddress: selectedAddress,
                appliedCoupon: appliedCoupon?._id,
                subTotalBeforeOffer: calculateTotalWithoutOffer(),
                subTotalAfterOffer: calculateTotal(),
                couponDiscount: calculateDiscount()
              }
            };
            console.log('Payment verification data:', verifyData);

            const verificationResult = await verifyRazorpayPayment(verifyData);

            if (verificationResult.success) {
              toast.success('Payment successful and order placed!');
              navigate('/orders');
            } else {
              toast.error(verificationResult.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error(error.response?.data?.message || 'Error verifying payment');
          }
        },
        prefill: {
          name: selectedAddress.fullName,
          contact: selectedAddress.phone
        },
        theme: {
          color: '#000000'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error('Error initiating payment');
    }
  };

  const handlePlaceOrder = async (paymentMethod) => {
    try {
      const orderData = {
        items: cartItems,
        totalAmount: getFinalTotal(),
        shippingAddress: selectedAddress,
        paymentMethod,
        appliedCoupon: appliedCoupon?._id
      };

      const data = await placeOrder(orderData);
      if (data.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('Error placing order');
    }
  };

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
  };

  const paymentMethods = [
    { id: 'cod', name: 'Cash on Delivery', icon: '' },
    { id: 'razorpay', name: 'Pay with Razorpay', icon: '' },
  ];

  const renderStep1 = () => {
    if (showAddressForm) {
      return (
        <div className="max-w-2xl mx-auto">
          <Address
            onSuccess={handleAddressFormSuccess}
            onCancel={handleAddressFormCancel}
          />
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Select Delivery Address</h2>
        <div className="space-y-4">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedAddress?._id === address._id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAddressSelect(address)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{address.fullName}</h3>
                  <p className="text-gray-600 mt-1">{address.address}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-gray-600">Phone: {address.phone}</p>
                </div>
                <div className="mt-2">
                  <input
                    type="radio"
                    checked={selectedAddress?._id === address._id}
                    onChange={() => handleAddressSelect(address)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddNewAddress}
            className="w-full py-3 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Address
          </button>
        </div>
      </div>
    );
  };

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
          renderStep1()
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
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Price</span>
                    <span>₹{calculateTotalWithoutOffer().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Product Discount</span>
                    <span>- ₹{(calculateTotalWithoutOffer() - calculateTotal()).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({appliedCoupon.code})</span>
                      <span>- ₹{calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total Amount</span>
                      <span>₹{getFinalTotal().toFixed(2)}</span>
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
            onClick={() => {
              if (selectedPaymentMethod === 'razorpay') {
                handleRazorpayPayment();
              } else {
                handlePlaceOrder(selectedPaymentMethod);
              }
            }}
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