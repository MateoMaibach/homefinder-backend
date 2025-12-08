import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Imagen = sequelize.define(
  "Imagen",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    propiedad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    tipo_recurso: {
      type: DataTypes.ENUM("imagen", "video"),
      allowNull: false,
      defaultValue: "imagen",
    },

    es_portada: {
      type: DataTypes.BOOLEAN,
      field: "es_principal",
      defaultValue: false,
    },
    creado_en: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "imagenes_propiedad",
    timestamps: false,
  }
);

export default Imagen;
