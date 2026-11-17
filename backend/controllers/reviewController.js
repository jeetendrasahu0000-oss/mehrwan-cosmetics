import asyncHandler from "../utils/asyncHandler.js";
import Review from "../models/Review.js";
import Product from "../models/Product.js";

export const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true }).sort("-createdAt");
  res.json(reviews);
});

export const createReview = asyncHandler(async (req, res) => {
  const { productId, rating, comment } = req.body;
  const existing = await Review.findOne({ user: req.user._id, product: productId });
  if (existing) {
    res.status(400);
    throw new Error("You have already reviewed this product");
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    name: req.user.name,
    rating,
    comment,
  });

  const reviews = await Review.find({ product: productId, isApproved: true });
  const product = await Product.findById(productId);
  product.numReviews = reviews.length;
  product.rating = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  await product.save();

  res.status(201).json(review);
});

// Admin
export const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({}).populate("product", "name").sort("-createdAt");
  res.json(reviews);
});

export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  res.json(review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted" });
});