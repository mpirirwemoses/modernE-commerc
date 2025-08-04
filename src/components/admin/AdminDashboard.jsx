import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaBox, 
  FaShoppingCart, 
  FaUsers, 
  FaDollarSign,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');

  // Utility function to get full image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/placeholder.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `http://localhost:5000${imageUrl}`;
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchWithRetry = async (url, options, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const response = await fetch(url, options);
        if (response.status === 429 && i < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
          continue;
        }
        return response;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  };

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const [analyticsRes, ordersRes, productsRes] = await Promise.all([
        fetchWithRetry('http://localhost:5000/api/admin/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetchWithRetry('http://localhost:5000/api/admin/orders?limit=5', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetchWithRetry('http://localhost:5000/api/admin/analytics/products', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Check if responses are successful
      if (!analyticsRes.ok) {
        console.warn('Analytics API response not ok:', analyticsRes.status);
        if (analyticsRes.status === 429) {
          console.warn('Rate limit exceeded for analytics API');
        }
      }
      if (!ordersRes.ok) {
        console.warn('Orders API response not ok:', ordersRes.status);
        if (ordersRes.status === 429) {
          console.warn('Rate limit exceeded for orders API');
        }
      }
      if (!productsRes.ok) {
        console.warn('Products API response not ok:', productsRes.status);
        if (productsRes.status === 429) {
          console.warn('Rate limit exceeded for products API');
        }
      }

      // Only try to parse JSON if response is ok
      let analyticsData = null;
      let ordersData = null;
      let productsData = null;

      try {
        if (analyticsRes.ok) {
          analyticsData = await analyticsRes.json();
        }
      } catch (error) {
        console.warn('Failed to parse analytics response:', error);
      }

      try {
        if (ordersRes.ok) {
          ordersData = await ordersRes.json();
        }
      } catch (error) {
        console.warn('Failed to parse orders response:', error);
      }

      try {
        if (productsRes.ok) {
          productsData = await productsRes.json();
        }
      } catch (error) {
        console.warn('Failed to parse products response:', error);
      }

      // Handle analytics data safely
      if (analyticsData && analyticsData.success !== false) {
        setAnalytics(analyticsData);
      } else {
        setAnalytics(null);
      }
      
      // Handle orders data safely
      if (ordersData && ordersData.orders) {
        setRecentOrders(ordersData.orders);
      } else if (Array.isArray(ordersData)) {
        setRecentOrders(ordersData);
      } else {
        setRecentOrders([]);
      }
      
      // Handle productsData safely - check if it's an array
      if (Array.isArray(productsData)) {
        setTopProducts(productsData.slice(0, 5));
      } else if (productsData && Array.isArray(productsData.products)) {
        setTopProducts(productsData.products.slice(0, 5));
      } else if (productsData && Array.isArray(productsData.data)) {
        setTopProducts(productsData.data.slice(0, 5));
      } else {
        setTopProducts([]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/admin/products/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <FaShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.orders.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FaDollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics.revenue.total)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <FaUsers className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.orders.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <FaBox className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled Orders</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.orders.cancelled}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center">
            <p className="text-gray-500">Analytics data not available</p>
            <p className="text-sm text-gray-400">Check your backend API endpoints</p>
          </div>
        </div>
      )}

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to="/admin/orders"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all orders →
            </Link>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Products</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {topProducts.map((product) => (
              <div key={product.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={getImageUrl(product.images?.[0]?.url)}
                      alt={product.name}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.category?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {product._count?.orderItems || 0} orders
                    </span>
                    <Link
                      to={`/admin/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <FaEdit className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t border-gray-200">
            <Link
              to="/admin/products"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              View all products →
            </Link>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      {analytics?.monthlyTrends && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.monthlyTrends.slice(0, 6).map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(trend.revenue)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {trend.orderCount} orders
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 