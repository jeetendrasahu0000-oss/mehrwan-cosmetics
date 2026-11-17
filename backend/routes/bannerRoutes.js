import express from "express";
import {
  getBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from "../controllers/bannerController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.get("/", getBanners);
router.get("/all", protect, admin, getAllBanners);
router.post("/", protect, admin, createBanner);
router.put("/:id", protect, admin, updateBanner);
router.delete("/:id", protect, admin, deleteBanner);
export default router;