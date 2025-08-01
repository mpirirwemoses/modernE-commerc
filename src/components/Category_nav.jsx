
import React, { useState, useEffect } from "react";
import { categoriesAPI } from "../services/api";
import { motion } from "framer-motion";

function CategoryNav({ onCategoryClick, activeCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

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
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-md py-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4">
            <div className="animate-pulse bg-gray-200 h-16 w-16 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 h-16 w-16 rounded-lg"></div>
            <div className="animate-pulse bg-gray-200 h-16 w-16 rounded-lg"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-md py-6 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center flex-wrap gap-4">
          {/* Clear All Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button
              className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl shadow-md transition-all duration-300 ${
                activeCategory === null 
                  ? "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg" 
                  : "bg-white text-gray-700 hover:shadow-lg hover:bg-gray-50"
              }`}
              onClick={handleClearAll}
            >
              <motion.div 
                className="w-8 h-8 mb-1 flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </motion.div>
              <span className="text-xs font-medium text-center leading-tight">
                All
              </span>
            </button>
          </motion.div>

          {/* Category Buttons */}
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button
                className={`flex flex-col items-center justify-center w-20 h-20 rounded-xl shadow-md transition-all duration-300 ${
                  activeCategory === category.slug 
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg" 
                    : "bg-white text-gray-700 hover:shadow-lg hover:bg-gray-50"
                }`}
                onClick={() => onCategoryClick(category.slug)}
              >
                <motion.div 
                  className="w-8 h-8 mb-1 relative overflow-hidden rounded-lg"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <img
                    src={category.image || "/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg"}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={e => { 
                      e.target.src = '/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg'; 
                    }}
                  />
                </motion.div>
                <span className="text-xs font-medium text-center leading-tight">
                  {category.name}
                </span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default CategoryNav;