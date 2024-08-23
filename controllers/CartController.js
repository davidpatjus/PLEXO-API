import Cart from "../models/Cart.js";
import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

export const createCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const existingCart = await Cart.findOne({ where: { user_id: userId } });
    if (existingCart) {
      return res.status(200).json(existingCart);
    }

    const newCart = await Cart.create({ user_id: userId });
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCartByUserId = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({
      where: { user_id: userId },
    });

    if (cart) {
      res.status(200).json(cart);
    } else {
      res.status(404).json({ message: "Cart not found for this user" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    const { productName, quantity } = req.body;
    if (!productName) {
      return res.status(400).json({ message: "Product name is required" });
    }
    if (quantity <= 0 || !quantity) {
      return res
        .status(400)
        .json({ message: "Quantity should be greater than 0" });
    }

    const product = await Product.findOne({ where: { name: productName } });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    const existingItem = await CartItem.findOne({
      where: {
        cart_id: cart.cart_id,
        product_id: product.product_id,
      },
    });

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity;
      if (product.stock < updatedQuantity) {
        return res.status(400).json({ message: "Not enough stock" });
      }

      existingItem.quantity = updatedQuantity;
      await existingItem.save();
      return res.status(200).json(existingItem);
    }

    const newItem = await CartItem.create({
      cart_id: cart.cart_id,
      product_id: product.product_id,
      quantity,
    });

    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(404).json({ error: "Cart not found for this user" });
    }

    const cartId = cart.cart_id;
    const items = await CartItem.findAll({
      where: { cart_id: cartId },
    });

    if (items.length === 0) {
      return res.status(404).json({ error: "No items found in the cart" });
    }

    const detailedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findOne({
          where: { product_id: item.product_id },
        });
        return {
          cart_item_id: item.cart_item_id,
          quantity: item.quantity,
          product: product,
        };
      })
    );

    res.status(200).json(detailedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const updateCartItem = async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const item = await CartItem.findByPk(itemId);

    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    item.quantity = quantity !== undefined ? quantity : item.quantity;

    await item.save();
    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const incrementCartItemQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    const cartItem = await CartItem.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const product = await Product.findByPk(cartItem.product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (cartItem.quantity >= product.stock) {
      return res.status(400).json({ message: "Not enough stock" });
    }

    cartItem.quantity += 1;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const decrementCartItemQuantity = async (req, res) => {
  try {
    const { cartItemId } = req.body;
    const cartItem = await CartItem.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    if (cartItem.quantity <= 1) {
      return res
        .status(400)
        .json({ message: "Quantity cannot be less than 1" });
    }

    cartItem.quantity -= 1;
    await cartItem.save();

    res.status(200).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const deleteCartItem = async (req, res) => {
  try {
    const { cartItemId } = req.body;

    if (!cartItemId) {
      return res.status(404).json({ message: "Cart item ID is required" });
    }

    const cartItem = await CartItem.findByPk(cartItemId);

    if (!cartItem) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    await cartItem.destroy();
    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
