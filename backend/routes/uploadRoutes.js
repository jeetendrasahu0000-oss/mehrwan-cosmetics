import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.post("/", protect, admin, upload.array("images", 5), (req, res) => {
  const files = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ images: files });
});

export default router;