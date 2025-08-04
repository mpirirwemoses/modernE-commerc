import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProductDisplay from "./components/ProductDisplay";
import Latest from "./components/Latest";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import ScrollToTop from "./components/ScrollToTop";
import Category_nav from "./components/Category_nav";
import { useState } from "react";

// Admin Components
import AdminLayout from "./components/admin/AdminLayout";
import AdminLogin from "./components/admin/AdminLogin";
import AdminRegister from "./components/admin/AdminRegister";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProductManagement from "./components/admin/ProductManagement";
import AddProduct from "./components/admin/AddProduct";
import EditProduct from "./components/admin/EditProduct";
import OrderManagement from "./components/admin/OrderManagement";
import CancelledOrders from "./components/admin/CancelledOrders";
import Analytics from "./components/admin/Analytics";

// Customer Components
import MyOrders from "./components/MyOrders";
import OrderDetail from "./components/OrderDetail";
import Login from "./components/Login";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Wallet from "./components/Wallet";
import Wishlist from "./components/Wishlist";


function App() {
  const [activeCategory, setActiveCategory] = useState(null);

  return (
    <>
      <ScrollToTop />
      <Header />
      <Category_nav
        activeCategory={activeCategory}
        onCategoryClick={setActiveCategory}
      />
      <Routes>
          {/* Main App Routes */}
          <Route path="/" element={<Latest category={activeCategory} />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pd/:id" element={<ProductDisplay />} />
          <Route path="/latest" element={<Latest category="latest" />} />
          <Route path="/orders" element={<MyOrders />} />
          <Route path="/orders/:id" element={<OrderDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/wishlist" element={<Wishlist />} />
          
          {/* Category Routes */}
          <Route path="/category/:categorySlug" element={<Latest />} />
          <Route path="/categories" element={<Latest category={null} />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />
          <Route path="/admin" element={
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          } />
          <Route path="/admin/products" element={
            <AdminLayout>
              <ProductManagement />
            </AdminLayout>
          } />
          <Route path="/admin/products/new" element={
            <AdminLayout>
              <AddProduct />
            </AdminLayout>
          } />
          <Route path="/admin/products/:id/edit" element={
            <AdminLayout>
              <EditProduct />
            </AdminLayout>
          } />
          <Route path="/admin/orders" element={
            <AdminLayout>
              <OrderManagement />
            </AdminLayout>
          } />
          <Route path="/admin/orders/cancelled" element={
            <AdminLayout>
              <CancelledOrders />
            </AdminLayout>
          } />
          <Route path="/admin/analytics" element={
            <AdminLayout>
              <Analytics />
            </AdminLayout>
          } />
        </Routes>
      <Footer />
      </>
  );
}

export default App;
