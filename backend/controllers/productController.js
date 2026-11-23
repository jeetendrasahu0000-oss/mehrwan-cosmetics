import asyncHandler from "../utils/asyncHandler.js";
import Product from "../models/Product.js";

export const getProducts = asyncHandler(async (req, res) => {
  const {
    keyword,
    category,
    brand,
    skinType,
    minPrice,
    maxPrice,
    rating,
    sort,
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const query = { isActive: true };

  // ✅ FIXED SEARCH: Name, Brand, Description, Ingredients, Benefits
  if (keyword) {
    const searchRegex = { $regex: keyword, $options: "i" };
    
    query.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { description: searchRegex },
      { ingredients: searchRegex },
      { benefits: searchRegex },
    ];
  }

  if (category) query.category = category;
  if (brand) query.brand = { $in: brand.split(",") };
  if (skinType) query.skinType = { $in: skinType.split(",") };
  if (rating) query.rating = { $gte: Number(rating) };
  if (featured) query.isFeatured = true;
  
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort === "price-asc") sortOption = { price: 1 };
  else if (sort === "price-desc") sortOption = { price: -1 };
  else if (sort === "rating") sortOption = { rating: -1 };
  else if (sort === "popular") sortOption = { sold: -1 };

  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate("category", "name slug")
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    products,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    total,
  });
});

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
    "category",
    "name slug"
  );
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  res.json(product);
});

export const createProduct = asyncHandler(async (req, res) => {
  const { name, ...rest } = req.body;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const product = await Product.create({ name, slug, ...rest });
  res.status(201).json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  Object.assign(product, req.body);
  if (req.body.name)
    product.slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const updated = await product.save();
  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  product.isActive = false;
  await product.save();
  res.json({ message: "Product removed" });
});

export const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name");
  
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const keywords = [
    product.brand,
    product.category?.name, 
  ].filter(Boolean);

  const textToSearch = [
    product.name,
    product.description,
    product.ingredients,
    product.benefits,
  ]
    .filter(Boolean)
    .join(" ")
    .split(" ")
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => word.length > 3);

  const uniqueKeywords = [...new Set([...keywords, ...textToSearch])];

  let related;
  if (uniqueKeywords.length === 0) {
    related = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      isActive: true,
    }).limit(8);
  } else {
    const regexPattern = uniqueKeywords.join("|");
    
    related = await Product.find({
      _id: { $ne: product._id },
      isActive: true,
      $or: [
        { name: { $regex: regexPattern, $options: "i" } },
        { brand: { $regex: regexPattern, $options: "i" } },
        { description: { $regex: regexPattern, $options: "i" } },
        { ingredients: { $regex: regexPattern, $options: "i" } },
        { benefits: { $regex: regexPattern, $options: "i" } },
        { category: product.category } 
      ],
    }).limit(8);
  }

  res.json(related);
});