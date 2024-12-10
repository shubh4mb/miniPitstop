// import React from 'react'

const ProductCard = ({ name, scale, price, card_image, brand, buttonColor, cardColor }) => {
  return (
    <div className={`rounded-lg p-4  text-black w-64 m-4`}  style={{
      background: `linear-gradient(to right, black, ${cardColor || 'black'})`,
      padding: '20px',
      borderRadius: '8px',
      color: '#fff'
    }}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">{name}</h2>
        <i className="fas fa-heart"></i>
      </div>
      <p className="text-sm">{scale}</p>
      <p className="text-lg font-bold">{price}</p>
      <img   src={card_image} alt={name} className="w-full h-32 object-cover my-2" />
      <div className="flex justify-between items-center">
        <span className="text-sm">{brand}</span>
        <button className={`px-4 py-2 rounded ${buttonColor}`}>Add to Cart</button>
      </div>
    </div>
  )
}

export default ProductCard