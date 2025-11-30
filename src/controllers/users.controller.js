import pool from "../config/db.js";
import bcrypt from "bcryptjs"

export const obtenerUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM users");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE id = ?",
            [req.params.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener el usuario" });
    }
};

export const crearUsuario = async (req, res) => {
    
    const { name, email, password_hash: plainPassword, role } = req.body; 

    try {
        
        const password_hash = await bcrypt.hash(plainPassword, 10); 
        
        const [result] = await pool.query(
    
            "INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)",
            [name, email, password_hash, role] 
        );

        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al crear usuario" });
    }
};


export const actualizarUsuario = async (req, res) => {
    const { name, email, role } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?",
            [name, email, role, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const [result] = await pool.query(
            "DELETE FROM users WHERE id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
};
