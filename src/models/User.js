// src/models/User.js (CORREGIDO para created_at)

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password_hash: { 
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: { 
        type: DataTypes.STRING,
        defaultValue: 'user', 
    },
    // No definimos 'created_at' como campo aquí, ya que se maneja en las opciones.
}, {
    tableName: 'users', 
    // 1. Decirle a Sequelize que busque columnas con guiones bajos (underscored)
    underscored: true, 
    // 2. Decirle que SÍ use marcas de tiempo, pero con la convención de guion bajo
    timestamps: true,
    // 3. Opcional: Si solo tienes created_at pero NO updated_at, DEBES desactivarlo:
    updatedAt: false, // <-- Si no tienes columna 'updated_at' en la DB
    
    // Si tienes created_at y updated_at (ambos con guion bajo), usa solo:
    // underscored: true,
    // timestamps: true,
});

export default User;