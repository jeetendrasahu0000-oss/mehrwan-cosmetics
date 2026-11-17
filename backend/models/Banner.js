import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: { type: String, required: true }, // Ye thumbnail (cover photo) ka kaam karega
    videoUrl: { type: String, default: "" }, // 👈 Naya field video link ke liye
    link: String, // Jahan redirect hona hai (e.g. Instagram reel link)
    type: {
      type: String,
      enum: ["hero", "promotional", "collection", "instagram", "video"], // 👈 "video" add kiya
      default: "hero",
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;