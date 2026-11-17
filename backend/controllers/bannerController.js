import asyncHandler from "../utils/asyncHandler.js";
import Banner from "../models/Banner.js";

export const getBanners = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  const banners = await Banner.find(query).sort("order");
  res.json(banners);
});

export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({}).sort("order");
  res.json(banners);
});

export const createBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.create(req.body);
  res.status(201).json(banner);
});

export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(banner);
});

export const deleteBanner = asyncHandler(async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ message: "Banner deleted" });
});