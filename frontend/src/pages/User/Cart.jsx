import { useEffect, useState } from 'react';
import { getCart, updateCartItemQuantity, removeFromCart , fetchAllAvailableCoupons} from '../../api/user.api';
import { toast } from 'react-toastify';
import CartProductCard from '../../components/CartProductCard';
import CouponCard from '../../components/CouponCard';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
    fetchCoupons();
    
    // TODO: Fetch available coupons from backend
    // setAvailableCoupons([
    //   {
    //     id: 1,
    //     code: 'WELCOME10',
    //     description: 'Get 10% off on your first order',
    //     discount: 10,
    //     type: 'percentage',
    //     minPurchase: 1000
    //   },
    //   {
    //     id: 2,
    //     code: 'FLAT500',
    //     description: 'Get flat Rs. 500 off on orders above Rs. 5000',
    //     discount: 500,
    //     type: 'fixed',
    //     minPurchase: 5000
    //   }
    // ]);
  }, []);

  const fetchCoupons = async () => {
    try {
      console.log('fetching coupons');
      const response = await fetchAllAvailableCoupons();
      setAvailableCoupons(response.coupons);
      console.log(response.coupons);
      
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(error.message);
    }
  };
  const fetchCartItems = async () => {
    try {
      const response = await getCart();
      console.log(response.cart.item);
      setCartItems(response.cart.item);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message);
      setLoading(false);
    }
  };

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      const response = await updateCartItemQuantity(itemId, newQuantity);
      fetchCartItems();
      toast.success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.message);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await removeFromCart(itemId);
      fetchCartItems();
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    }
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

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = calculateTotal();
    if (subtotal < appliedCoupon.minAmount) {
        setAppliedCoupon(null);
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
  const handleApplyCoupon = (coupon) => {
    const subtotal = calculateTotal();
    if (subtotal < coupon.minAmount) {  
        toast.error(`Minimum purchase amount of Rs. ${coupon.minAmount} required`);
        return;
    }
    setAppliedCoupon(coupon);
    setShowCoupons(false);
    toast.success('Coupon applied successfully!');
};

  const finalTotal = () => {
    return calculateTotal() - calculateDiscount();
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout', { state: { cartItems, total: finalTotal() , coupon: appliedCoupon } });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <h2 className="text-xl text-gray-600">Your cart is empty</h2>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const maxOffer = Math.max(
                  item.product.offer || 0,
                  item.product.brand?.offer || 0,
                  item.product.series?.offer || 0
                );
                const priceAfterOffer = item.product.price - (item.product.price * maxOffer) / 100;
                return (
                  <CartProductCard
                    key={item.product._id}
                    product={{
                      ...item.product,
                      price: priceAfterOffer,
                      originalPrice: item.product.price,
                      maxOffer: maxOffer
                    }}
                    quantity={item.quantity}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                );
              })}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              {/* Coupon Section */}
              <div className="mb-4">
                <button
                  onClick={() => setShowCoupons(!showCoupons)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center"
                >
                  {showCoupons ? '- Hide Coupons' : '+ Show Available Coupons'}
                </button>
                
                {showCoupons && (
                  <div className="mt-2 space-y-2">
                    {availableCoupons.map((coupon) => (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        onApply={handleApplyCoupon}
                        isApplied={appliedCoupon?._id === coupon._id}
                      />
                    ))}
                  </div>
                )}

                {appliedCoupon && !showCoupons && (
                  <div className="mt-2 text-sm text-gray-600">
                    Applied: {appliedCoupon.code}
                    <button
                      onClick={() => setAppliedCoupon(null)}
                      className="ml-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Price</span>
                  <span>Rs. {calculateTotalWithoutOffer().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Product Discount</span>
                  <span>- Rs. {(calculateTotalWithoutOffer() - calculateTotal()).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Subtotal</span>
                  <span>Rs. {calculateTotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon Discount</span>
                    <span>- Rs. {calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rs. {finalTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <button 
                className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
                onClick={handleProceedToCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;