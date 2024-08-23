import express from "express";
import Category from "../models/Category.js";
import CategorySchema from "../schemas/CategorySchema.js";
import { authenticateJWT } from "../middleware/jwtMiddleware.js"; // Importamos el middleware JWT
import { isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
      }
      res.json(category);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
        }
})

router.post("/", authenticateJWT, isAdmin, async (req, res) => {
  // Protegemos la ruta con authenticateJWT
  try {
    const categoryData = CategorySchema.parse(req.body);
    const newCategory = await Category.create(categoryData);
    res.status(201).json(newCategory);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.errors });
  }
});

export default router;
