import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { shopContext } from "../assets/context/Shopcontext";
import { paymentsAPI, ordersAPI } from "../services/api";
import { 
  Lock, 
  CreditCard, 
  Truck, 
  Shield, 
  RotateCcw, 
  Clock,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Check,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  Gift,
  Star,
  Package,
  DollarSign,
  Calendar,
  Users,
  MessageCircle,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  X,
  Plus,
  Minus,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";

const Checkout = () => {
  const { user, cart, clearCart, totalAmount } = useContext(shopContext);
  const navigate = useNavigate();
  
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [showPassword, setShowPassword] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  
  // Shipping information - auto-populate from user data
  const [shippingInfo, setShippingInfo] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  // Payment information
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false
  });
  
  // Mobile money payment
  const [mobileMoneyInfo, setMobileMoneyInfo] = useState({
    mtn: '',
    airtel: ''
  });

  const steps = [
    { id: 1, title: 'Shipping', icon: Truck },
    { id: 2, title: 'Payment', icon: CreditCard },
    { id: 3, title: 'Review', icon: Check }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, color: 'bg-blue-600' },
    { id: 'paypal', name: 'PayPal', icon: DollarSign, color: 'bg-blue-500' },
    { id: 'mtn', name: 'MTN Mobile Money', icon: Phone, color: 'bg-yellow-500' },
    { id: 'airtel', name: 'Airtel Money', icon: Phone, color: 'bg-red-500' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    
    if (cart.length === 0) {
      navigate('/cart');
      return;
    }
  }, [user, cart, navigate]);

  // Auto-populate shipping info when user data changes
  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const handleShippingChange = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field, value) => {
    setPaymentInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleMobileMoneyChange = (provider, value) => {
    setMobileMoneyInfo(prev => ({ ...prev, [provider]: value }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateShipping = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => shippingInfo[field].trim() !== '');
  };

  const validatePayment = () => {
    if (paymentMethod === 'card') {
      const required = ['cardNumber', 'cardName', 'expiryDate', 'cvv'];
      return required.every(field => paymentInfo[field].trim() !== '');
    } else if (paymentMethod === 'mtn') {
      return mobileMoneyInfo.mtn.trim() !== '';
    } else if (paymentMethod === 'airtel') {
      return mobileMoneyInfo.airtel.trim() !== '';
    }
    return true;
  };

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      setError(null);

      const orderResponse = await ordersAPI.createOrder({
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId
        })),
        shippingAddress: shippingInfo,
        paymentMethod: paymentMethod
      });

      setOrderId(orderResponse.data.data.id);
      return orderResponse.data.data;
    } catch (error) {
      console.error('Create order error:', error);
      setError(error.response?.data?.error || 'Failed to create order');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    const order = await handleCreateOrder();
    if (!order) return;

    try {
      setLoading(true);
      
      switch (paymentMethod) {
        case 'card':
          await handleCardPayment(order);
          break;
        case 'paypal':
          await handlePayPalPayment(order);
          break;
        case 'mtn':
          await handleMobileMoneyPayment(order, 'mtn');
          break;
        case 'airtel':
          await handleMobileMoneyPayment(order, 'airtel');
          break;
        default:
          throw new Error('Invalid payment method');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardPayment = async (order) => {
    const intentResponse = await paymentsAPI.createIntent({
      orderId: order.id,
      amount: totalAmount
    });

    // Simulate successful payment for demo
    await paymentsAPI.processStripe({
      orderId: order.id,
      paymentIntentId: intentResponse.data.data.clientSecret
    });

    clearCart();
    // Dispatch cart update event for immediate UI update
    window.dispatchEvent(new Event('cartUpdated'));
    setOrderSuccess(true);
    setTimeout(() => {
      navigate('/orders');
    }, 2000);
  };

  const handlePayPalPayment = async (order) => {
    const paypalResponse = await paymentsAPI.createPayPal({
      orderId: order.id
    });

    window.location.href = paypalResponse.data.data.approvalUrl;
  };

  const handleMobileMoneyPayment = async (order, provider) => {
    const phoneNumber = mobileMoneyInfo[provider];
    
    await paymentsAPI.processMobileMoney({
      orderId: order.id,
      phoneNumber,
      provider: provider === 'mtn' ? 'MTN_MONEY' : 'AIRTEL_MONEY'
    });

    alert(`Payment request sent to your ${provider} number. Please check your phone for the prompt.`);
    
    setTimeout(() => {
      clearCart();
      // Dispatch cart update event for immediate UI update
      window.dispatchEvent(new Event('cartUpdated'));
      setOrderSuccess(true);
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    }, 5000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-center mb-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id 
                  ? 'bg-orange-500 border-orange-500 text-white' 
                  : 'bg-white border-gray-300 text-gray-500'
              }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <step.icon className="w-5 h-5" />
            </motion.div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-4 ${
                currentStep > step.id ? 'bg-orange-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
      
      {/* Step Titles */}
      <div className="flex justify-center space-x-8">
        {steps.map((step) => (
          <div key={step.id} className="text-center">
            <span className={`text-sm font-medium ${
              currentStep >= step.id ? 'text-orange-600' : 'text-gray-500'
            }`}>
              {step.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

     const renderShippingForm = () => (
     <motion.div
       initial={{ opacity: 0, x: 20 }}
       animate={{ opacity: 1, x: 0 }}
       exit={{ opacity: 0, x: -20 }}
       className="space-y-6"
     >
       {/* Auto-population notice */}
       {user && (user.firstName || user.lastName || user.email || user.phone) && (
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
           <div className="flex items-start space-x-3">
             <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
               <Check className="w-4 h-4 text-blue-600" />
             </div>
             <div>
               <p className="text-sm font-medium text-blue-900">Profile Information Auto-filled</p>
               <p className="text-xs text-blue-700 mt-1">
                 We've automatically filled in your information from your profile. You can edit any field if needed.
               </p>
             </div>
           </div>
         </div>
       )}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             First Name
             {user?.firstName && (
               <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                 From Profile
               </span>
             )}
           </label>
           <input
             type="text"
             value={shippingInfo.firstName}
             onChange={(e) => handleShippingChange('firstName', e.target.value)}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
             placeholder="Enter your first name"
           />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Last Name
             {user?.lastName && (
               <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                 From Profile
               </span>
             )}
           </label>
           <input
             type="text"
             value={shippingInfo.lastName}
             onChange={(e) => handleShippingChange('lastName', e.target.value)}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
             placeholder="Enter your last name"
           />
         </div>
       </div>
      
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Email
             {user?.email && (
               <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                 From Profile
               </span>
             )}
           </label>
           <input
             type="email"
             value={shippingInfo.email}
             onChange={(e) => handleShippingChange('email', e.target.value)}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
             placeholder="Enter your email"
           />
         </div>
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Phone
             {user?.phone && (
               <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                 From Profile
               </span>
             )}
           </label>
           <input
             type="tel"
             value={shippingInfo.phone}
             onChange={(e) => handleShippingChange('phone', e.target.value)}
             className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
             placeholder="Enter your phone number"
           />
         </div>
       </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={shippingInfo.address}
          onChange={(e) => handleShippingChange('address', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          placeholder="Enter your address"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
          <input
            type="text"
            value={shippingInfo.city}
            onChange={(e) => handleShippingChange('city', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your city"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
          <input
            type="text"
            value={shippingInfo.state}
            onChange={(e) => handleShippingChange('state', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter your state"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
          <input
            type="text"
            value={shippingInfo.zipCode}
            onChange={(e) => handleShippingChange('zipCode', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter ZIP code"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderPaymentForm = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Payment Method Selection */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                paymentMethod === method.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center`}>
                  <method.icon className="w-4 h-4 text-white" />
                </div>
                <span className="font-medium text-gray-900">{method.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Details */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
            <input
              type="text"
              value={paymentInfo.cardNumber}
              onChange={(e) => handlePaymentChange('cardNumber', formatCardNumber(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="1234 5678 9012 3456"
              maxLength="19"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
            <input
              type="text"
              value={paymentInfo.cardName}
              onChange={(e) => handlePaymentChange('cardName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter cardholder name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <input
                type="text"
                value={paymentInfo.expiryDate}
                onChange={(e) => handlePaymentChange('expiryDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="MM/YY"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={paymentInfo.cvv}
                  onChange={(e) => handlePaymentChange('cvv', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent pr-12"
                  placeholder="123"
                  maxLength="4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="saveCard"
              checked={paymentInfo.saveCard}
              onChange={(e) => handlePaymentChange('saveCard', e.target.checked)}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
            />
            <label htmlFor="saveCard" className="text-sm text-gray-700">
              Save this card for future purchases
            </label>
          </div>
        </div>
      )}

      {(paymentMethod === 'mtn' || paymentMethod === 'airtel') && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {paymentMethod === 'mtn' ? 'MTN Mobile Money' : 'Airtel Money'} Number
            </label>
            <input
              type="tel"
              value={mobileMoneyInfo[paymentMethod]}
              onChange={(e) => handleMobileMoneyChange(paymentMethod, e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={`Enter your ${paymentMethod === 'mtn' ? 'MTN' : 'Airtel'} number`}
            />
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">How it works:</p>
                <p>1. Enter your mobile money number</p>
                <p>2. Complete the payment on your phone</p>
                <p>3. You'll receive a confirmation SMS</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderOrderReview = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-3">
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={item.product?.image || '/placeholder-product.jpg'}
                  alt={item.product?.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <p className="font-medium text-gray-900">{item.product?.name}</p>
                  <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                </div>
              </div>
              <p className="font-medium text-gray-900">
                ${(parseFloat(item.product?.newPrice || 0) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        
        <div className="border-t pt-4 mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium">Free</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium">${(totalAmount * 0.085).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${(totalAmount * 1.085).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Information</h3>
        <div className="space-y-2">
          <p className="text-gray-900">
            {shippingInfo.firstName} {shippingInfo.lastName}
          </p>
          <p className="text-gray-600">{shippingInfo.address}</p>
          <p className="text-gray-600">
            {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
          </p>
          <p className="text-gray-600">{shippingInfo.email}</p>
          <p className="text-gray-600">{shippingInfo.phone}</p>
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
        <div className="flex items-center space-x-3">
          {(() => {
            const method = paymentMethods.find(m => m.id === paymentMethod);
            return method?.icon ? (
              <div className={`w-8 h-8 rounded-full ${method.color} flex items-center justify-center`}>
                <method.icon className="w-4 h-4 text-white" />
              </div>
            ) : null;
          })()}
          <span className="font-medium text-gray-900">
            {paymentMethods.find(m => m.id === paymentMethod)?.name}
          </span>
        </div>
      </div>
    </motion.div>
  );

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <AnimatePresence mode="wait">
                {currentStep === 1 && renderShippingForm()}
                {currentStep === 2 && renderPaymentForm()}
                {currentStep === 3 && renderOrderReview()}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                {currentStep < 3 ? (
                  <button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !validateShipping()) ||
                      (currentStep === 2 && !validatePayment())
                    }
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="flex items-center space-x-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        <span>Complete Order</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.product?.image || '/placeholder-product.jpg'}
                        alt={item.product?.name}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product?.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ${(parseFloat(item.product?.newPrice || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-4 mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">${(totalAmount * 0.085).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${(totalAmount * 1.085).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Why Shop With Us?</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Secure Checkout</p>
                    <p className="text-xs text-gray-500">Your information is always protected</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fast Shipping</p>
                    <p className="text-xs text-gray-500">Delivery within 2-3 business days</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Easy Returns</p>
                    <p className="text-xs text-gray-500">30-day return policy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">24/7 Support</p>
                    <p className="text-xs text-gray-500">We're here to help anytime</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Overlay */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-8 max-w-md mx-4 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Order Successful!</h3>
              <p className="text-gray-600 mb-4">Your order has been placed successfully. You will receive a confirmation email shortly.</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Redirecting to orders page...</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Checkout;