import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserSchema from "../schemas/UserShema.js";
import { authenticateJWT } from "../middleware/jwtMiddleware.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, email, password, first_name, last_name } = req.body;

  try {
    UserSchema.parse(req.body);
  } catch (error) {
    return res.status(401).json({ message: "credenciales invalidas como tu" });
  }
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El usuario ya está registrado." });
    }

    const newUser = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
    });

    return res.status(201).json(newUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error en el servidor." });
  }
});


router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "Usuario No Existente" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign(
      { userId: user.user_id, email: user.email, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Configurar la cookie
    res.cookie("plexoCookie", token, {
      httpOnly: true,
      secure: true, 
      sameSite: 'none', 
      overwrite: true
    });

    // Enviar la respuesta JSON con el token y otros datos
    res.json({
      message: "Login exitoso",
      userId: user.user_id,
      username: user.username,
      admin: user.admin,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


// Eliminar la cookie
router.get("/logout", authenticateJWT, (req, res) => {
  try {
    // Destruir la cookie del token estableciendo su tiempo de expiración en el pasado
    res.cookie("plexoCookie", "", { 
      expires: new Date(0),
      secure: true, // Si estás usando HTTPS
      httpOnly: true, // Si la cookie es httpOnly
      sameSite: 'none' // Ajusta según tu configuración de sameSite
    });
    
    // Eliminar la cookie
    res.clearCookie("plexoCookie", { 
      secure: true, // Si estás usando HTTPS
      httpOnly: true, // Si la cookie es httpOnly
      sameSite: 'none' // Ajusta según tu configuración de sameSite
    });

    res.json({ message: "Logout exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
});


export default router;
