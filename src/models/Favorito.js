import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Favorito = sequelize.define(
  'Favorito',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    propiedad_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'favoritos', 
    timestamps: false, 
    underscored: true,
  }
);

export default Favorito;