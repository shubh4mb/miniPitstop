import { useEffect , useState } from 'react';
import Banner from '../../components/user/banner/Banner';
import { getFeaturedProducts ,getCart} from '../../api/user.api';
import ProductCard from '../../components/ProductCard';
import { toast } from 'react-toastify';
import {isAuth} from '../../utils/auth.utils';

const Home = () => {
  const bannerImages = [
    "/andrew-tate-supercars-1-1024x585.webp",
    "/supercars-photo_551707-22082.avif",  // Add your image paths here

  ];

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState([]);
  
  useEffect( () => {
    
    const fetchCart = async () => {
      try {
      const res = await isAuth()
      console.log("hiii",res);
      
      if(res){
        
        const response = await getCart()
        console.log(response.cart);
        setCart(response.cart)
      } else {
        setCart([])
      }
      
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error(error.message || 'Failed to load cart');
      }
    }
    const fetchProducts = async () => {
      try {
        const response = await getFeaturedProducts()
        setProducts(response.products)
        // console.log(response.products);

        
        
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(error.message || 'Failed to load products');
      }
    };
    // const fetchBrands = async () => {
    //   try {
    //     const response = await getBrands();
    //     setBrands(response.brands);
    //   } catch (error) {
    //     console.error('Error fetching brands:', error);
    //     toast.error(error.message || 'Failed to load brands');
    //   }
    // };
    fetchProducts();
    fetchCart();
    // fetchBrands();
  }, [])





  return (<>
    <div className="mt-4">
      <Banner 
        title="miniPitstop"
        description="Your one-stop destination for all scale models cars . We offer a wide range of services to meet your needs."
        backgroundImages={bannerImages}
        primaryButtonText="Explore"
        primaryButtonLink="#services"
        secondaryButtonText="Contact Us"
        secondaryButtonLink="#contact"
      />
    </div>

    <div className=' mt-12'>
      <h1 className='text-2xl font-bold'>Products</h1>
    </div>

  
    <div className="mt-4 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 justify-items-center">
  {products.map((product) => {
   const isInCart = cart?.item?.some((cartItem) => cartItem.product._id === product._id);
    console.log(isInCart);// Check if product is in the cart

    return (
      <ProductCard
        key={product._id}
        _id={product._id}
        name={product.name}
        scale={product.scale}
        price={product.price}
        card_image={product.card_image?.url}
        brand={product.brand.name}
        buttonColor={product.buttonColor}
        cardColor={product.cardColor}
       isInCart={isInCart}
      />
    );
  })}
</div>
 
    </>
  );
};

export default Home;