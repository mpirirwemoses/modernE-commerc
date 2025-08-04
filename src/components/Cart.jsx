import { useEffect, useState, useContext } from "react";
import { shopContext } from "../assets/context/Shopcontext";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Heart, 
  ArrowRight,
  Truck,
  Shield,
  RotateCcw,
  Clock,
  MapPin,
  CreditCard,
  Gift,
  Tag,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
  Package,
  Star,
  Eye,
  Share2,
  Bookmark,
  ShoppingBag,
  Lock,
  Info,
  Calculator,
  Percent,
  DollarSign,
  Calendar,
  Users,
  ThumbsUp,
  MessageCircle,
  Phone,
  Mail,
  HelpCircle
} from 'lucide-react';

const Cart = () => {
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    totalAmount, 
    user,
    loading,
    products
  } = useContext(shopContext);
  const navigate = useNavigate();
  const [localCart, setLocalCart] = useState([]);
  const [savedForLater, setSavedForLater] = useState([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [estimatedDelivery, setEstimatedDelivery] = useState('2-3 business days');
  const [shippingCost, setShippingCost] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [recommendations, setRecommendations] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmptyCart, setShowEmptyCart] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showShippingCalculator, setShowShippingCalculator] = useState(false);
  const [zipCode, setZipCode] = useState('');

  // Utility function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder-product.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', cost: 0, time: '2-3 business days' },
    { id: 'express', name: 'Express Shipping', cost: 9.99, time: '1-2 business days' },
    { id: 'overnight', name: 'Overnight Shipping', cost: 19.99, time: 'Next business day' }
  ];

  useEffect(() => {
    if (!user) {
      const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
      setLocalCart(tempCart);
    }
  }, [user]);

  useEffect(() => {
    calculateTotals();
    fetchRecommendations();
  }, [cart, localCart, appliedCoupon, shippingMethod]);

  const calculateTotals = () => {
    const displayCart = user ? cart : localCart;
    const subtotal = displayCart.reduce((acc, item) => {
      const product = user ? item.product : products.find(p => p.id === item.productId);
      return acc + (parseFloat(product?.newPrice || 0) * item.quantity);
    }, 0);

    // Calculate shipping
    const selectedShipping = shippingMethods.find(m => m.id === shippingMethod);
    const shipping = subtotal >= 50 ? 0 : selectedShipping?.cost || 0;

    // Calculate tax (simplified - 8.5%)
    const tax = subtotal * 0.085;

    // Calculate discount
    const discount = appliedCoupon ? (appliedCoupon.type === 'PERCENTAGE' ? subtotal * (appliedCoupon.value / 100) : appliedCoupon.value) : 0;

    const total = subtotal + shipping + tax - discount;

    setShippingCost(shipping);
    setTaxAmount(tax);
    setDiscountAmount(discount);
    setEstimatedDelivery(selectedShipping?.time || '2-3 business days');
  };

  const fetchRecommendations = async () => {
    // Simulate fetching recommendations based on cart items
    const displayCart = user ? cart : localCart;
    if (displayCart.length > 0) {
      const categoryIds = displayCart.map(item => {
        const product = user ? item.product : products.find(p => p.id === item.productId);
        return product?.categoryId;
      }).filter(Boolean);

      // Get products from same categories
      const recommended = products.filter(product => 
        categoryIds.includes(product.categoryId) && 
        !displayCart.some(item => {
          const cartProduct = user ? item.product : products.find(p => p.id === item.productId);
          return cartProduct?.id === product.id;
        })
      ).slice(0, 4);

      setRecommendations(recommended);
    }
  };

  const handleRemoveItem = async (itemId) => {
    setIsUpdating(true);
    try {
      if (!user) {
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const updatedTempCart = tempCart.filter(item => item.productId !== itemId);
        localStorage.setItem('tempCart', JSON.stringify(updatedTempCart));
        setLocalCart(updatedTempCart);
        // Dispatch cart update event immediately
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        await removeFromCart(itemId);
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setIsUpdating(true);
    try {
      if (!user) {
        const tempCart = JSON.parse(localStorage.getItem('tempCart') || '[]');
        const updatedTempCart = tempCart.map(item => 
          item.productId === itemId ? { ...item, quantity: newQuantity } : item
        );
        localStorage.setItem('tempCart', JSON.stringify(updatedTempCart));
        setLocalCart(updatedTempCart);
        // Dispatch cart update event immediately
        window.dispatchEvent(new Event('cartUpdated'));
      } else {
        await updateCartQuantity(itemId, newQuantity);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveForLater = (item) => {
    setSavedForLater(prev => [...prev, item]);
    handleRemoveItem(user ? item.id : item.productId);
  };

  const handleMoveToCart = (item) => {
    // Add back to cart logic here
    setSavedForLater(prev => prev.filter(savedItem => savedItem.id !== item.id));
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    // Simulate coupon validation
    const validCoupons = [
      { code: 'WELCOME10', type: 'PERCENTAGE', value: 10, minAmount: 50 },
      { code: 'SAVE20', type: 'FIXED_AMOUNT', value: 20, minAmount: 100 },
      { code: 'FREESHIP', type: 'FREE_SHIPPING', value: 0, minAmount: 75 }
    ];

    const coupon = validCoupons.find(c => c.code === couponCode.toUpperCase());
    if (coupon) {
      const subtotal = (user ? cart : localCart).reduce((acc, item) => {
        const product = user ? item.product : products.find(p => p.id === item.productId);
        return acc + (parseFloat(product?.newPrice || 0) * item.quantity);
      }, 0);

      if (subtotal >= coupon.minAmount) {
        setAppliedCoupon(coupon);
        setCouponCode('');
        setShowCouponInput(false);
      } else {
        alert(`Minimum order amount of $${coupon.minAmount} required for this coupon.`);
      }
    } else {
      alert('Invalid coupon code. Please try again.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleSelectAll = () => {
    const displayCart = user ? cart : localCart;
    if (selectedItems.length === displayCart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(displayCart.map(item => user ? item.id : item.productId));
    }
  };

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const displayCart = user ? cart : localCart;
  const subtotal = displayCart.reduce((acc, item) => {
    const product = user ? item.product : products.find(p => p.id === item.productId);
    return acc + (parseFloat(product?.newPrice || 0) * item.quantity);
  }, 0);

  const total = subtotal + shippingCost + taxAmount - discountAmount;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (displayCart.length === 0 && savedForLater.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-400 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-lg text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => navigate('/')}
                className="bg-orange-600 text-white px-8 py-3 rounded-md font-medium hover:bg-orange-700 transition"
              >
                Start Shopping
              </button>
              {user && (
                <button
                  onClick={() => navigate('/orders')}
                  className="bg-gray-200 text-gray-800 px-8 py-3 rounded-md font-medium hover:bg-gray-300 transition"
                >
                  View Orders
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{displayCart.length} items</span>
              <span>•</span>
              <span>Total: ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Cart Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-orange-600 hover:text-orange-700"
                  >
                    {selectedItems.length === displayCart.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {displayCart.map((item) => {
                  const product = user ? item.product : products.find(p => p.id === item.productId);
                  const itemId = user ? item.id : item.productId;
                  const isSelected = selectedItems.includes(itemId);

                  return (
                    <div key={itemId} className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectItem(itemId)}
                          className="mt-1 h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                        />

                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={getImageUrl(product?.images?.[0]?.url)}
                            alt={product?.name || 'Product'}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-medium text-gray-900 mb-1">
                                {product?.name || 'Product Name'}
                              </h3>
                              <p className="text-sm text-gray-500 mb-2">
                                {product?.brand || 'Brand'}
                              </p>
                              
                              {/* Variants */}
                              {item.variantId && (
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                  {item.size && <span>Size: {item.size}</span>}
                                  {item.color && <span>Color: {item.color}</span>}
                                </div>
                              )}

                              {/* Stock Status */}
                              <div className="flex items-center space-x-2 mb-3">
                                {product?.stock > 0 ? (
                                  <div className="flex items-center text-green-600">
                                    <Check className="w-4 h-4 mr-1" />
                                    <span className="text-sm">In Stock</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-red-600">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    <span className="text-sm">Out of Stock</span>
                                  </div>
                                )}
                              </div>

                              {/* Price */}
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-semibold text-gray-900">
                                  ${parseFloat(product?.newPrice || 0).toFixed(2)}
                                </span>
                                {product?.oldPrice && (
                                  <span className="text-sm text-gray-500 line-through">
                                    ${parseFloat(product.oldPrice).toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleUpdateQuantity(itemId, item.quantity - 1)}
                                  disabled={item.quantity <= 1 || isUpdating}
                                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="w-12 text-center font-medium">{item.quantity}</span>
                                <button
                                  onClick={() => handleUpdateQuantity(itemId, item.quantity + 1)}
                                  disabled={isUpdating}
                                  className="p-1 rounded hover:bg-gray-100"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSaveForLater(item)}
                                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                                >
                                  <Bookmark className="w-4 h-4" />
                                  <span>Save for later</span>
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(itemId)}
                                  disabled={isUpdating}
                                  className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  <span>Remove</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saved for Later */}
            {savedForLater.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">Saved for Later</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {savedForLater.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex items-start space-x-4">
                        <img
                          src={getImageUrl(item.product?.images?.[0]?.url)}
                          alt={item.product?.name || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {item.product?.name || 'Product Name'}
                          </h3>
                          <p className="text-sm text-gray-500 mb-2">
                            {item.product?.brand || 'Brand'}
                          </p>
                          <div className="flex items-center space-x-4">
                            <span className="text-lg font-semibold text-gray-900">
                              ${parseFloat(item.product?.newPrice || 0).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleMoveToCart(item)}
                              className="text-sm text-orange-600 hover:text-orange-700"
                            >
                              Move to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">You might also like</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {recommendations.map((product) => (
                      <div key={product.id} className="group cursor-pointer">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                          <img
                            src={getImageUrl(product.images?.[0]?.url)}
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                        <h3 className="mt-2 text-sm text-gray-700 truncate">{product.name}</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          ${parseFloat(product.newPrice).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border sticky top-6">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-sm">
                  <span>Subtotal ({displayCart.length} items)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${shippingCost.toFixed(2)}`}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>${taxAmount.toFixed(2)}</span>
                </div>

                {/* Discount */}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Shipping Method */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Shipping Method</h3>
                  <div className="space-y-2">
                    {shippingMethods.map((method) => (
                      <label key={method.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="text-orange-600 border-gray-300 focus:ring-orange-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">{method.name}</span>
                            <span className="text-sm">
                              {method.cost === 0 ? 'Free' : `$${method.cost.toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{method.time}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Coupon Code */}
                <div className="space-y-3">
                  {appliedCoupon ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">
                            {appliedCoupon.code} applied
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => setShowCouponInput(!showCouponInput)}
                        className="text-sm text-orange-600 hover:text-orange-700 flex items-center space-x-1"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Add coupon code</span>
                      </button>
                      
                      {showCouponInput && (
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Enter coupon code"
                            className="flex-1 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                          />
                          <button
                            onClick={handleApplyCoupon}
                            className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Trust Indicators */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Secure checkout</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <RotateCcw className="w-4 h-4" />
                    <span>30-day returns</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Free shipping over $50</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => navigate('/checkout')}
                    disabled={displayCart.length === 0}
                    className="w-full bg-orange-600 text-white py-3 px-6 rounded-md font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
                  >
                    <Lock className="w-5 h-5" />
                    <span>Proceed to Checkout</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/')}
                    className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-md font-medium hover:bg-gray-300 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Support */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-4">Need Help?</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <MessageCircle className="w-4 h-4" />
                    <span>Live chat</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>1-800-SHOP</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>support@shop.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
