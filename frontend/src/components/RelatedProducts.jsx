import React from 'react';

import ProductCard from './ProductCard';

const RelatedProducts = ({ products, title }) => {
 
  
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full py-6 px-5">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>
      <div 
        className="flex overflow-x-autogap-4 pb-4 hide-scrollbar"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((product) => (
          <div key={product._id} className="flex-shrink-0 w-[23%]">
              <ProductCard
                    _id={product._id}
                    name={product.name}
                    scale={product.scale}
                    price={product.price}
                    card_image={product.card_image?.url}
                    brand={product.brand.name}
                    buttonColor={product.buttonColor}
                    cardColor={product.cardColor}
                  />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
