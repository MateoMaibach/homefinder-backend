import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { swaggerUi, swaggerSpec } from "./docs/swagger.js";

import authRoutes from "./routes/auth.routes.js";
import usuariosRoutes from "./routes/users.routes.js";
import propiedadesRoutes from "./routes/propiedades.routes.js";
import Propiedad from "./models/Propiedad.js";
import Imagen from "./models/imagen.js";

Propiedad.hasMany(Imagen, {
  foreignKey: "propiedad_id",
  as: "imagenes",
});
Imagen.belongsTo(Propiedad, {
  foreignKey: "propiedad_id",
  as: "propiedad",
});

dotenv.config();
const app = express();

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// RUTAS
app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/propiedades", propiedadesRoutes);
app.get("/", (req, res) => {
  res.send("API HomeFinder funcionando");
});

// SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Swagger: http://localhost:${PORT}/api/docs`);
});


