import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).json({ message: "Credenciales inválidas" });
    }
    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.name,
        email: user.email,
        rol: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      message: "Login exitoso",
      token,
      usuario: {
        id: user.id,
        nombre: user.name,
        email: user.email,
        rol: user.role,
      },
    });
  } catch (error) {
    console.error("Error Sequelize (login):", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
};
