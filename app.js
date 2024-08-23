import sequelize from "./config/config.js";
import { authenticateJWT } from "./middleware/jwtMiddleware.js";
import usersRouter from "./routes/Users.routes.js";
import productsRouter from "./routes/Products.routes.js";
import categoriesRouter from "./routes/Categories.routes.js";
import authRouter from "./routes/auth.Routes.js";
import OrdersRouter from "./routes/Orders.Routes.js";
import CartsRoutes from "./routes/Carts.Routes.js";
import paymentRouter from "./routes/payment.routes.js";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import ImagesRoutes from './routes/Images.Routes.js';
const app = express();
const PORT = process.env.PORT;
console.log(PORT);

// Configuración de CORS
const whitelist = ["http://localhost:3000", "https://plexoshop.vercel.app"];
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (whitelist.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    optionsSuccessStatus: 200,
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
  })
);
app.use(express.json());

// Rutas de autenticación
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/categories", categoriesRouter);

// Rutas protegidas con JWT
app.use("/api/payment", paymentRouter);
app.use("/api/users", authenticateJWT, usersRouter);
app.use("/api/orders", authenticateJWT, OrdersRouter);
app.use("/api/carts", authenticateJWT, CartsRoutes);
app.use("/api/images", ImagesRoutes);
app.use("/", (req,res) =>{
  res.json({Wellcome: "Wellcome to PlexoShop API"})
} )
app.use((req, res) => {
  res.status(404).json({
    message: "Not found the endpoint",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Problemas con el servidor");
});

sequelize
  .sync()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`El servidor está escuchando en el puerto: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error de conexión con la base de datos:", err);
  });
