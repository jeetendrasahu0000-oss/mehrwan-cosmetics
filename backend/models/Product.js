import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    ingredients: { type: String, default: "" },
    benefits: { type: String, default: "" },
    skinType: {
      type: String,
      enum: ["All", "Oily", "Dry", "Combination", "Sensitive", "Normal"],
      default: "All",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand: { type: String, required: true },
    images: [{ type: String }],
    price: { type: Number, required: true },
    discountPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0 },
    variants: [
      {
        name: String,
        value: String,
        priceAdjustment: { type: Number, default: 0 },
      },
    ],
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;