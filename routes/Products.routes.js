import z from "zod";
import express from "express";
import OrderItem from "../models/OrderItem.js";
import sequelize from "../config/config.js";
import Product from "../models/Product.js";
import ProductSchema from "../schemas/ProductShema.js";
import CartItem from "../models/CartItem.js";
import { isAdmin } from "../middleware/authMiddleware.js";
import { authenticateJWT } from "../middleware/jwtMiddleware.js";
import Category from "../models/Category.js";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/",authenticateJWT,isAdmin, async (req, res) => {
  try {
    // Validar los datos del producto con Zod
    const productData = ProductSchema.parse(req.body);

    // Verificar si existe la categoría
    const category = await Category.findByPk(productData.category_id);
    if (!category) {
      return res
        .status(400)
        .json({ message: "La categoría especificada no existe." });
    }

    // Comprobar si el producto ya existe por su nombre
    const existingProduct = await Product.findOne({
      where: { name: productData.name },
    });


    const newProduct = await Product.create(productData);

    res.status(201).json(newProduct);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Datos de producto inválidos", errors: err.errors });
    } else {
      console.error("Error al crear el producto:", err);
      res.status(500).json({ message: "Error interno del servidor" });
    }
  }
});

router.get("/:product_id", async (req, res) => {
  const product_id = req.params.product_id;
  const product = await Product.findByPk(product_id);
  res.status(200).json({
    product,
  });
});

router.put("/:product_id",authenticateJWT,isAdmin, async (req, res) => {
  try {
    const product_id = req.params.product_id;
    if (!product_id) {
      return res.status(405).json({ message: "Product ID is required" });
    }

    // Obtener los datos del cuerpo de la solicitud
    const {
      name,
      description,
      price,
      stock,
      image_url,
      category_id,
      // Agrega aquí otros campos si es necesario
    } = req.body;

    // Construir el objeto con los datos actualizados del producto
    const updatedProduct = {
      name,
      description,
      price,
      stock,
      image_url,
      category_id,
    };

    // Intentar actualizar el producto
    const [updatedRowsCount] = await Product.update(updatedProduct, {
      where: { product_id: product_id },
      returning: true,
    });

    // Comprobar si el producto fue actualizado
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Devolver el producto actualizado
    const updatedProductData = await Product.findOne({
      where: { product_id: product_id },
    });

    res.json(updatedProductData);
  } catch (err) {
    console.error(err);

    // Devolver un mensaje de error genérico
    res
      .status(500)
      .json({ message: "An error occurred while updating the product" });
  }
});

router.delete("/:id",authenticateJWT,isAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    await CartItem.destroy({ where: { product_id: productId } });

    await OrderItem.destroy({ where: { product_id: productId } });

    const rowsDeleted = await Product.destroy({
      where: { product_id: productId },
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product, CartItems, and OrderItems deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res
      .status(500)
      .json({ message: "Failed to delete product and related items" });
  }
});

export default router;
