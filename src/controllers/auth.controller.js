import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Op } from "sequelize";
import { sendResetEmail } from "../services/email.service.js";
import crypto from "crypto";

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "El correo es obligatorio." });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(200)
        .json({ message: "Solicitud de restblecimiento enviada." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + 1);
    user.tokenReset = resetToken;
    user.expiraReset = expirationDate;
    await user.save();
    await sendResetEmail(user.email, resetToken);

    res.status(200).json({
      message:
        "Se ha enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res
      .status(500)
      .json({ message: "Error interno al procesar la solicitud." });
  }
};

export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res
      .status(400)
      .json({ message: "El token y la nueva contraseña son obligatorios." });
  }

  try {
    const user = await User.findOne({
      where: {
        tokenReset: token,
        expiraReset: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "Token inválido o expirado." });
    }

    const salt = await bcrypt.genSalt(10);

    user.password_hash = await bcrypt.hash(newPassword, salt);

    user.tokenReset = null;
    user.expiraReset = null;

    await user.save();

    res.status(200).json({
      message: "Contraseña restablecida con éxito. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
};
