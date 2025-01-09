import { useNavigate } from 'react-router-dom';

const CartProductCard = ({ 
  product, 
  quantity, 
  onQuantityChange, 
  onRemove 
}) => {
  console.log(product.card_image);
  
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className='w-full'>
      <div
        className="rounded-md p-4 text-white flex flex-col relative transition-transform hover:scale-102"
        style={{
          background: `linear-gradient(to right, black, ${product.cardColor || 'black'})`
        }}
      >
        <div className="flex items-center gap-6">
          {/* Product Image */}
          <div className="w-32 h-32 relative" onClick={handleCardClick}>
            <img
              src={product.card_image.url}
              alt={product.name}
              className="w-full h-full object-contain rounded-lg cursor-pointer"
            />
          </div>

          {/* Product Details */}
          <div className="flex-grow">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h2 className="text-xl font-bold cursor-pointer" onClick={handleCardClick}>
                  {product.name}
                </h2>
                <p className="text-sm text-gray-300">Scale: {product.scale}</p>
                <div className="mt-1">
                  <p className="text-lg text-green-400 font-medium">
                    Rs. {product.price.toFixed(2)}
                  </p>
                  {product.maxOffer > 0 && (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-400 line-through">
                        Rs. {product.originalPrice.toFixed(2)}
                      </p>
                      <span className="text-sm text-green-400">
                        -{product.maxOffer}% off
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button 
                onClick={() => onRemove(product._id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-sm">Quantity:</span>
              <div className="flex items-center bg-black/30 rounded-md">
                <button 
                  onClick={() => onQuantityChange(product._id, Math.max(1, quantity - 1))}
                  className="px-3 py-1 hover:bg-black/20 rounded-l-md"
                >
                  -
                </button>
                <span className="px-4 py-1 bg-black/10">{quantity}</span>
                <button 
                  onClick={() => onQuantityChange(product._id, quantity + 1)}
                  className="px-3 py-1 hover:bg-black/20 rounded-r-md"
                >
                  +
                </button>
              </div>
              <p className="ml-auto text-lg font-semibold text-green-400">
                Total: Rs. {(product.price * quantity).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProductCard;
