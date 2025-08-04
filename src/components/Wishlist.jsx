import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { shopContext } from '../assets/context/Shopcontext';
import { FaHeart, FaTrash, FaShoppingCart, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Wishlist = () => {
  const { user, wishlist, removeFromWishlist, addToCart } = useContext(shopContext);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleRemoveFromWishlist = async (wishlistItemId) => {
    try {
      await removeFromWishlist(wishlistItemId);
      setSuccess('Item removed from wishlist');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleMoveToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      // Dispatch cart update event for immediate UI update
      window.dispatchEvent(new Event('cartUpdated'));
      setSuccess('Item moved to cart');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error moving to cart:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your wishlist</h2>
          <p className="text-gray-600">You need to be logged in to see your saved items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FaHeart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Recommendations</h1>
                  <p className="text-gray-600">Your saved items and personalized recommendations</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{wishlist.length}</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {success && (
            <motion.div
              className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {success}
            </motion.div>
          )}

          {/* Wishlist Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Saved Items</h2>
            
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <FaHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
                <p className="text-gray-600 mb-6">Start adding items to your wishlist to see them here</p>
                <Link
                  to="/latest"
                  className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item, index) => (
                  <motion.div
                    key={item.id || index}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="aspect-w-1 aspect-h-1 bg-gray-200">
                      <img
                        src={item.product?.images?.[0]?.url || 'https://via.placeholder.com/300x300'}
                        alt={item.product?.name || 'Product'}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {item.product?.name || 'Product Name'}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-lg font-bold text-orange-600">
                          ${item.product?.newPrice || '0.00'}
                        </span>
                        {item.product?.oldPrice && (
                          <span className="text-sm text-gray-500 line-through">
                            ${item.product.oldPrice}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleMoveToCart(item.product?.id || item.productId)}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaShoppingCart className="w-4 h-4 mr-2" />
                          Add to Cart
                        </motion.button>
                        
                        <Link
                          to={`/pd/${item.product?.id || item.productId}`}
                          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                        >
                          <FaEye className="w-4 h-4" />
                        </Link>
                        
                        <motion.button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-600 text-sm rounded-md hover:bg-red-200"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <FaTrash className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recommendations Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Recommended for You</h2>
            <div className="text-center py-8">
              <FaHeart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Personalized recommendations</h3>
              <p className="text-gray-600">Based on your browsing history and preferences</p>
              <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Wishlist; 