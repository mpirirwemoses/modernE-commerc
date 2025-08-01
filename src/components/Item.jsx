import { useContext, useState } from "react";
import { shopContext } from "../assets/context/ShopContext";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Item = ({ item }) => {
  const { addToCart } = useContext(shopContext);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isAddingToCart) return;
    
    setIsAddingToCart(true);
    try {
      await addToCart(item.id, 1);
      // Show success feedback
      setTimeout(() => setIsAddingToCart(false), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center bg-white shadow-md rounded-md p-4 hover:shadow-lg transition-shadow"
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/pd/${item.id}`} className="w-full">
        <img
          className="rounded-md w-full h-64 object-cover"
          src={item.image || '/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg'}
          alt={item.name}
          onError={e => { e.target.src = '/src/assets/images/StockCake-Assorted eyeglasses display_1725943602.jpg'; }}
        />
      </Link>
      <div className="mt-4 text-center">
        <p className="text-lg font-bold text-gray-800">{item.name}</p>
        <p className="text-sm text-gray-500">
          {typeof item.category === 'object' ? item.category.name : item.category}
        </p>
        <p className="text-md font-semibold text-green-600">
          {item.newPrice ? `$${Number(item.newPrice).toFixed(2)}` : 'N/A'}
        </p>
        <p className="text-sm text-gray-400 line-through">
          {item.oldPrice ? `$${Number(item.oldPrice).toFixed(2)}` : ''}
        </p>
        <p className="text-sm text-red-500">
          {item.oldPrice && item.newPrice && Number(item.oldPrice) > 0
            ? `${parseInt(((Number(item.oldPrice) - Number(item.newPrice)) / Number(item.oldPrice)) * 100)}% OFF`
            : ''}
        </p>
      </div>
      <motion.button
        className={`mt-4 px-6 py-2 rounded-md font-medium transition-colors duration-200 ${
          isAddingToCart 
            ? 'bg-green-500 text-white' 
            : 'bg-yellow-400 text-white hover:bg-yellow-500'
        }`}
        onClick={handleAddToCart}
        disabled={isAddingToCart}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isAddingToCart ? 'Added!' : 'Add to Cart'}
      </motion.button>
    </motion.div>
  );
};

export default Item;
