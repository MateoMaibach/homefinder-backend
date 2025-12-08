import { Router } from "express";
import {
  obtenerPropiedades,
  obtenerPropiedadPorId,
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad,
  subirImagenes,
} from "../controllers/propiedades.controller.js";

import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadImagesMiddleware } from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", obtenerPropiedades);
router.get("/:id", obtenerPropiedadPorId);
router.post("/", verifyToken, crearPropiedad);
router.put("/:id", verifyToken, actualizarPropiedad);
router.delete("/:id", verifyToken, eliminarPropiedad);

router.post(
  "/:propiedadId/imagenes",
  verifyToken,
  uploadImagesMiddleware,
  subirImagenes
);

export default router;
