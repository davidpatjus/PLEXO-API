import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Product from "../models/Product.js";
import Cart from '../models/Cart.js'
import CartItem from '../models/CartItem.js'

// Crear una nueva orden
export const createOrder = async (req, res) => {
  try {
    const userId = await req.user.userId;
    const total = req.body.total;
    const newOrder = await Order.create({ user_id: userId, total });
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener una orden por ID
export const getOrder = async (req, res) => {
  try {
    const userId = await req.user.userId;
    const orders = await Order.findAll({
      where: { user_id: userId },
    });
    if (orders.length > 0) {
      res.status(200).json(orders);
    } else {
      res.status(404).json({ message: "El usuario no tiene ordenes" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar una orden
export const updateOrder = async (req, res) => {
  try {
    const orderId = req.user.userId;
    const order = await Order.findByPk(orderId);

    if (order) {
      if (order.status === "pending") {
        order.status = "success";
      } else if (order.status === "success") {
        order.status = "pending";
      }
      await order.save();
      res.status(200).json(order);
    } else {
      res.status(404).json({ message: "Orden no encontrada" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addOrderItem = async (req, res) => {
    try {
        const { orderId } = req.params;

        const userId = req.user.userId;
        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        const cartItems = await CartItem.findAll({ where: { cart_id: cart.cart_id } });

        if (cartItems.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        const orderItems = await Promise.all(cartItems.map(async (cartItem) => {
            const product = await Product.findByPk(cartItem.product_id);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${cartItem.product_id} not found` });
            }

            const price = product.price * cartItem.quantity;

            return {
                order_id: orderId,
                product_id: product.product_id,
                quantity: cartItem.quantity,
                price,
            };
        }));

        const createdOrderItems = await OrderItem.bulkCreate(orderItems);

        await CartItem.destroy({ where: { cart_id: cart.cart_id } });

        res.status(201).json(createdOrderItems);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getOrderItems = async (req, res) => {
  try {
    const { orderId } = req.params;
    const items = await OrderItem.findAll({
      where: { order_id: orderId },
      include: [Product],
    });

    const detailedItems = items.map((item) => ({
      order_item_id: item.order_item_id,
      product_name: item.Product.name,
      quantity: item.quantity,
      price: item.price,
    }));

    res.status(200).json(detailedItems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const updateOrderItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity, price } = req.body;
    const item = await OrderItem.findByPk(itemId);
    if (item) {
      item.quantity = quantity !== undefined ? quantity : item.quantity;
      item.price = price !== undefined ? price : item.price;
      await item.save();
      res.status(200).json(item);
    } else {
      res.status(404).json({ message: "Order item not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
