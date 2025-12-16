import { Router } from "express";
import {
  toggleFavorito,
  getFavoritos,
  isFavorito,
} from "../controllers/favorito.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.put("/propiedades/:propiedadId/favorito", verifyToken, toggleFavorito);
router.get("/favoritos", verifyToken, getFavoritos);
router.get("/propiedades/:propiedadId/is-favorito", verifyToken, isFavorito);

export default router;
