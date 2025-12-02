// src/controllers/propiedades.controller.js
import db from "../config/db.js";

export const crearPropiedad = async (req, res) => {
    const usuario_id = req.user.id; 
    
    // Incluimos latitud y longitud en la desestructuración
    const { 
        titulo, descripcion, precio, tipo_operacion, tipo_propiedad,
        ambientes, dormitorios, baños, cocheras, superficie_cubierta,
        superficie_total, antiguedad, calle, altura, ciudad, provincia, 
        barrio, latitud, longitud
    } = req.body;

    if (superficie_cubierta > superficie_total) {
        return res.status(400).json({ 
            message: "Error de validación: La superficie cubierta no puede ser mayor que la superficie total." 
        });
    }
    
        if (superficie_cubierta && !superficie_total) {
         return res.status(400).json({ 
            message: "Error de validación: Debe especificar la superficie total si especifica la cubierta." 
        });
    }

    try {
        const [result] = await db.execute(
            `INSERT INTO propiedades (
                usuario_id, titulo, descripcion, precio, tipo_operacion, tipo_propiedad, 
                ambientes, dormitorios, baños, cocheras, superficie_cubierta, 
                superficie_total, antiguedad, calle, altura, ciudad, provincia, barrio, 
                latitud, longitud, activo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                usuario_id, titulo, descripcion, precio, tipo_operacion, tipo_propiedad,
                ambientes, dormitorios, baños, cocheras, superficie_cubierta,
                superficie_total, antiguedad, calle, altura, ciudad, provincia, barrio,
                latitud, longitud, // <-- Insertamos las coordenadas
                0 // ACTIVO=0: Inactiva hasta que se suban imágenes
            ]
        );

        res.status(201).json({ 
            message: "Propiedad creada exitosamente. Esperando carga de imágenes.",
            id: result.insertId,
            usuario_id: usuario_id
        });

    } catch (error) {
        console.error("Error al crear la propiedad:", error);
        res.status(500).json({ message: "Error interno del servidor al crear propiedad." });
    }
};


export const obtenerPropiedades = async (req, res) => {
    try {
        const [rows] = await db.execute("SELECT * FROM propiedades WHERE activo = 1 ORDER BY creado_en DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Error al obtener propiedades:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

export const obtenerPropiedadPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute("SELECT * FROM propiedades WHERE id = ?", [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Propiedad no encontrada." });
        }
        
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Error al obtener propiedad:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

export const actualizarPropiedad = async (req, res) => {
    const { id } = req.params;
    const usuario_id_token = req.user.id; 
    const usuario_role_token = req.user.role; 

    const { 
        titulo, descripcion, precio, tipo_operacion, tipo_propiedad,
        ambientes, dormitorios, baños, cocheras, superficie_cubierta,
        superficie_total, antiguedad, calle, altura, ciudad, provincia, barrio, activo
    } = req.body;

    try {
        const [propiedad] = await db.execute("SELECT usuario_id FROM propiedades WHERE id = ?", [id]);
        
        if (propiedad.length === 0) {
            return res.status(404).json({ message: "Propiedad no encontrada." });
        }
        
        const propietario_id = propiedad[0].usuario_id;

        if (propietario_id !== usuario_id_token && usuario_role_token !== 'admin') {
            return res.status(403).json({ message: "No tienes permisos para actualizar esta propiedad." });
        }

        const [result] = await db.execute(
            `UPDATE propiedades SET 
                titulo=?, descripcion=?, precio=?, tipo_operacion=?, tipo_propiedad=?,
                ambientes=?, dormitorios=?, baños=?, cocheras=?, superficie_cubierta=?,
                superficie_total=?, antiguedad=?, calle=?, altura=?, ciudad=?, provincia=?, barrio=?, activo=?
            WHERE id=?`,
            [
                titulo, descripcion, precio, tipo_operacion, tipo_propiedad,
                ambientes, dormitorios, baños, cocheras, superficie_cubierta,
                superficie_total, antiguedad, calle, altura, ciudad, provincia, barrio, activo, id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "No se pudo actualizar la propiedad." });
        }

        res.status(200).json({ message: "Propiedad actualizada correctamente." });
        
    } catch (error) {
        console.error("Error al actualizar la propiedad:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

export const eliminarPropiedad = async (req, res) => {
    const { id } = req.params;
    const usuario_id_token = req.user.id;
    const usuario_role_token = req.user.role;

    try {
        // 1. Verificar el dueño
        const [propiedad] = await db.execute("SELECT usuario_id FROM propiedades WHERE id = ?", [id]);
        
        if (propiedad.length === 0) {
            return res.status(404).json({ message: "Propiedad no encontrada." });
        }
        
        const propietario_id = propiedad[0].usuario_id;

        // 2. Control de Acceso (Autorización)
        if (propietario_id !== usuario_id_token && usuario_role_token !== 'admin') {
            return res.status(403).json({ message: "No tienes permisos para eliminar esta propiedad." });
        }
        
        // 3. Eliminar Imágenes/Videos relacionados primero (para evitar error de clave foránea)
        await db.execute("DELETE FROM imagenes_propiedad WHERE propiedad_id = ?", [id]);
        
        // 4. Eliminar la Propiedad
        const [result] = await db.execute("DELETE FROM propiedades WHERE id = ?", [id]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "No se pudo eliminar la propiedad." });
        }

        res.status(200).json({ message: "Propiedad eliminada correctamente." });

    } catch (error) {
        console.error("Error al eliminar la propiedad:", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};