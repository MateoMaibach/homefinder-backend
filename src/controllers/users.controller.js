// src/controllers/users.controller.js (REFATORIZADO CON SEQUELIZE)

// Importamos el Modelo de Usuario de Sequelize
import User from "../models/User.js"; 
import bcrypt from "bcryptjs"
import { Op } from "sequelize"; // Importamos Op para operaciones avanzadas (si fuera necesario)

// Nota: Eliminamos la importación 'pool' ya que ahora usamos el Modelo 'User'

/**
 * Función: GET /api/usuarios
 * Obtiene todos los usuarios
 */
export const obtenerUsuarios = async (req, res) => {
    try {
        // Sequelize: User.findAll() reemplaza SELECT * FROM users
        const users = await User.findAll({
            // Excluimos la contraseña y el hash en la respuesta
            attributes: { exclude: ['password_hash', 'password'] } 
        }); 
        
        res.json(users);
    } catch (error) {
        console.error("Error Sequelize (obtenerUsuarios):", error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

// ---

/**
 * Función: GET /api/usuarios/:id
 * Obtiene un usuario por su ID
 */
export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Sequelize: User.findByPk(id) reemplaza SELECT * FROM users WHERE id = ?
        const user = await User.findByPk(id, {
            // Excluimos campos sensibles
            attributes: { exclude: ['password_hash', 'password'] } 
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Sequelize devuelve directamente el objeto, no un array
        res.json(user);
    } catch (error) {
        console.error("Error Sequelize (obtenerUsuarioPorId):", error);
        res.status(500).json({ message: "Error al obtener el usuario" });
    }
};

// ---

/**
 * Función: POST /api/usuarios
 * Crea un nuevo usuario
 * Nota: El registro debería estar en auth.controller.js, pero lo refactorizamos aquí.
 */
export const crearUsuario = async (req, res) => {
    // Usamos 'name' y 'password_hash' para coincidir con tu lógica SQL anterior.
    const { name, email, password_hash: plainPassword, role } = req.body; 

    try {
        // 1. Verificar si el usuario ya existe (Mejor práctica con Sequelize)
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
             return res.status(400).json({ message: "El email ya está registrado." });
        }
        
        // 2. Hashear la contraseña (Lógica conservada)
        const password_hash = await bcrypt.hash(plainPassword, 10); 
        
        // 3. Sequelize: User.create() reemplaza INSERT INTO users
        const newUser = await User.create({
            name,
            email,
            password_hash, // Asegúrate que tu modelo User.js use 'password_hash'
            role,
            // Si el modelo tiene 'activo', puedes establecerlo aquí
            activo: true 
        });

        // 4. Devolvemos el objeto creado (Sequelize devuelve el objeto completo)
        res.status(201).json({
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });
    } catch (error) {
        console.error("Error Sequelize (crearUsuario):", error);
        // Manejar errores de validación o DB
        res.status(500).json({ message: "Error al crear usuario" });
    }
};

// ---

/**
 * Función: PUT /api/usuarios/:id
 * Actualiza un usuario
 */
export const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    // Solo permitimos actualizar estos campos
    const { name, email, role } = req.body; 

    try {
        // 1. Sequelize: User.update({...}) reemplaza UPDATE users SET... WHERE id = ?
        const [rowsAffected, [updatedUser]] = await User.update(
            { name, email, role }, // Datos a actualizar
            { 
                where: { id }, // Condición
                returning: true // Opción para MySQL: devuelve el objeto actualizado
            }
        );

        if (rowsAffected === 0) {
            return res.status(404).json({ message: "Usuario no encontrado o no se realizaron cambios" });
        }

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error("Error Sequelize (actualizarUsuario):", error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

// ---

/**
 * Función: DELETE /api/usuarios/:id
 * Elimina un usuario (Borrado físico)
 */
export const eliminarUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // Sequelize: User.destroy() reemplaza DELETE FROM users WHERE id = ?
        const rowsDeleted = await User.destroy({
            where: { id }
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