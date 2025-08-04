import { useContext, useState } from "react";
import { shopContext } from "../assets/context/Shopcontext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Item = ({ item }) => {
  const { addToCart, user } = useContext(shopContext);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      console.log('Adding to cart:', item.id, item.name); // Debug log
      await addToCart(item.id, 1);
      console.log('Successfully added to cart'); // Debug log
      
      // For guest users, immediately update localStorage and dispatch event
      if (!user) {
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const existingItem = tempCart.find(cartItem => cartItem.productId === item.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          tempCart.push({ productId: item.id, quantity: 1 });
        }
        
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
      }
      
      // Dispatch cart update event for immediate UI update
      window.dispatchEvent(new Event('cartUpdated'));
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  const calculateDiscount = () => {
    if (item.oldPrice && item.newPrice && Number(item.oldPrice) > 0) {
      return parseInt(((Number(item.oldPrice) - Number(item.newPrice)) / Number(item.oldPrice)) * 100);
    }
    return 0;
  };

  const renderStars = (rating = 4.2) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
          <defs>
            <linearGradient id="halfStar">
              <stop offset="50%" stopColor="#fbbf24"/>
              <stop offset="50%" stopColor="#e5e7eb"/>
            </linearGradient>
          </defs>
          <path fill="url(#halfStar)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <motion.div 
      className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-orange-300"
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Discount Badge */}
      {calculateDiscount() > 0 && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{calculateDiscount()}%
          </span>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={toggleWishlist}
        className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-200 group-hover:scale-110"
      >
        <svg 
          className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'}`} 
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      {/* Image Container */}
      <div className="relative overflow-hidden">
        <Link to={`/pd/${item.id}`} className="block">
          <img
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
            src={item.image || '/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg'}
            alt={item.name}
            onError={e => { e.target.src = '/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg'; }}
          />
        </Link>
      </div>
        
       

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
          {typeof item.category === 'object' ? item.category.name : item.category}
        </p>

        {/* Product Name */}
        <Link to={`/pd/${item.id}`} className="block">
          <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-orange-600 transition-colors duration-200">
            {item.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-2">
          <div className="flex items-center mr-2">
            {renderStars()}
          </div>
          <span className="text-xs text-gray-500">(1,234)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg font-bold text-gray-900">
            ${Number(item.newPrice).toFixed(2)}
          </span>
          {item.oldPrice && Number(item.oldPrice) > Number(item.newPrice) && (
            <span className="text-sm text-gray-500 line-through">
              ${Number(item.oldPrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Shipping Info */}
        <div className="flex items-center text-xs text-gray-600 mb-3">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
          </svg>
          Free shipping
        </div>

        {/* Add to Cart Button */}
        <motion.button
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isAddingToCart 
              ? 'bg-green-500 text-white' 
              : 'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-lg hover:shadow-xl'
          }`}
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Added!
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              Add to Cart
            </div>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Item;
