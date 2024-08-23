import express from "express";
import {
  createOrder,
  getOrder,
  updateOrder,
  addOrderItem,
  getOrderItems,
  updateOrderItem,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/", getOrder);
router.put("/:orderId", updateOrder);

router.post("/:orderId/items", addOrderItem); 
router.get("/:orderId/items", getOrderItems);
router.put("/items/:itemId", updateOrderItem);

export default router;
