// lib/db.js
// Ce fichier gère la connexion à la base de données MySQL et fournit des fonctions utilitaires pour les requêtes

import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'larythmo',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true
});

export default pool;

export async function initializeDatabase() {
    try {
        const sqlFilePath = path.join(process.cwd(), 'lib', 'schema.sql');
        const sqlFileContent = await fs.readFile(sqlFilePath, 'utf-8');
        const connection = await pool.getConnection();
        await connection.query(sqlFileContent);
        connection.release();
        console.log('Database initialized successfully');
        return { success: true };
    } catch (error) {
        console.error('Error initializing database:', error);
        return { success: false, error: error.message };
    }
}