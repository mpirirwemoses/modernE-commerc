import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { shopContext } from '../assets/context/ShopContext';
import { 
  FaSearch, 
  FaFilter, 
  FaEye, 
  FaTimesCircle,
  FaCalendarAlt,
  FaDollarSign,
  FaCreditCard,
  FaTruck,
  FaCheckCircle,
  FaClock,
  FaUser,
  FaMapPin,
  FaPhone,
  FaEnvelope,
  FaBox,
  FaShieldAlt,
  FaArrowRight,
  FaArrowLeft,
  FaStar,
  FaHeart,
  FaShare,
  FaDownload,
  FaPrint,
  FaQuestionCircle,
  FaExclamationTriangle,
  FaInfoCircle
} from 'react-icons/fa';

const MyOrders = () => {
  const { user } = useContext(shopContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user, currentPage, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter })
      });

      const response = await fetch(`http://localhost:5000/api/orders?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setOrders(data.data.orders || []);
        setTotalPages(data.data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return;

    try {
      setCancellingOrder(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder.id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: cancelReason
        })
      });

      const data = await response.json();
      if (data.success) {
        // Update the order in the list
        setOrders(orders.map(order => 
          order.id === selectedOrder.id 
            ? { ...order, status: 'CANCELLED' }
            : order
        ));
        setShowCancelModal(false);
        setSelectedOrder(null);
        setCancelReason('');
        
        // Show refund information
        if (data.data.refundInfo.eligible) {
          alert(`Order cancelled successfully! Your refund of ${formatCurrency(data.data.refundInfo.amount)} will be processed within ${data.data.refundInfo.processTime}. You should receive it within ${data.data.refundInfo.estimatedDelivery}.`);
        } else {
          alert(`Order cancelled successfully! ${data.data.refundInfo.reason}`);
        }
      } else {
        alert(data.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Failed to cancel order');
    } finally {
      setCancellingOrder(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      REFUNDED: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      PENDING: FaClock,
      CONFIRMED: FaCheckCircle,
      PROCESSING: FaBox,
      SHIPPED: FaTruck,
      DELIVERED: FaCheckCircle,
      CANCELLED: FaTimesCircle,
      REFUNDED: FaDollarSign
    };
    return icons[status] || FaClock;
  };

  const canCancelOrder = (order) => {
    return ['PENDING', 'CONFIRMED'].includes(order.status);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaUser className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600 mb-4">You need to be signed in to view your orders</p>
          <Link
            to="/login"
            className="bg-orange-600 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-700 transition"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600">Track your orders and manage returns</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-orange-600 hover:text-orange-700 font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">All Orders</option>
                <option value="PENDING">Pending</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>

            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {orders.length} order{orders.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Orders */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <FaBox className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter 
                ? 'Try adjusting your search or filter criteria.'
                : 'You haven\'t placed any orders yet.'
              }
            </p>
            <Link
              to="/"
              className="bg-orange-600 text-white px-6 py-3 rounded-md font-medium hover:bg-orange-700 transition"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const StatusIcon = getStatusIcon(order.status);
              return (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Order Header */}
                  <div className="px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <StatusIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Order #{order.orderNumber}
                        </div>
                        <div className="text-sm text-gray-600">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </span>
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setCancelReason('');
                              setShowCancelModal(true);
                            }}
                            className="text-red-600 hover:text-red-700 text-sm font-medium"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="px-6 py-4">
                    <div className="space-y-4">
                      {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              src={item.product.images?.[0]?.url || '/placeholder.png'}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-md"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 truncate">
                              {item.product.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 border-t bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                        {order.trackingNumber && (
                          <span>Tracking: {order.trackingNumber}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/orders/${order.id}`}
                          className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                        {order.status === 'DELIVERED' && (
                          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                            Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow-sm">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing page <span className="font-medium">{currentPage}</span> of{' '}
                  <span className="font-medium">{totalPages}</span>
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-orange-50 border-orange-500 text-orange-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Cancel Order
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order #{selectedOrder?.orderNumber}
                  </label>
                  <p className="text-sm text-gray-500">
                    Total: {formatCurrency(selectedOrder?.total)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Cancellation
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="CHANGED_MIND">Changed my mind</option>
                    <option value="FOUND_BETTER_PRICE">Found better price elsewhere</option>
                    <option value="NO_LONGER_NEEDED">No longer needed</option>
                    <option value="ORDERED_BY_MISTAKE">Ordered by mistake</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-start">
                    <FaInfoCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <strong>Refund Information:</strong>
                      <br />
                      • If you paid for this order, you'll receive a refund
                      <br />
                      • Refunds typically take 3-5 business days
                      <br />
                      • You'll receive an email confirmation
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  disabled={cancellingOrder}
                >
                  Keep Order
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancellingOrder || !cancelReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {cancellingOrder ? 'Cancelling...' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders; 