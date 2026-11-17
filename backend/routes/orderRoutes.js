import express from "express";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/adminMiddleware.js";

const router = express.Router();
router.use(protect);
router.post("/", createOrder);
router.get("/myorders", getMyOrders);
router.get("/:id", getOrderById);
router.get("/", admin, getAllOrders);
router.put("/:id/status", admin, updateOrderStatus);
export default router;