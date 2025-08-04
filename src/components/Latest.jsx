import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { shopContext } from "../assets/context/Shopcontext";
import { productsAPI } from "../services/api";
import Item from "./Item";
import { motion, AnimatePresence } from "framer-motion";

const Latest = ({ category: propCategory }) => {
  const { categorySlug } = useParams();
  const { products: contextProducts } = useContext(shopContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Use category from URL params if available, otherwise use prop
  const category = categorySlug || propCategory;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const params = {};
        if (category && category !== 'latest') {
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
  
  // For "latest" category, show the most recent products
  const latestProducts = category === 'latest' 
    ? [...displayProducts].sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id)).slice(0, 9)
    : [...displayProducts].reverse().slice(0, 9);

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

  const getCategoryTitle = () => {
    if (category === 'latest') return "Latest Arrivals";
    if (category) return `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
    return "Latest Arrivals";
  };

  const getCategoryDescription = () => {
    if (category === 'latest') return "Discover the newest additions to our collection, featuring the latest trends and innovations.";
    if (category) return `Explore our curated selection of ${category} products, designed to meet your needs.`;
    return "Explore the newest additions to our store, handpicked just for you.";
  };

  return (
    <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-16">
      {/* Modern Banner */}
      <motion.div 
        className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-20 px-8 rounded-3xl shadow-2xl max-w-7xl mx-auto mb-16 overflow-hidden"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-20" />
        
        <div className="relative z-10 text-center">
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          
          <motion.h2 
            className="text-5xl md:text-6xl font-black mb-6 drop-shadow-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {getCategoryTitle()}
          </motion.h2>
          
          <motion.p 
            className="text-xl md:text-2xl max-w-3xl mx-auto text-white/90 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {getCategoryDescription()}
          </motion.p>
          
          <motion.div
            className="flex justify-center mt-8 space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <div className="flex items-center text-white/80">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Premium Quality</span>
            </div>
            <div className="flex items-center text-white/80">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Secure Shopping</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <motion.div 
            className="flex justify-center items-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="relative">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-32 w-32 border-t-2 border-red-500" style={{ animationDelay: '-0.5s' }}></div>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={category || 'all'}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {latestProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  custom={index}
                  layout
                >
                  <Item item={item} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
        
        {/* Empty State */}
        {!loading && latestProducts.length === 0 && (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {category === 'latest' 
                ? "We're working on adding new products. Check back soon!"
                : `No products found in the ${category} category.`
              }
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Latest;
