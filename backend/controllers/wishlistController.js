import asyncHandler from "../utils/asyncHandler.js";
import Wishlist from "../models/Wishlist.js";

// @desc Get user wishlist
export const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id }).populate(
    "products"
  );
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }
  res.json(wishlist);
});

// @desc Toggle product in wishlist (add if not exists, remove if exists)
export const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: req.user._id, products: [] });
  }

  const index = wishlist.products.findIndex(
    (p) => p.toString() === productId
  );

  if (index > -1) {
    wishlist.products.splice(index, 1);
  } else {
    wishlist.products.push(productId);
  }

  await wishlist.save();
  await wishlist.populate("products");

  res.json(wishlist);
});