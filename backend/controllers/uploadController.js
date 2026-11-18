import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// Helper function: Image buffer ko Cloudinary par upload karna
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "mehrwan/products" }, // Cloudinary folder name
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc Upload multiple images to Cloudinary
// @route POST /api/upload
// @access Admin
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No images provided");
  }

  try {
    // Saari images ko parallel Cloudinary par bhejein
    const uploadPromises = req.files.map((file) => uploadToCloudinary(file.buffer));
    const results = await Promise.all(uploadPromises);

    // ✅ Cloudinary ke secure URLs nikaalein
    const imageUrls = results.map((result) => result.secure_url);

    res.status(200).json({
      message: "Images uploaded successfully",
      images: imageUrls,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500);
    throw new Error("Failed to upload images to Cloudinary");
  }
});