// src/server.ts
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import db from './config/db'; // Importar para asegurar la conexión y tablas
import authRoutes from './routes/authRoutes';
import landingPageRoutes from './routes/landingPageRoutes';

dotenv.config(); // Cargar variables de entorno

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (las imágenes subidas)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'))); // Asegúrate de que esta ruta sea correcta

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/landing-pages', landingPageRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('Bienvenido al Backend de Landing Page Admin con TypeScript!');
});

// Manejo de errores global (opcional pero recomendado)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal en el servidor!');
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Manejo de cierre de la base de datos
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexión a la base de datos cerrada.');
        process.exit(0);
    });
});