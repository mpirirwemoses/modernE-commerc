import { createContext, useEffect, useState } from "react";
import { authAPI, productsAPI, cartAPI, wishlistAPI } from "../../services/api";

export const shopContext = createContext(null);

const ShopcontextProvider = (props) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localCartCount, setLocalCartCount] = useState(0);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      fetchUserData();
    } else {
      setLoading(false);
      // For guest users, check localStorage cart
      updateLocalCartCount();
    }
  }, []);

  // Listen for localStorage changes (for guest users)
  useEffect(() => {
    const handleStorageChange = () => {
      if (!user) {
        updateLocalCartCount();
      }
    };

    // Listen for storage events (from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom cart update events
    const handleCartUpdate = () => {
      if (!user) {
        updateLocalCartCount();
      }
    };
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [user]);

  // Update local cart count for guest users
  const updateLocalCartCount = () => {
    if (!user) {
      const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
      const count = tempCart.reduce((acc, item) => acc + (item.quantity || 1), 0);
      setLocalCartCount(count);
    }
  };

  // Dispatch cart update event
  const dispatchCartUpdate = () => {
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // Fetch user data when logged in
  const fetchUserData = async () => {
    try {
      const [profileRes, cartRes, wishlistRes] = await Promise.all([
        authAPI.getProfile(),
        cartAPI.getCart(),
        wishlistAPI.getWishlist()
      ]);

      setUser(profileRes.data.data);
      setCart(cartRes.data.data.items || []);
      setWishlist(wishlistRes.data.data || []);
    } catch (error) {
      console.error('Error fetching user data:', error);
      if (error.response?.status === 401) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      if (response?.data?.data?.products) {
        setProducts(response.data.data.products);
      } else if (response?.data?.products) {
        setProducts(response.data.products);
        console.log(response.data.products);
      } else if (Array.isArray(response?.data)) {
        // Handle case where API returns array directly
        setProducts(response.data);
      } else {
        console.warn('Unexpected API response structure:', response);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setProducts([]);
    }
  };

  // Authentication functions
  const handleLogin = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      // Fetch user data after login
      await fetchUserData();
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const handleRegister = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, token } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed' 
      };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]);
    setWishlist([]);
    updateLocalCartCount(); // Update local cart count after logout
  };

  // Cart functions
  const addToCart = async (productId, quantity = 1, variantId = null) => {
    try {
      if (!user) {
        // If not logged in, add to localStorage for later sync
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const existingItem = tempCart.find(item => item.productId === productId);
        
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          tempCart.push({ productId, quantity, variantId });
        }
        
        localStorage.setItem('tempCart', JSON.stringify(tempCart));
        updateLocalCartCount(); // Update local cart count
        dispatchCartUpdate(); // Dispatch event to update other tabs
        return;
      }

      const response = await cartAPI.addToCart({ productId, quantity, variantId });
      setCart(response.data.data.items || []);
      dispatchCartUpdate(); // Dispatch event to update other tabs
    } catch (error) {
      console.error('Add to cart error:', error);
      setError('Failed to add item to cart');
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      if (!user) {
        // Handle localStorage cart
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const updatedTempCart = tempCart.filter(item => item.productId !== cartItemId);
        localStorage.setItem('tempCart', JSON.stringify(updatedTempCart));
        updateLocalCartCount(); // Update local cart count
        dispatchCartUpdate(); // Dispatch event to update other tabs
        return;
      }

      await cartAPI.removeFromCart(cartItemId);
      setCart(prev => prev.filter(item => item.id !== cartItemId));
      dispatchCartUpdate(); // Dispatch event to update other tabs
    } catch (error) {
      console.error('Remove from cart error:', error);
      setError('Failed to remove item from cart');
    }
  };

  const updateCartQuantity = async (cartItemId, quantity) => {
    try {
      if (!user) {
        // Handle localStorage cart
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const item = tempCart.find(item => item.productId === cartItemId);
        if (item) {
          item.quantity = quantity;
          localStorage.setItem('tempCart', JSON.stringify(tempCart));
          updateLocalCartCount(); // Update local cart count
          dispatchCartUpdate(); // Dispatch event to update other tabs
        }
        return;
      }

      await cartAPI.updateQuantity(cartItemId, { quantity });
      setCart(prev => 
        prev.map(item => 
          item.id === cartItemId ? { ...item, quantity } : item
        )
      );
      dispatchCartUpdate(); // Dispatch event to update other tabs
    } catch (error) {
      console.error('Update cart quantity error:', error);
      setError('Failed to update cart quantity');
    }
  };

  const clearCart = async () => {
    try {
      if (!user) {
        localStorage.removeItem('tempCart');
        updateLocalCartCount(); // Update local cart count
        dispatchCartUpdate(); // Dispatch event to update other tabs
        return;
      }

      await cartAPI.clearCart();
      setCart([]);
      dispatchCartUpdate(); // Dispatch event to update other tabs
    } catch (error) {
      console.error('Clear cart error:', error);
      setError('Failed to clear cart');
    }
  };

  // Wishlist functions
  const addToWishlist = async (productId) => {
    try {
      if (!user) {
        // Store in localStorage for later sync
        const tempWishlist = JSON.parse(localStorage.getItem('tempWishlist') || '[]');
        if (!tempWishlist.includes(productId)) {
          tempWishlist.push(productId);
          localStorage.setItem('tempWishlist', JSON.stringify(tempWishlist));
        }
        return;
      }

      const response = await wishlistAPI.addToWishlist({ productId });
      setWishlist(prev => [...prev, response.data.data]);
    } catch (error) {
      console.error('Add to wishlist error:', error);
      setError('Failed to add item to wishlist');
    }
  };

  const removeFromWishlist = async (wishlistItemId) => {
    try {
      if (!user) {
        // Handle localStorage wishlist
        const tempWishlist = JSON.parse(localStorage.getItem('tempWishlist') || '[]');
        const updatedTempWishlist = tempWishlist.filter(id => id !== wishlistItemId);
        localStorage.setItem('tempWishlist', JSON.stringify(updatedTempWishlist));
        return;
      }

      await wishlistAPI.removeFromWishlist(wishlistItemId);
      setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      setError('Failed to remove item from wishlist');
    }
  };

  // Sync localStorage data when user logs in
  const syncLocalStorageData = async () => {
    try {
      const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
      const tempWishlist = JSON.parse(localStorage.getItem('tempWishlist') || '[]');

      if (tempCart.length > 0) {
        await cartAPI.syncCart(tempCart);
        localStorage.removeItem('tempCart');
      }

      if (tempWishlist.length > 0) {
        for (const productId of tempWishlist) {
          await wishlistAPI.addToWishlist({ productId });
        }
        localStorage.removeItem('tempWishlist');
      }

      // Refresh data
      await fetchUserData();
    } catch (error) {
      console.error('Sync localStorage data error:', error);
    }
  };

  // Calculate totals
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + (parseFloat(item.product?.newPrice || 0) * item.quantity), 0);

  const value = {
    // State
    products,
    cart,
    wishlist,
    user,
    loading,
    error,
    localCartCount,
    
    // Auth functions
    handleLogin,
    handleRegister,
    handleLogout,
    
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    
    // Wishlist functions
    addToWishlist,
    removeFromWishlist,
    
    // Utility functions
    totalItems,
    totalAmount,
    syncLocalStorageData,
    updateLocalCartCount,
    dispatchCartUpdate,
    
    // API functions for components
    productsAPI,
    cartAPI,
    wishlistAPI,
    authAPI,
  };

  return (
    <shopContext.Provider value={value}>
      {props.children}
    </shopContext.Provider>
  );
};

export default ShopcontextProvider;