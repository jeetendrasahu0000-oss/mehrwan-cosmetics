import asyncHandler from "../utils/asyncHandler.js";
import Coupon from "../models/Coupon.js";

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;
  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiryDate: { $gt: new Date() },
  });

  if (!coupon) {
    res.status(400);
    throw new Error("Invalid or expired coupon");
  }
  if (cartTotal < coupon.minOrderAmount) {
    res.status(400);
    throw new Error(`Minimum order of ₹${coupon.minOrderAmount} required`);
  }

  let discount =
    coupon.discountType === "percentage"
      ? (cartTotal * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);

  res.json({ coupon, discount });
});

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort("-createdAt");
  res.json(coupons);
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json(coupon);
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: "Coupon deleted" });
});