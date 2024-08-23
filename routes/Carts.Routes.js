import express from "express";
import {
  createCart,
  getCartByUserId,
  addCartItem,
  getCartItems,
  updateCartItem,
  decrementCartItemQuantity,
  incrementCartItemQuantity,
  deleteCartItem
} from "../controllers/CartController.js";
import { authenticateJWT } from '../middleware/jwtMiddleware.js'

const router = express.Router();

router.post("/",authenticateJWT, createCart); // Listo
router.get("/",authenticateJWT, getCartByUserId); // Listo
router.post("/items",authenticateJWT, addCartItem); // Listo
router.get("/items",authenticateJWT, getCartItems); //Listo
router.put("/items",authenticateJWT, updateCartItem); // Listo
router.delete("/items", authenticateJWT, deleteCartItem)
router.patch("/items/add", authenticateJWT, incrementCartItemQuantity)
router.patch("/items/minus", authenticateJWT, decrementCartItemQuantity)
export default router;
