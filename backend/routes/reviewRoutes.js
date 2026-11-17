import express from "express";
import {
  getProductReviews,
  createReview,
  getAllReviews,
  approveReview,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.get("/product/:productId", getProductReviews);
router.post("/", protect, createReview);
router.get("/", protect, admin, getAllReviews);
router.put("/:id/approve", protect, admin, approveReview);
router.delete("/:id", protect, admin, deleteReview);
export default router;