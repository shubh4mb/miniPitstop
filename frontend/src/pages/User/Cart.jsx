import { useEffect, useState } from 'react';
import { getCart, updateCartItemQuantity, removeFromCart } from '../../api/user.api';
import { toast } from 'react-toastify';
import CartProductCard from '../../components/CartProductCard';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

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

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout', { state: { cartItems, total: calculateTotal() } });
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
              {cartItems.map((item) => (
                <CartProductCard
                  key={item.product._id}
                  product={item.product}
                  quantity={item.quantity}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rs. {calculateTotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>Rs. {calculateTotal()}</span>
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