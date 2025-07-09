// src/config/db.ts
import sqlite3 from 'sqlite3';
import path from 'path';

// Asegura que la ruta de la DB es relativa a la raíz del proyecto
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Crear tabla de usuarios
        db.run(`CREATE TABLE IF NOT EXISTS tbl_usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err: Error | null) => {
            if (err) {
                console.error('Error al crear la tabla tbl_usuarios:', err.message);
            } else {
                console.log('Tabla tbl_usuarios asegurada.');
            }
        });

        // Crear tabla de landing pages
        db.run(`CREATE TABLE IF NOT EXISTS tbl_landing_pages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            subtitle TEXT,
            description TEXT,
            main_image TEXT,
            cta_link TEXT,
            cta_text TEXT,
            content_html TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err: Error | null) => {
            if (err) {
                console.error('Error al crear la tabla tbl_landing_pages:', err.message);
            } else {
                console.log('Tabla tbl_landing_pages asegurada.');
            }
        });
    }
});

export default db;