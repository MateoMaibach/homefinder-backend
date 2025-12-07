// src/config/db.js 
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// 1. Configuración de la conexión a MySQL con Sequelize
export const sequelize = new Sequelize(
    process.env.DB_NAME,       
    process.env.DB_USER,       
    process.env.DB_PASSWORD,   
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', 
        logging: false, // Puedes cambiar a true temporalmente para ver las queries SQL
        define: {
            timestamps: true, 
            freezeTableName: true // Evita que el nombre de la tabla se pluralice
        }
    }
);

// 2. Función para verificar y autenticar la conexión
export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos establecida con Sequelize.');
    } catch (error) {
        console.error('No se pudo conectar a la base de datos:', error);
    }
};

export default sequelize;