import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
      
        const [rows] = await db.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

        const user = rows[0];

       
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(400).json({ message: "Credenciales inválidas" });
        }

       
        const token = jwt.sign(
            {
                id: user.id,
                nombre: user.name,
                email: user.email,
                rol: user.role
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
                rol: user.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Error en el servidor" });
    }
};
