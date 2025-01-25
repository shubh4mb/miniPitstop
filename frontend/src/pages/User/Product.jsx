import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProduct } from '../../api/admin.api';
import { addToCart , relatedProducts } from '../../api/user.api';
import MagnifyImage from '../../components/MagnifyImage';
import RelatedProducts from '../../components/RelatedProducts';
import ReviewComponent from '../../components/ReviewComponent';
import { FaStar } from 'react-icons/fa';

const Product = () => {
  const { productId } = useParams();
  console.log(productId);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [offer, setOffer] = useState(0);
  const [sameBrand, setSameBrand] = useState([]);
  const [sameScale, setSameScale] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProduct(productId);
        setProduct(response.product);

        // Set the highest offer among product, brand and series
        setOffer(Math.max(response.product.offer, response.product.brand.offer, response.product.series.offer));

        // Set the first image as main image initially
        if (response.product.images && response.product.images.length > 0) {
          setMainImage(response.product.images[0].url);
        }
        const filterTerm = {
      scale: response.product.scale,
      brand: response.product.brand._id,
        }

        console.log(filterTerm);
        
        // Fetch related products from the same brand or series
        const relatedResponse = await relatedProducts(filterTerm);
        console.log(relatedResponse);
        setSameBrand(relatedResponse.filteredSameBrand);
        setSameScale(relatedResponse.filteredSameScale);

        

        setLoading(false);
      } catch (error) {
        toast.error(error.message || 'Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }
  const handleAddToCart = async(_id) => {
    try{
      const response = await addToCart(_id);
      console.log(response);
      toast.success('Product added to cart successfully');
    }catch(error){
      console.error('Error adding to cart:', error);
    }
  };

  const handleImageClick = (imageUrl, index) => {
    setMainImage(imageUrl);
    setSelectedImageIndex(index);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={`${
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        } inline w-5 h-5`}
      />
    ));
  };

  // Calculate discounted price
  const discountedPrice = product.price - (product.price * (offer / 100));

  return (
    <>
    <div className=" mx-auto mt-4 px-4 py-8 user-glass-effect">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Gallery Section */}
        <div className="relative">
            <div className="flex gap-4">
              {/* Thumbnail Images - Vertical Column */}
              <div className="flex flex-col gap-3 w-24">
                {product.images.map((image, index) => (
                  <button
                    key={image.public_id}
                    onClick={() => handleImageClick(image.url, index)}
                    className={`aspect-square w-full overflow-hidden rounded-lg transform transition-all duration-200 hover:scale-105 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-blue-500 shadow-md' 
                        : 'ring-1 ring-gray-200 hover:ring-blue-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Main Image */}
              <div className="flex-1">
                <div className="aspect-square overflow-hidden rounded-xl bg-gray-50 shadow-inner transition-all duration-300 hover:shadow-lg">
                  <MagnifyImage src={mainImage || product.card_image.url} alt={product.name} />
                </div>
              </div>
            </div>
          </div>

        {/* Product Details Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              {renderStars(5)}
              <span className="text-sm text-gray-500">(25 reviews)</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">Scale: {product.scale}</p>
          </div>

          <div className="flex items-baseline space-x-4">
            <p className="text-2xl font-semibold text-gray-900">
              ₹{discountedPrice.toFixed(2)}
            </p>
            

            {offer > 0 && (
              <>
                <p className="text-lg text-gray-500 line-through">
                  ₹{product.price.toFixed(2)}
                </p>
                <p className="text-lg font-semibold text-green-600">
                  {offer}% OFF
                </p>
              </>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Brand</span>
              <span className="font-medium">{product.brand.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Series</span>
              <span className="font-medium">{product.series.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Type</span>
              <span className="font-medium">{product.type}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Stock</span>
              <span className="font-medium">{product.stock} units</span>
            </div>
            <div className="flex items-center justify-between">
              {/* <span className="text-gray-700">Stock</span> */}
              <span className="font-medium ">
                {product.stock === 0 
                  ? 'Out of Stock' 
                  : product.stock < 10 
                    ? 'Few stocks available only' 
                    : 'Available'}
              </span>
            </div>

          </div>

          <button
            style={{ backgroundColor: product.buttonColor }}
            className="w-full py-3 px-8 rounded-full text-white font-semibold hover:opacity-90 transition-opacity"
            onClick={()=>handleAddToCart(product._id)}           
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
      
    </div>
    <div className=" mt-8 mx-auto px-4 py-2 user-glass-effect">
      <ReviewComponent />
    </div>
    <div className="mt-8 mx-auto px-2 py-2 user-glass-effect">
      {sameBrand?.length > 0 && <RelatedProducts title="More from this Brand" products={sameBrand} />}
    </div>
    <div className="mt-8 mx-auto px-2 py-2 user-glass-effect">
      {sameScale?.length > 0 && <RelatedProducts title="Similar Scale Models" products={sameScale} />}
    </div>
  </>
  );
};

export default Product;