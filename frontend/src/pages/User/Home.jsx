import { useEffect , useState } from 'react';
import Banner from '../../components/user/banner/Banner';
import { getAllProducts , getBrands} from '../../api/admin.api';
import ProductCard from '../../components/ProductCard';
import { toast } from 'react-toastify';

const Home = () => {
  const bannerImages = [
    "/andrew-tate-supercars-1-1024x585.webp",
    "/supercars-photo_551707-22082.avif",  // Add your image paths here

  ];

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  
  
  useEffect( () => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts()
        setProducts(response.products)
        console.log(response.products);

        
        
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error(error.message || 'Failed to load products');
      }
    };
    const fetchBrands = async () => {
      try {
        const response = await getBrands();
        setBrands(response.brands);
      } catch (error) {
        console.error('Error fetching brands:', error);
        toast.error(error.message || 'Failed to load brands');
      }
    };
    fetchProducts();
    fetchBrands();
  }, [])





  return (<>
    <div className="mt-4 mx-6">
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

    <div className='mx-6 mt-12'>
      <h1 className='text-2xl font-bold'>Products</h1>
    </div>

    <div className='mx-6 mt-4 flex justify-evenly '>
      {products.map((product) => (
        <ProductCard
          key={product._id}
          _id={product._id}
          name={product.name}
          scale={product.scale}
          price={product.price}
          card_image={product.card_image?.url}
          brand={brands.find(b => b._id === product.brand)?.name}
          buttonColor={product.buttonColor}
          cardColor={product.cardColor}
        />
      ))}
    </div>
    </>
  );
};

export default Home;