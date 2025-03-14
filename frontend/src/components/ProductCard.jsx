// import React from 'react'
import { useNavigate } from 'react-router-dom';
import { addToCart, addToWishlist } from '../api/user.api';
import { toast } from 'react-toastify';
import { useState } from 'react';
import { FaHeart, FaRegHeart } from "react-icons/fa";

const ProductCard = ({ _id, name, scale, price, card_image, brand, buttonColor, cardColor, isInWishlist, isInCart }) => {
  const [isWishlisted, setIsWishlisted] = useState(isInWishlist || false);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${_id}`);
  };

  const handleAddToCart = async(e, _id) => {
    e.stopPropagation(); // This prevents the click from bubbling up to the parent div
    try {
      const response = await addToCart(_id);
     
      toast.success('Product added to cart successfully');
    } catch(error) {
      //('Error adding to cart:', error);
      toast.error(error.message);
    }
  };

  const handleWishlist = async (e) => {
    e.stopPropagation(); // Prevent card click
    try {
     const response = await addToWishlist(_id);
      setIsWishlisted(!isWishlisted);
   toast.success(response.message)
    } catch (error) {
      //('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <div className=' w-40 sm:w-56 md:w-56 pt-8 '>
      <div
        className="rounded-md p-4 w-[80%] md:w-[90%] h-[185px] md:h-[250px] text-white flex flex-col relative transition-transform transform hover:scale-105"
        style={{
          background: `linear-gradient(to right, black, ${cardColor || 'black'})` }}
        onClick={handleCardClick}
      >
        {/* Title and Favorite Icon */}
        <div className="flex justify-between items-center mb-2">
          <h2 className=" text-xs md:text-lg font-bold ">{name}</h2>
          <button
            onClick={handleWishlist}
            className="hover:scale-110 transition-transform"
          >
            {isInWishlist ? (
              <FaHeart className="w-4 md:w-6 h-4 md:h-6 text-red-500" />
            ) : (
              isWishlisted ? (
                <FaHeart className="w-4 md:w-6 h-4 md:h-6 text-red-500" />
              ) : (
                <FaRegHeart className="w-4 md:w-6 md:h-6 h-4 text-gray-500 hover:text-red-500" />
              )
            )}
          </button>
        </div>

        {/* Scale and Price */}
        <div className="flex flex-col mb-2">
          <p className="text-sm"> scale:{scale}</p>
          <p className="text-lg text-green-500"> Rs. {price}</p>
        </div>

        {/* Product Image */}
        <img
          src={card_image}
          alt={name}
          className="w-full h-28 md:h-36 object-contain rounded-lg mb-2 absolute top-16 md:top-24  left-16 md:left-20 right-0 z-0"
        />

        {/* Brand and Add to Cart */}
        <div className="flex justify-between items-center absolute bottom-4 right-3 left-3">
          <span className="text-xs">{brand}</span>
          <button
            className={`px-4 py-2 rounded-lg text-xs font-semibold hover:shadow-lg transition-all ${buttonColor || 'bg-blue-500'}`}
            style={{ background: buttonColor || 'blue' }}
            onClick={isInCart ? (e) =>{e.stopPropagation(); navigate('/profile/cart')} : (e) => handleAddToCart(e, _id)}
          >
           {isInCart ? "Go to Cart" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;