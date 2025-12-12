import { Router } from "express";
import {
  obtenerPropiedades,
  obtenerPropiedadPorId,
  crearPropiedad,
  actualizarPropiedad,
  eliminarPropiedad,
  subirImagenes,
  setCoverImage,
  deleteImage,
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

router.put(
  "/:propiedadId/imagenes/:imagenId/portada",
  verifyToken,
  setCoverImage
);

router.delete("/:propiedadId/imagenes/:imagenId", verifyToken, deleteImage);

export default router;
