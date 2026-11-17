import asyncHandler from "../utils/asyncHandler.js";
import Category from "../models/Category.js";

// @desc Get active categories (public)
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("name");
  res.json(categories);
});

// @desc Get all categories (admin)
export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort("-createdAt");
  res.json(categories);
});

// @desc Create category
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const existing = await Category.findOne({ slug });
  if (existing) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({ name, slug, description, image });
  res.status(201).json(category);
});

// @desc Update category
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  Object.assign(category, req.body);
  if (req.body.name) {
    category.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  const updated = await category.save();
  res.json(updated);
});

// @desc Delete category (Permanently from DB)
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  
  // ✅ Direct Database se delete kar dega
  await category.deleteOne(); 
  
  res.json({ message: "Category permanently deleted" });
});