// src/models/Imagen.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js'; 
import Propiedad from './Propiedad.js';

const Imagen = sequelize.define('Imagen', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    propiedad_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        // Configuración de la clave foránea
        references: {
            model: Propiedad,
            key: 'id',
        }
    },
    url: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    public_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    // Opcional: Campo para indicar si es la imagen principal
    es_portada: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
}, {
    tableName: 'imagenes',
    timestamps: true,
});

// Definir la relación Uno a Muchos
Propiedad.hasMany(Imagen, {
    foreignKey: 'propiedad_id',
    as: 'imagenes', // Alias para incluir las imágenes en las consultas de Propiedad
});
Imagen.belongsTo(Propiedad, {
    foreignKey: 'propiedad_id',
    as: 'propiedad',
});

export default Imagen;