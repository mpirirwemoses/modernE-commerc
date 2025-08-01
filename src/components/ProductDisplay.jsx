import React, { useContext, useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { shopContext } from "../assets/context/ShopContext";
import { productsAPI, reviewsAPI, wishlistAPI } from "../services/api";
import { 
  ChevronLeft, 
  X, 
  Star, 
  ChevronRight, 
  Heart, 
  Share2, 
  Truck, 
  Shield, 
  RotateCcw, 
  MessageCircle,
  ShoppingCart,
  Eye,
  Play,
  Minus,
  Plus,
  Check,
  AlertCircle,
  Info,
  Facebook,
  Twitter,
  Instagram,
  // Pinterest,
  Mail,
  Copy,
  MapPin,
  Clock,
  Users,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Share,
  Camera,
  Video,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

const ProductDisplay = () => {
  const { addToCart, addToWishlist, removeFromWishlist, user, wishlist } = useContext(shopContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [selectedTab, setSelectedTab] = useState('description');
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [stockStatus, setStockStatus] = useState('in-stock');
  const [deliveryEstimate, setDeliveryEstimate] = useState('2-3 business days');
  const [showQAModal, setShowQAModal] = useState(false);
  const [questions, setQuestions] = useState([]);

  const imageRef = useRef(null);
  const zoomRef = useRef(null);

  const colors = [
    { name: "Blue", class: "bg-blue-500", hex: "#3B82F6" },
    { name: "Red", class: "bg-red-500", hex: "#EF4444" },
    { name: "Green", class: "bg-green-500", hex: "#10B981" },
    { name: "White", class: "bg-white border border-gray-300", hex: "#FFFFFF" },
    { name: "Black", class: "bg-black", hex: "#000000" },
    { name: "Gray", class: "bg-gray-500", hex: "#6B7280" },
  ];

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  useEffect(() => {
    if (product && wishlist) {
      setIsWishlisted(wishlist.some(item => item.productId === product.id));
    }
  }, [product, wishlist]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const [productRes, reviewsRes, statsRes] = await Promise.all([
        productsAPI.getById(id),
        reviewsAPI.getProductReviews(id),
        reviewsAPI.getReviewStats(id)
      ]);

      setProduct(productRes.data.data);
      setReviews(reviewsRes.data.data.reviews || []);
      setReviewStats(statsRes.data.data);
      
      // Set initial color and size if available
      if (productRes.data.data.variants) {
        const colorVariant = productRes.data.data.variants.find(v => v.name === 'Color');
        if (colorVariant) setSelectedColor(colorVariant.value);
        
        const sizeVariant = productRes.data.data.variants.find(v => v.name === 'Size');
        if (sizeVariant) setSelectedSize(sizeVariant.value);
      }

      // Fetch related products
      fetchRelatedProducts(productRes.data.data.categoryId);
    } catch (error) {
      console.error('Error fetching product details:', error);
      setError('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await productsAPI.getAll({ categoryId, limit: 4 });
      setRelatedProducts(response.data.data.products || []);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleImageZoom = (e) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    imageRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (isWishlisted) {
      const wishlistItem = wishlist.find(item => item.productId === product.id);
      if (wishlistItem) {
        await removeFromWishlist(wishlistItem.id);
      }
    } else {
      await addToWishlist(product.id);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    if (!selectedSize && product.variants?.some(v => v.name === 'Size')) {
      alert('Please select a size');
      return;
    }
    
    addToCart(product.id, quantity, selectedSize);
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    if (!selectedSize && product.variants?.some(v => v.name === 'Size')) {
      alert('Please select a size');
      return;
    }
    
    addToCart(product.id, quantity, selectedSize);
    navigate('/cart');
  };

  const handleShare = async (platform) => {
    const url = window.location.href;
    const text = `Check out this amazing product: ${product.name}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      // pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(text)}&body=${encodeURIComponent(url)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank');
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const discountPercentage = product.oldPrice && product.newPrice 
    ? Math.round(((product.oldPrice - product.newPrice) / product.oldPrice) * 100)
    : 0;

  const isLowStock = product.stock > 0 && product.stock <= 10;
  const isOutOfStock = product.stock === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link to="/" className="text-gray-400 hover:text-gray-500">
                  Home
                </Link>
              </li>
              <li>
                <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-300" />
              </li>
              <li>
                <Link to={`/category/${product.category?.slug}`} className="text-gray-400 hover:text-gray-500">
                  {product.category?.name}
                </Link>
              </li>
              <li>
                <ChevronRight className="flex-shrink-0 h-5 w-5 text-gray-300" />
              </li>
              <li className="text-gray-900 font-medium">{product.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative group">
              <div 
                ref={imageRef}
                className="relative overflow-hidden rounded-lg bg-white"
                onMouseMove={handleImageZoom}
                onMouseEnter={() => setIsImageZoomed(true)}
                onMouseLeave={() => setIsImageZoomed(false)}
              >
                <img
                  src={product.images?.[currentImageIndex]?.url || '/placeholder-product.jpg'}
                  alt={product.name}
                  className={`w-full h-96 object-cover transition-transform duration-300 ${
                    isImageZoomed ? 'scale-150' : 'scale-100'
                  }`}
                />
                
                {/* Zoom indicator */}
                {isImageZoomed && (
                  <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                    <ZoomIn className="text-white text-2xl" />
                  </div>
                )}

                {/* Video play button if video exists */}
                {product.videoUrl && (
                  <button
                    onClick={() => setShowVideo(true)}
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity"
                  >
                    <Play className="text-white text-4xl" />
                  </button>
                )}

                {/* Image navigation */}
                <button
                  onClick={() => setCurrentImageIndex(Math.max(0, currentImageIndex - 1))}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition"
                  disabled={currentImageIndex === 0}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex(Math.min((product.images?.length || 1) - 1, currentImageIndex + 1))}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition"
                  disabled={currentImageIndex === (product.images?.length || 1) - 1}
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      currentImageIndex === index ? 'border-orange-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Image count indicator */}
            <div className="text-center text-sm text-gray-500">
              {currentImageIndex + 1} of {product.images?.length || 1}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <p className="text-lg text-gray-600 mb-4">by {product.brand || 'FashionBrand'}</p>
                
                {/* Rating */}
                {reviewStats && (
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="flex items-center">
                      {Array.from({ length: 5 }, (_, index) => (
                        <Star
                          key={index}
                          className={`w-5 h-5 ${
                            reviewStats.averageRating > index ? "text-yellow-400" : "text-gray-300"
                          }`}
                          fill={reviewStats.averageRating > index ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      {reviewStats.averageRating.toFixed(1)} ({reviewStats.totalReviews} reviews)
                    </span>
                    <button
                      onClick={() => setSelectedTab('reviews')}
                      className="text-sm text-orange-600 hover:text-orange-700 underline"
                    >
                      Write a review
                    </button>
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-full border transition ${
                    isWishlisted 
                      ? 'bg-red-500 text-white border-red-500' 
                      : 'bg-white text-gray-600 border-gray-300 hover:border-red-500'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-3 rounded-full border border-gray-300 bg-white text-gray-600 hover:border-gray-400 transition"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-gray-900">
                  ${parseFloat(product.newPrice).toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    ${parseFloat(product.oldPrice).toFixed(2)}
                  </span>
                )}
                {discountPercentage > 0 && (
                  <span className="bg-red-100 text-red-800 text-sm font-medium px-2 py-1 rounded">
                    {discountPercentage}% OFF
                  </span>
                )}
              </div>
              
              {product.oldPrice && (
                <p className="text-sm text-gray-600">
                  You save ${(parseFloat(product.oldPrice) - parseFloat(product.newPrice)).toFixed(2)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div className="space-y-2">
              {isOutOfStock ? (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Only {product.stock} left in stock</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <span className="font-medium">In Stock</span>
                </div>
              )}
            </div>

            {/* Size Selection */}
            {product.variants?.some(v => v.name === 'Size') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">Size</label>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-orange-600 hover:text-orange-700 underline"
                  >
                    Size Guide
                  </button>
                </div>
                <div className="grid grid-cols-6 gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 px-3 text-sm font-medium rounded-md border transition ${
                        selectedSize === size
                          ? "border-orange-500 bg-orange-50 text-orange-700"
                          : "border-gray-300 text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Color</label>
              <div className="flex space-x-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      selectedColor === color.name
                        ? "border-orange-500 ring-2 ring-orange-200"
                        : "border-gray-300 hover:border-gray-400"
                    } ${color.class}`}
                    title={color.name}
                  />
                ))}
              </div>
              {selectedColor && (
                <p className="text-sm text-gray-600">Selected: {selectedColor}</p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 bg-white border rounded">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className="w-full bg-orange-600 text-white py-3 px-6 rounded-md font-medium hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                className="w-full bg-gray-900 text-white py-3 px-6 rounded-md font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
              >
                Buy Now
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="border-t pt-6 space-y-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>30-day return policy</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5" />
                  <span>Easy returns</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>24/7 customer support</span>
                </div>
              </div>
            </div>

            {/* Delivery Estimate */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Delivery</span>
              </div>
              <p className="text-sm text-gray-600">
                Estimated delivery: {deliveryEstimate}
              </p>
              <p className="text-sm text-gray-600">
                Free shipping on orders over $50
              </p>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="mt-12">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'description', label: 'Description' },
                { id: 'reviews', label: `Reviews (${reviewStats?.totalReviews || 0})` },
                { id: 'questions', label: 'Q&A' },
                { id: 'shipping', label: 'Shipping & Returns' },
                { id: 'related', label: 'Related Products' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                    selectedTab === tab.id
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {selectedTab === 'description' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
                
                {product.features && (
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-3">Features</h4>
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'reviews' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Customer Reviews</h3>
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
                  >
                    Write a Review
                  </button>
                </div>
                
                {reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  review.rating > index ? "text-yellow-400" : "text-gray-300"
                                }`}
                                fill={review.rating > index ? "currentColor" : "none"}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            by {review.user.firstName} {review.user.lastName}
                          </span>
                          {review.isVerified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        {review.title && (
                          <h4 className="font-semibold text-gray-800 mb-2">{review.title}</h4>
                        )}
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                )}
              </div>
            )}

            {selectedTab === 'questions' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Questions & Answers</h3>
                  <button
                    onClick={() => setShowQAModal(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
                  >
                    Ask a Question
                  </button>
                </div>
                
                {questions.length > 0 ? (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                        <p className="text-gray-600">{question.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No questions yet. Ask a question about this product!</p>
                )}
              </div>
            )}

            {selectedTab === 'shipping' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Shipping & Returns</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Shipping Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• Free shipping on orders over $50</p>
                      <p>• Standard delivery: 2-3 business days</p>
                      <p>• Express delivery: 1-2 business days</p>
                      <p>• International shipping available</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Return Policy</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>• 30-day return window</p>
                      <p>• Free returns on all orders</p>
                      <p>• Items must be unworn and unwashed</p>
                      <p>• Original tags must be attached</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'related' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Related Products</h3>
                
                {relatedProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.map((relatedProduct) => (
                      <div key={relatedProduct.id} className="group">
                        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
                          <img
                            src={relatedProduct.images?.[0]?.url || '/placeholder-product.jpg'}
                            alt={relatedProduct.name}
                            className="h-full w-full object-cover object-center group-hover:opacity-75"
                          />
                        </div>
                        <h3 className="mt-2 text-sm text-gray-700 truncate">{relatedProduct.name}</h3>
                        <p className="mt-1 text-lg font-medium text-gray-900">
                          ${parseFloat(relatedProduct.newPrice).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No related products found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Share this product</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition flex items-center justify-center space-x-2"
                >
                  <Facebook className="w-5 h-5" />
                  <span>Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex-1 bg-blue-400 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition flex items-center justify-center space-x-2"
                >
                  <Twitter className="w-5 h-5" />
                  <span>Twitter</span>
                </button>
              </div>
              
              {/* Commented out Pinterest button */}
              {/* <div className="flex space-x-4">
                <button
                  onClick={() => handleShare('pinterest')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition flex items-center justify-center space-x-2"
                >
                  <Pinterest className="w-5 h-5" />
                  <span>Pinterest</span>
                </button>
                <button
                  onClick={() => handleShare('email')}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition flex items-center justify-center space-x-2"
                >
                  <Mail className="w-5 h-5" />
                  <span>Email</span>
                </button>
              </div> */}
              
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {showVideo && product.videoUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-4xl w-full mx-4">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X className="w-8 h-8" />
            </button>
            <video
              src={product.videoUrl}
              controls
              className="w-full h-auto rounded-lg"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDisplay;
