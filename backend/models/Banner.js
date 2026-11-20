import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: String,
    subtitle: String,
    image: { type: String, required: true },
    videoUrl: { type: String, default: "" },
    link: String,
    type: {
      type: String,
      enum: ["hero", "promotional", "collection", "instagram", "announcement", "video"],
      default: "hero",
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);
export default Banner;