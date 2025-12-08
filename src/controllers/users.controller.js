import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

export const obtenerUsuarios = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password_hash", "password"] },
    });

    res.json(users);
  } catch (error) {
    console.error("Error Sequelize (obtenerUsuarios):", error);
    res.status(500).json({ message: "Error al obtener usuarios" });
  }
};

export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password_hash", "password"] },
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error Sequelize (obtenerUsuarioPorId):", error);
    res.status(500).json({ message: "Error al obtener el usuario" });
  }
};

export const crearUsuario = async (req, res) => {
  const { name, email, password_hash: plainPassword, role } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }
    const password_hash = await bcrypt.hash(plainPassword, 10);
    const newUser = await User.create({
      name,
      email,
      password_hash,
      role,
      activo: true,
    });
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (error) {
    console.error("Error Sequelize (crearUsuario):", error);
    res.status(500).json({ message: "Error al crear usuario" });
  }
};

export const actualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  try {
    const [rowsAffected, [updatedUser]] = await User.update(
      { name, email, role },
      {
        where: { id },
        returning: true,
      }
    );

    if (rowsAffected === 0) {
      return res
        .status(404)
        .json({ message: "Usuario no encontrado o no se realizaron cambios" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error Sequelize (actualizarUsuario):", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const rowsDeleted = await User.destroy({
      where: { id },
    });

    if (rowsDeleted === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("Error Sequelize (eliminarUsuario):", error);
    res.status(500).json({ message: "Error al eliminar usuario" });
  }
};
