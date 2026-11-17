import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import Coupon from "../models/Coupon.js";

export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    discount,
    totalPrice,
    couponCode,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  }

  let coupon;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (coupon) {
      coupon.usedCount += 1;
      await coupon.save();
    }
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice: shippingPrice || 0,
    discount: discount || 0,
    totalPrice,
    coupon: coupon?._id,
    isPaid: paymentMethod === "COD" ? false : true,
    paidAt: paymentMethod === "COD" ? undefined : new Date(),
    orderStatus: "Pending",
  });

  const created = await order.save();

  // Decrement stock and increment sold
  for (const item of orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty, sold: item.qty },
    });
  }

  // Clear cart
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });

  res.status(201).json(created);
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json(orders);
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    res.status(403);
    throw new Error("Not authorized");
  }
  res.json(order);
});

// Admin
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "name email")
    .sort("-createdAt");
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  order.orderStatus = req.body.status;
  if (req.body.status === "Delivered") {
    order.deliveredAt = new Date();
    order.isPaid = true;
  }
  if (req.body.status === "Cancelled") order.cancelledAt = new Date();
  await order.save();
  res.json(order);
});