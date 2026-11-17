import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", getCart);
router.post("/", addToCart);
router.put("/", updateCartItem);
router.delete("/:productId", removeFromCart);
router.post("/apply-coupon", applyCoupon);
router.delete("/", clearCart);
export default router;