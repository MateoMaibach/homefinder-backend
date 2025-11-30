import pool from "../config/db.js";


export const obtenerUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM usuarios");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

export const obtenerUsuarioPorId = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM usuarios WHERE id = ?", [req.params.id]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el usuario" });
    }
};


export const crearUsuario = async (req, res) => {
    const { nombre, email, password_hash, rol } = req.body;

    try {
        const [result] = await pool.query(
            "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)",
            [nombre, email, password_hash, rol]
        );

        res.status(201).json({ id: result.insertId, nombre, email, rol });
    } catch (error) {
        res.status(500).json({ message: "Error al crear usuario" });
    }
};


export const actualizarUsuario = async (req, res) => {
    const { nombre, email, rol } = req.body;

    try {
        const [result] = await pool.query(
            "UPDATE usuarios SET nombre = ?, email = ?, rol = ? WHERE id = ?",
            [nombre, email, rol, req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario" });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar usuario" });
    }
};
