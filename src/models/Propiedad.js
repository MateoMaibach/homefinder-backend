import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Propiedad = sequelize.define(
  "Propiedad",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    titulo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    precio: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tipo_operacion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    tipo_propiedad: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    ambientes: DataTypes.INTEGER,
    dormitorios: DataTypes.INTEGER,
    baños: DataTypes.INTEGER,
    cocheras: DataTypes.INTEGER,
    superficie_cubierta: DataTypes.DECIMAL(10, 2),
    superficie_total: DataTypes.DECIMAL(10, 2),
    antiguedad: {
      type: DataTypes.ENUM("a estrenar", "en construcción", "con antigüedad"),
      allowNull: false,
      defaultValue: "a estrenar",
    },

    calle: DataTypes.STRING(100),
    altura: DataTypes.STRING(10),
    ciudad: DataTypes.STRING(100),
    provincia: DataTypes.STRING(100),
    barrio: DataTypes.STRING(100),
    latitud: DataTypes.DECIMAL(10, 7),
    longitud: DataTypes.DECIMAL(10, 7),

    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "propiedades",
    timestamps: true,
    createdAt: "creado_en",
    updatedAt: false,
  }
);

export default Propiedad;
