import React, { useContext, useState, useEffect, useRef } from "react";
import { shopContext } from "../assets/context/Shopcontext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaSignOutAlt, FaBox, FaCog, FaHeart, FaWallet, FaHome, FaSignInAlt, FaUserPlus } from 'react-icons/fa';

const Header = () => {
  const { totalItems, user, localCartCount, handleLogout, updateLocalCartCount } = useContext(shopContext);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const userMenuRef = useRef(null);
  
  // Initialize cart count on mount
  useEffect(() => {
    if (!user) {
      const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
      const count = tempCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      console.log('Initial cart count setup:', { tempCart, count });
      setCartCount(count);
    } else {
      setCartCount(totalItems);
    }
  }, [user, totalItems]);
  
  // Update cart count when context values change
  useEffect(() => {
    const newCartCount = user ? totalItems : localCartCount;
    console.log('Cart count updated:', { user, totalItems, localCartCount, newCartCount });
    setCartCount(newCartCount);
  }, [user, totalItems, localCartCount]);

  // Listen for cart update events and update immediately
  useEffect(() => {
    const handleCartUpdate = () => {
      if (!user) {
        // For guest users, immediately update the cart count from localStorage
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const count = tempCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        console.log('Cart update event - guest user:', { tempCart, count });
        setCartCount(count);
      } else {
        // For logged-in users, the context will handle the update
        console.log('Cart update event - logged in user:', { totalItems });
        setCartCount(totalItems);
      }
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user, totalItems]);

  // Also listen for storage changes (for cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'tempCart' && !user) {
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const count = tempCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
        setCartCount(count);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user]);

  const profileImage = "https://via.placeholder.com/150"; // Replace with actual profile image URL

  const handleLogoutClick = () => {
    handleLogout();
    setShowUserMenu(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-orange-400 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Left Section: Menu Icon */}
        <div className="flex items-center space-x-4">
          <motion.button 
            className="p-2 rounded-md hover:bg-gray-200 focus:ring focus:ring-gray-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-6 h-6 text-gray-700"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </motion.button>

          {/* Search Bar */}
          <div className="relative flex-1">
            <div className="flex flex-row">
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 border rounded-l-md focus:outline-none focus:ring focus:ring-blue-300"
              />
              <motion.button
                className="bg-black m--5 text-white ml-[-5 px] px-4 py-2 z-4 rounded-r-md hover:bg-red-300 focus:ring focus:ring-blue-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Search
              </motion.button>
            </div>
            <div className="absolute left-3 top-2 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 7.65a7.5 7.5 0 010 10.6z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Right Section: Cart & Profile */}
        <div className="flex items-center space-x-8">
          {/* Cart Icon with Counter */}
          <Link to="/cart">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <button className="p-2 rounded-md hover:bg-gray-200 focus:ring focus:ring-gray-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6 text-gray-700"
                >
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a1 1 0 0 0 1 .61h9.72a1 1 0 0 0 1-.76l3.38-12.33H5.22" />
                </svg>
              </button>
              
              {/* Cart Counter Badge */}
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span 
                    className="absolute -top-2 -right-4 bg-red-500 text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    key={cartCount}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-200 focus:ring focus:ring-gray-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {user ? (
                <>
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-white"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    {user.firstName}
                  </span>
                </>
              ) : (
                <>
                  <FaHome className="w-6 h-6 text-gray-700" />
                  <span className="text-sm font-medium text-gray-700 hidden md:block">
                    Account
                  </span>
                </>
              )}
              <svg
                className={`w-4 h-4 text-gray-700 transition-transform ${showUserMenu ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            {/* User Dropdown Menu */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  {user ? (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUser className="w-4 h-4 mr-3" />
                        Profile
                      </Link>
                      
                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaBox className="w-4 h-4 mr-3" />
                        My Orders
                      </Link>
                      
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaHeart className="w-4 h-4 mr-3" />
                        My Recommendations
                      </Link>
                      
                      <Link
                        to="/wallet"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaWallet className="w-4 h-4 mr-3" />
                        My Wallet
                      </Link>
                      
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaCog className="w-4 h-4 mr-3" />
                        Settings
                      </Link>
                      
                      <div className="border-t border-gray-100">
                        <button
                          onClick={handleLogoutClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaSignOutAlt className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">Welcome Guest</p>
                        <p className="text-xs text-gray-500">Sign in to access your account</p>
                      </div>
                      
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaSignInAlt className="w-4 h-4 mr-3" />
                        Sign In
                      </Link>
                      
                      <Link
                        to="/login"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FaUserPlus className="w-4 h-4 mr-3" />
                        Sign Up
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
