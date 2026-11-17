import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments({ isActive: true });
  const totalCustomers = await User.countDocuments({ isAdmin: false });
  const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
  const completedOrders = await Order.countDocuments({ orderStatus: "Delivered" });

  const revenueData = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenueData[0]?.total || 0;

  const recentOrders = await Order.find({})
    .populate("user", "name email")
    .sort("-createdAt")
    .limit(10);

  // Sales last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const salesByDay = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    pendingOrders,
    completedOrders,
    recentOrders,
    salesByDay,
  });
});