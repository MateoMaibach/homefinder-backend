// src/routes/propiedades.routes.js
import { Router } from "express";
import { 
    obtenerPropiedades, 
    obtenerPropiedadPorId, 
    crearPropiedad, 
    actualizarPropiedad, 
    eliminarPropiedad 
} from "../controllers/propiedades.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js"; 

const router = Router();

// Rutas Públicas - OJO: Solo mostramos propiedades activas
router.get("/", obtenerPropiedades);
router.get("/:id", obtenerPropiedadPorId);

// Rutas Protegidas - Requisito: Usuario Autenticado
router.post("/", verifyToken, crearPropiedad);
router.put("/:id", verifyToken, actualizarPropiedad);
router.delete("/:id", verifyToken, eliminarPropiedad); 

export default router;