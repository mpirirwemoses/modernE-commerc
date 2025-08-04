
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { categoriesAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";

function CategoryNav({ onCategoryClick, activeCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const res = await categoriesAPI.getAll();
        if (res.data && res.data.data) {
          setCategories(res.data.data);
        }
      } catch (err) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handleClearAll = () => {
    onCategoryClick(null);
    navigate('/categories');
  };

  const handleLatestClick = () => {
    onCategoryClick('latest');
    navigate('/latest');
  };

  const handleCategoryClick = (categorySlug) => {
    onCategoryClick(categorySlug);
    navigate(`/category/${categorySlug}`);
  };

  if (loading) {
    return (
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 py-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4 overflow-x-auto pb-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 w-20 rounded-xl flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200 py-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center flex-wrap gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Latest Category Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                activeCategory === 'latest' 
                  ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl ring-2 ring-orange-300" 
                  : "bg-white text-gray-700 hover:shadow-xl hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={handleLatestClick}
            >
              <motion.div 
                className="w-10 h-10 mb-2 flex items-center justify-center relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {activeCategory === 'latest' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
              <span className="text-xs font-semibold text-center leading-tight">
                Latest
              </span>
              {activeCategory === 'latest' && (
                <motion.div
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          </motion.div>

          {/* All Categories Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                activeCategory === null 
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl ring-2 ring-green-300" 
                  : "bg-white text-gray-700 hover:shadow-xl hover:bg-gray-50 border border-gray-200"
              }`}
              onClick={handleClearAll}
            >
              <motion.div 
                className="w-10 h-10 mb-2 flex items-center justify-center relative"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {activeCategory === null && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
              <span className="text-xs font-semibold text-center leading-tight">
                All
              </span>
              {activeCategory === null && (
                <motion.div
                  className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </button>
          </motion.div>

          {/* Category Buttons */}
          <AnimatePresence>
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: (index + 2) * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <button
                  className={`group relative flex flex-col items-center justify-center w-24 h-24 rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
                    activeCategory === category.slug 
                      ? "bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-xl ring-2 ring-orange-300" 
                      : "bg-white text-gray-700 hover:shadow-xl hover:bg-orange-50 border border-orange-200 hover:border-orange-300"
                  }`}
                  onClick={() => handleCategoryClick(category.slug)}
                >
                  <motion.div 
                    className="w-12 h-12 mb-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 p-1 shadow-inner"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-full h-full rounded-xl overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100">
                      <img
                        src={category.image || "/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg"}
                        alt={category.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={e => { 
                          e.target.src = '/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg'; 
                        }}
                      />
                    </div>
                    {activeCategory === category.slug && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-orange-400/30 to-red-400/30 rounded-xl"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                  <span className="text-xs font-semibold text-center leading-tight px-1">
                    {category.name}
                  </span>
                  {activeCategory === category.slug && (
                    <motion.div
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

export default CategoryNav;