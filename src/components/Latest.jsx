import { useContext, useState, useEffect } from "react";
import { shopContext } from "../assets/context/ShopContext";
import { productsAPI } from "../services/api";
import Item from "./Item";
import { motion } from "framer-motion";

const Latest = ({ category }) => {
  const { products: contextProducts } = useContext(shopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {};
        if (category) {
          params.category = category;
        }
        const response = await productsAPI.getAll(params);
        
        if (response?.data?.data?.products) {
          setFilteredProducts(response.data.data.products);
        } else if (response?.data?.products) {
          setFilteredProducts(response.data.products);
        } else if (Array.isArray(response?.data)) {
          // Handle case where API returns array directly
          setFilteredProducts(response.data);
        } else {
          console.warn('Unexpected API response structure:', response);
          setFilteredProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to context products if API fails
        setFilteredProducts(contextProducts);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [category, contextProducts]);

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : contextProducts;
  const latestProducts = [...displayProducts].reverse().slice(0, 9);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className="bg-gray-50 py-12">
      {/* Banner */}
      <motion.div 
        className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white py-16 px-6 rounded-xl shadow-xl max-w-7xl mx-auto mb-12 overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="relative z-10 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-extrabold mb-4 animate-pulse drop-shadow-lg"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {category ? `🆕 ${category} Products` : "🆕 Latest Arrivals"}
          </motion.h2>
          <motion.p 
            className="text-lg md:text-xl max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {category 
              ? `Explore the newest ${category} products, handpicked just for you.`
              : "Explore the newest additions to our store, handpicked just for you."
            }
          </motion.p>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
          </motion.div>
        ) : (
          <motion.div 
            className="grid sm:grid-cols-1 md:grid-cols-3 gap-6 justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {latestProducts.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                custom={index}
              >
                <Item item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Latest;
