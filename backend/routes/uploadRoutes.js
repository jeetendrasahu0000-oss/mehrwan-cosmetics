import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { uploadImages } from "../controllers/uploadController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

// ✅ Route updated to use the new controller
router.post("/", protect, admin, upload.array("images", 5), uploadImages);

export default router;