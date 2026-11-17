import asyncHandler from "../utils/asyncHandler.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};

export const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product")
    .populate("coupon");
  res.json(cart || { items: [], coupon: null });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1, variant } = req.body;
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find(
    (i) => i.product.toString() === productId && i.variant === (variant || "")
  );

  if (existing) {
    existing.qty += Number(qty);
  } else {
    cart.items.push({
      product: product._id,
      name: product.name,
      image: product.images[0],
      price: product.discountPrice || product.price,
      qty: Number(qty),
      variant: variant || "",
    });
  }
  await cart.save();
  res.json(cart);
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, qty } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    res.status(404);
    throw new Error("Item not found");
  }
  if (qty <= 0) {
    cart.items = cart.items.filter((i) => i.product.toString() !== productId);
  } else {
    item.qty = Number(qty);
  }
  await cart.save();
  res.json(cart);
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId
  );
  await cart.save();
  res.json(cart);
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const Coupon = (await import("../models/Coupon.js")).default;
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiryDate: { $gt: new Date() },
  });
  if (!coupon) {
    res.status(400);
    throw new Error("Invalid or expired coupon");
  }
  const cart = await getOrCreateCart(req.user._id);
  cart.coupon = coupon._id;
  await cart.save();
  res.json({ coupon });
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.coupon = null;
  await cart.save();
  res.json(cart);
});