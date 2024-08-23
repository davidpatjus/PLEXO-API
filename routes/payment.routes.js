import express from "express";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import CartItem from "../models/CartItem.js";
import { openStripePaymentLink } from "../controllers/paymentController.js";
import bravo from "@getbrevo/brevo";
import User from "../models/User.js";
import { authenticateJWT } from "../middleware/jwtMiddleware.js";


const router = express.Router();

const apiInstance = new bravo.TransactionalEmailsApi();
apiInstance.setApiKey(
  bravo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_SECRET_KEY
);

router.post("/create-checkout-session", authenticateJWT, openStripePaymentLink);

router.get("/success", async (req, res) => {
  try {
    const { totalPrice, userID } = req.query;
    if (!totalPrice || !userID) {
      return res.status(400).json({ message: "Solicitud inválida" });
    }

    const cart = await Cart.findOne({
      where: { user_id: userID },
      raw: true,
    });

    if (!cart) {
      return res
        .status(404)
        .json({ message: "No hay carrito para ese usuario" });
    }

    const cartItems = await CartItem.findAll({
      where: { cart_id: cart.cart_id },
      raw: true,
    });

    if (cartItems.length === 0) {
      return res.status(404).json({ message: "El carrito está vacío" });
    }

    const inventory = await Promise.all(
      cartItems.map(async (cartItem) => {
        const product = await Product.findByPk(cartItem.product_id);
        return product;
      })
    );

    for (let i = 0; i < inventory.length; i++) {
      if (inventory[i].stock < cartItems[i].quantity) {
        return res.status(400).json({ message: "No hay suficiente stock" });
      }
    }

    const order = await Order.create({
      user_id: userID,
      total: totalPrice,
    });

    await Promise.all(
      cartItems.map(async (cartItem, index) => {
        await OrderItem.create({
          order_id: order.order_id,
          product_id: cartItem.product_id,
          quantity: cartItem.quantity,
          price: inventory[index].price,
        });
      })
    );

    for (let i = 0; i < inventory.length; i++) {
      const newStock = inventory[i].stock - cartItems[i].quantity;

      await Product.update(
        { stock: newStock },
        { where: { product_id: cartItems[i].product_id } }
      );

      if (newStock < 10) {
        const admins = await User.findAll({
          where: { admin: 1 },
          raw: true,
        });

        const product = await Product.findByPk(cartItems[i].product_id);

        const sendSmtpEmail = new bravo.SendSmtpEmail();
        sendSmtpEmail.subject = "Alerta: Bajo stock en un producto";
        sendSmtpEmail.to = admins.map((admin) => ({
          email: admin.email,
          name: admin.first_name,
        }));
        sendSmtpEmail.htmlContent = `
          <h1>Alerta: Bajo stock en un producto</h1>
          <p>El producto ${product.name} tiene un stock bajo (${newStock} unidades).</p>
          <p>Por favor, gestiona el inventario.</p>
        `;
        sendSmtpEmail.sender = {
          name: "Plexo",
          email: "jordanvalenciap@gmail.com",
        };

        await apiInstance.sendTransacEmail(sendSmtpEmail);
      }
    }

    await CartItem.destroy({ where: { cart_id: cart.cart_id } });

    const user = await User.findByPk(userID);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    let orderDetails = `<h2>Detalles de tu orden:</h2><ul>`;
    for (let i = 0; i < cartItems.length; i++) {
      orderDetails += `<li>Producto: ${inventory[i].name} - Cantidad: ${cartItems[i].quantity} - Precio: $${inventory[i].price}</li>`;
    }
    orderDetails += `</ul><p>Total: $${totalPrice}</p>`;

    const sendSmtpEmail = new bravo.SendSmtpEmail();
    sendSmtpEmail.subject = "Detalles de tu orden - Plexo";
    sendSmtpEmail.to = [{ email: user.email, name: user.first_name }];
    sendSmtpEmail.htmlContent = `
      <h1>Hola ${user.first_name}, gracias por tu compra</h1>
      <p>Tu pago ha sido procesado correctamente. Aqui están los detalles de tu orden:</p>
      ${orderDetails}
      <p>Gracias por elegirnos.</p>
    `;
    sendSmtpEmail.sender = {
      name: "Plexo",
      email: "jordanvalenciap@gmail.com",
    };

    const results = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(results);

    return res.redirect(
      "https://plexoshop.vercel.app/payment-success"
    ); 
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Error al crear la orden" });
  }
});

router.get("/cancel", (req, res) => {
  res.status(200).json({ message: "Payment cancelled" });
  return res.redirect(`https://plexoshop.vercel.app/payment-failed`);
});

export default router;
