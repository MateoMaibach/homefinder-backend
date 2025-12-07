// src/controllers/propiedades.controller.js (REFATORIZADO CON SEQUELIZE)

// Importamos los Modelos de Sequelize
import Propiedad from "../models/Propiedad.js";
import Imagen from "../models/Imagen.js"; 
import { sequelize } from "../config/db.js"; // Importamos sequelize para manejar transacciones
import { Op } from "sequelize"; // Para consultas WHERE más complejas

// ----------------------------------------------------------------------
// Función: POST /api/propiedades
// Crea una nueva propiedad
// ----------------------------------------------------------------------
export const crearPropiedad = async (req, res) => {
    const usuario_id = req.user.id; 
    
    const { 
        titulo, descripcion, precio, tipo_operacion, tipo_propiedad,
        ambientes, dormitorios, baños, cocheras, superficie_cubierta,
        superficie_total, antiguedad, calle, altura, ciudad, provincia, 
        barrio, latitud, longitud
    } = req.body;

    // Lógica de validación conservada
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
        // Sequelize: Propiedad.create() reemplaza el INSERT INTO
        const nuevaPropiedad = await Propiedad.create({
            usuario_id, titulo, descripcion, precio, tipo_operacion, tipo_propiedad,
            ambientes, dormitorios, baños, cocheras, superficie_cubierta,
            superficie_total, antiguedad, calle, altura, ciudad, provincia, barrio,
            latitud, longitud, 
            activo: false // Por defecto, hasta que se suban las imágenes
        });

        res.status(201).json({ 
            message: "Propiedad creada exitosamente. Esperando carga de imágenes.",
            id: nuevaPropiedad.id, // Sequelize devuelve el ID directamente
            usuario_id: usuario_id
        });

    } catch (error) {
        console.error("Error Sequelize (crearPropiedad):", error);
        res.status(500).json({ message: "Error interno del servidor al crear propiedad.", error: error.message });
    }
};

// ----------------------------------------------------------------------
// Función: GET /api/propiedades
// Obtiene todas las propiedades activas
// ----------------------------------------------------------------------
export const obtenerPropiedades = async (req, res) => {
    try {
        // Sequelize: Propiedad.findAll() reemplaza SELECT * FROM propiedades WHERE activo = 1
        const propiedades = await Propiedad.findAll({
            where: { activo: true },
            order: [['creado_en', 'DESC']], // 'createdAt' es la columna de Sequelize para creado_en
            // Incluir imágenes asociadas (opcional, pero mejor práctica)
            /*include: [{
                model: Imagen,
                as: 'imagenes',
                attributes: ['url', 'es_portada']
            }]
            */    
        });
        
        res.status(200).json(propiedades);
    } catch (error) {
        console.error("Error Sequelize (obtenerPropiedades):", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ----------------------------------------------------------------------
// Función: GET /api/propiedades/:id
// Obtiene una propiedad por su ID
// ----------------------------------------------------------------------
export const obtenerPropiedadPorId = async (req, res) => {
    const { id } = req.params;
    try {
        // Sequelize: Propiedad.findByPk(id) reemplaza SELECT * FROM propiedades WHERE id = ?
        const propiedad = await Propiedad.findByPk(id, {
            // Incluir imágenes
             include: [{
                model: Imagen,
                as: 'imagenes',
                attributes: ['url', 'es_portada']
            }]
        });
        
        if (!propiedad) {
            return res.status(404).json({ message: "Propiedad no encontrada." });
        }
        
        res.status(200).json(propiedad);
    } catch (error) {
        console.error("Error Sequelize (obtenerPropiedadPorId):", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ----------------------------------------------------------------------
// Función: PUT /api/propiedades/:id
// Actualiza una propiedad (con verificación de permisos)
// ----------------------------------------------------------------------
export const actualizarPropiedad = async (req, res) => {
    const { id } = req.params;
    const usuario_id_token = req.user.id; 
    const usuario_role_token = req.user.role; 
    
    // Obtenemos los campos del body que quieres actualizar
    const updateData = req.body; 
    
    try {
        // 1. Sequelize: Buscar la propiedad (reemplaza el primer SELECT)
        const propiedad = await Propiedad.findByPk(id, {
             attributes: ['usuario_id'] // Solo necesitamos el ID del dueño
        });
        
        if (!propiedad) {
            return res.status(404).json({ message: "Propiedad no encontrada." });
        }
        
        const propietario_id = propiedad.usuario_id;

        // 2. Control de Acceso (Autorización)
        if (propietario_id !== usuario_id_token && usuario_role_token !== 'admin') {
            return res.status(403).json({ message: "No tienes permisos para actualizar esta propiedad." });
        }

        // 3. Sequelize: Actualizar la propiedad (reemplaza el UPDATE)
        const [rowsAffected] = await Propiedad.update(
            updateData, // Sequelize mapea automáticamente las keys del objeto a las columnas
            {
                where: { id }
            }
        );

        if (rowsAffected === 0) {
            return res.status(400).json({ message: "No se pudo actualizar la propiedad o no se hicieron cambios." });
        }

        res.status(200).json({ message: "Propiedad actualizada correctamente." });
        
    } catch (error) {
        console.error("Error Sequelize (actualizarPropiedad):", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};

// ----------------------------------------------------------------------
// Función: DELETE /api/propiedades/:id
// Elimina una propiedad (Elimina imágenes primero usando Transacciones)
// ----------------------------------------------------------------------
export const eliminarPropiedad = async (req, res) => {
    const { id } = req.params;
    const usuario_id_token = req.user.id;
    const usuario_role_token = req.user.role;

    // Usaremos una Transacción para asegurar que o se elimina todo, o no se elimina nada
    const t = await sequelize.transaction();

    try {
        // 1. Sequelize: Verificar el dueño (Busca la propiedad)
        const propiedad = await Propiedad.findByPk(id, {
             attributes: ['usuario_id'],
             transaction: t
        });
        
        if (!propiedad) {
            await t.commit(); // No hay nada que deshacer
            return res.status(404).json({ message: "Propiedad no encontrada." });
        }
        
        const propietario_id = propiedad.usuario_id;

        // 2. Control de Acceso (Autorización)
        if (propietario_id !== usuario_id_token && usuario_role_token !== 'admin') {
            await t.commit(); 
            return res.status(403).json({ message: "No tienes permisos para eliminar esta propiedad." });
        }
        
        // 3. Sequelize: Eliminar Imágenes/Videos relacionados (reemplaza DELETE FROM imagenes_propiedad)
        // Nota: Asumimos que tu tabla de imágenes se llama 'Imagen' (o 'imagenes')
        await Imagen.destroy({ 
            where: { propiedad_id: id },
            transaction: t
        });
        
        // 4. Sequelize: Eliminar la Propiedad (reemplaza DELETE FROM propiedades)
        const rowsDeleted = await Propiedad.destroy({ 
            where: { id },
            transaction: t
        });

        if (rowsDeleted === 0) {
            await t.rollback(); // Si no se borró la propiedad (aunque es raro aquí), hacemos rollback
            return res.status(400).json({ message: "No se pudo eliminar la propiedad." });
        }

        // 5. Si todo fue exitoso, confirmamos la transacción
        await t.commit(); 

        res.status(200).json({ message: "Propiedad eliminada correctamente." });

    } catch (error) {
        // Si algo falla (DB, permisos, etc.), deshacemos los cambios
        await t.rollback(); 
        console.error("Error Sequelize (eliminarPropiedad):", error);
        res.status(500).json({ message: "Error interno del servidor." });
    }
};
// Exportamos las funciones restantes (actualizarPropiedad, eliminarPropiedad, etc.)