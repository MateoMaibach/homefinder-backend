import express from "express";
import cors from "cors";
import { swaggerSpec, swaggerUi } from "./docs/swagger.js";

const app = express();

app.use(cors());
app.use(express.json());


app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;
