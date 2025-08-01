import { useContext, useState } from "react";
import Paypal from "./Paypal";
import { shopContext } from "../assets/context/ShopContext";
import { paymentsAPI, ordersAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

const Checkout = ({ Amount }) => {
  const { user, cart, clearCart } = useContext(shopContext);
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState({
    mtn: "",
    airtel: "",
  });
  const [isCheckoutVisible, setIsCheckoutVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  // Handle input changes dynamically for MTN and Airtel
  const handlePaymentChange = (e, provider) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [provider]: e.target.value,
    }));
  };

  // Toggle the visibility of the checkout form
  const toggleCheckoutDisplay = () => {
    setIsCheckoutVisible(!isCheckoutVisible);
  };

  const handleCreateOrder = async () => {
    if (!user) {
      setError('Please login to proceed with checkout');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create order
      const orderResponse = await ordersAPI.createOrder({
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          variantId: item.variantId
        }))
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

  const handleStripePayment = async () => {
    const order = await handleCreateOrder();
    if (!order) return;

    try {
      setLoading(true);
      
      // Create payment intent
      const intentResponse = await paymentsAPI.createIntent({
        orderId: order.id,
        amount: Amount
      });

      // Redirect to Stripe payment
      // In a real implementation, you would use Stripe's payment element
      console.log('Stripe payment intent created:', intentResponse.data);
      
      // For demo purposes, simulate successful payment
      await paymentsAPI.processStripe({
        orderId: order.id,
        paymentIntentId: intentResponse.data.data.clientSecret
      });

      clearCart();
      navigate('/orders');
    } catch (error) {
      console.error('Stripe payment error:', error);
      setError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayPalPayment = async () => {
    const order = await handleCreateOrder();
    if (!order) return;

    try {
      setLoading(true);
      
      // Create PayPal payment
      const paypalResponse = await paymentsAPI.createPayPal({
        orderId: order.id
      });

      // Redirect to PayPal
      window.location.href = paypalResponse.data.data.approvalUrl;
    } catch (error) {
      console.error('PayPal payment error:', error);
      setError('PayPal payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileMoneyPayment = async (provider) => {
    const order = await handleCreateOrder();
    if (!order) return;

    const phoneNumber = paymentDetails[provider];
    if (!phoneNumber) {
      setError(`Please enter your ${provider} phone number`);
      return;
    }

    try {
      setLoading(true);
      
      await paymentsAPI.processMobileMoney({
        orderId: order.id,
        phoneNumber,
        provider: provider === 'mtn' ? 'MTN_MONEY' : 'AIRTEL_MONEY'
      });

      setError(null);
      alert(`Payment request sent to your ${provider} number. Please check your phone for the prompt.`);
      
      // In a real implementation, you would poll for payment status
      setTimeout(() => {
        clearCart();
        navigate('/orders');
      }, 5000);
    } catch (error) {
      console.error('Mobile money payment error:', error);
      setError('Mobile money payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start p-4 space-x-8 space-y-4">
      {/* Summary Section */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>
        <div className="flex items-center justify-between space-x-4">
          <p className="text-gray-600">Total Amount:</p>
          <p className="font-bold text-black">${Amount}</p>
        </div>
        <button
          className="bg-black text-white font-bold rounded px-4 py-2 hover:bg-gray-800 transition"
          onClick={toggleCheckoutDisplay}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Checkout'}
        </button>
      </div>

      {error && (
        <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Payment Form */}
      {isCheckoutVisible && (
        <div className="border-t pt-4 w-full flex flex-row space-x-32">
          {/* Stripe Payment Section */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Pay with Card</h3>
            <button
              className="bg-blue-600 text-white font-bold rounded px-4 py-2 hover:bg-blue-700 transition"
              onClick={handleStripePayment}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay with Card'}
            </button>
          </div>

          {/* MTN Payment Section */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Pay with MTN Money</h3>
            <label className="text-sm text-gray-600">MTN Mobile Money:</label>
            <input
              type="text"
              placeholder="Enter MTN number"
              value={paymentDetails.mtn}
              onChange={(e) => handlePaymentChange(e, "mtn")}
              className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-gray-300"
            />
            <button
              className="bg-yellow-500 text-white font-bold rounded px-4 py-2 hover:bg-yellow-600 transition"
              onClick={() => handleMobileMoneyPayment('mtn')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay with MTN'}
            </button>
          </div>

          {/* Airtel Payment Section */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Pay with Airtel Money</h3>
            <label className="text-sm text-gray-600">Airtel Money:</label>
            <input
              type="text"
              placeholder="Enter Airtel number"
              value={paymentDetails.airtel}
              onChange={(e) => handlePaymentChange(e, "airtel")}
              className="border rounded px-3 py-2 focus:outline-none focus:ring focus:ring-gray-300"
            />
            <button
              className="bg-red-500 text-white font-bold rounded px-4 py-2 hover:bg-red-600 transition"
              onClick={() => handleMobileMoneyPayment('airtel')}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay with Airtel'}
            </button>
          </div>

          {/* PayPal Section */}
          <div className="flex flex-col space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Pay with PayPal</h3>
            <div className="max-w-[250px]">
              <Paypal total={Amount} onPayment={handlePayPalPayment} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
