// src/routes/landingPageRoutes.ts
import { Router } from 'express';
import {
    getAllLandingPages,
    getLandingPageBySlug,
    createLandingPage,
    updateLandingPage,
    deleteLandingPage
} from '../controllers/landingPageController';
import { authenticateToken } from '../middleware/authMiddleware';
import upload from '../utils/fileHandler'; // Multer para carga de archivos

const router = Router();

// Rutas públicas (cualquiera puede ver las landing pages)
router.get('/', getAllLandingPages);
router.get('/:slug', getLandingPageBySlug);

// Rutas protegidas (requieren autenticación)
// Usamos .single('main_image') para esperar una sola imagen con el campo 'main_image'
router.post('/', authenticateToken, upload.single('main_image'), createLandingPage);
router.put('/:id', authenticateToken, upload.single('main_image'), updateLandingPage);
router.delete('/:id', authenticateToken, deleteLandingPage);

export default router;