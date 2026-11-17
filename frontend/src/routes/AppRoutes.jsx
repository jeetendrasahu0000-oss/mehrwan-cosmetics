import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./ProtectedRoute";

import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Wishlist from "../pages/Wishlist";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import Orders from "../pages/Orders";
import OrderDetails from "../pages/OrderDetails";
import NotFound from "../pages/NotFound";

import AdminDashboard from "../pages/admin/Dashboard";
import AdminProducts from "../pages/admin/Products";
import AdminAddProduct from "../pages/admin/AddProduct";
import AdminEditProduct from "../pages/admin/EditProduct";
import AdminCategories from "../pages/admin/Categories";
import AdminOrders from "../pages/admin/Orders";
import AdminCustomers from "../pages/admin/Customers";
import AdminCoupons from "../pages/admin/Coupons";
import AdminReviews from "../pages/admin/Reviews";
import AdminBanners from "../pages/admin/Banners";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public site */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
      </Route>

      {/* Auth */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      {/* Protected user routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/add" element={<AdminAddProduct />} />
          <Route path="products/edit/:id" element={<AdminEditProduct />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;