import Stripe from "stripe";
import dotenv from "dotenv";
import Product from "../models/Product.js";
import CartItem from "../models/CartItem.js";
import Cart from "../models/Cart.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const openStripePaymentLink = async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Buscar el cart_id asociado con el userId
    const cart = await Cart.findOne({ where: { user_id: userId } });
    if (!cart) {
      return res.status(400).json({ message: "Cart Not found" });
    }

    const cartId = cart.cart_id;

    const cartItems = await CartItem.findAll({
      where: { cart_id: cartId },
    });

    if (!cartItems.length) {
      return res.status(404).json({ message: "Cart items not found" });
    }

    const results = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await Product.findByPk(cartItem.product_id);
        if (!product) {
          return { success: false, error: "Product not found" };
        }
        return {
          success: true,
          product: product.dataValues,
          quantity: cartItem.quantity,
        };
      })
    );

    const lineItems = results
      .filter((result) => result.success)
      .map((result) => ({
        price_data: {
          product_data: {
            name: result.product.name,
            description: result.product.description,
            images: [result.product.image_url],
          },
          currency: "usd",
          unit_amount: Math.round(result.product.price * 100), // Asegúrate de que el precio esté en centavos y redondeado
        },
        quantity: result.quantity,
      }));

    if (lineItems.length === 0) {
      return res.status(400).json({ message: "No valid products found" });
    }

    const totalPrice = lineItems.reduce(
      (total, item) => total + item.price_data.unit_amount * item.quantity,
      0
    );

    const url =
      process.env.NODE_ENV === "production"
        ? process.env.PROD_URL
        : process.env.DEV_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${url}/api/payment/success/?totalPrice=${totalPrice / 100}&userID=${userId}`, // Dividir por 100 para convertir de centavos a dólares
      cancel_url: `${url}/api/payment/cancel`,
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "An error occurred while creating the payment session" });
  }
};
