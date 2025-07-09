// src/utils/fileHandler.ts
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ruta absoluta al directorio 'uploads' en la raíz del proyecto
const uploadsDir = path.resolve(__dirname, '../../uploads');

// Asegurarse de que el directorio 'uploads' exista. Si no, lo crea.
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true }); // 'recursive: true' crea directorios padres si no existen
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir); // Directorio donde se guardarán los archivos
    },
    filename: (req, file, cb) => {
        // Generar un nombre de archivo único para evitar colisiones
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Limite de tamaño de archivo: 5MB
    fileFilter: (req, file, cb) => {
        // Filtro para aceptar solo imágenes comunes
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error("Solo se permiten archivos de imagen (jpeg, jpg, png, gif)"));
    }
});

export default upload;