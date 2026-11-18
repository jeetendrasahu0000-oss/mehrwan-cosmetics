import asyncHandler from "../utils/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: folder || "mehrwan" }, // Cloudinary folder name
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};

// @desc Upload Images to Cloudinary
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    res.status(400);
    throw new Error("No images provided");
  }

  try {
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, "mehrwan")
    );

    const results = await Promise.all(uploadPromises);
    
    // Cloudinary se secure URLs nikaalein
    const imageUrls = results.map((result) => result.secure_url);

    res.status(200).json({
      message: "Images uploaded successfully",
      images: imageUrls, // Frontend ko direct URL milega
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500);
    throw new Error("Failed to upload images to Cloudinary");
  }
});