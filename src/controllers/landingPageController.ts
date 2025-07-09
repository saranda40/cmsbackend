// src/controllers/landingPageController.ts
import { Request, Response } from 'express';
import db from '../config/db';
import { tbl_landing_page } from '../models/landingPage';
import fs from 'fs';
import path from 'path';
import { RunResult } from 'sqlite3';

const UPLOADS_BASE_PATH = path.resolve(__dirname, '../../uploads');

// Obtener todas las landing pages
export const getAllLandingPages = (req: Request, res: Response) => {
    db.all("SELECT * FROM tbl_landing_page", [], (err: Error | null, rows: tbl_landing_page[]) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            message: "success",
            data: rows
        });
    });
};

// Obtener una landing page por slug
export const getLandingPageBySlug = (req: Request, res: Response) => {
    const slug = req.params.slug;
    db.get("SELECT * FROM tbl_landing_page WHERE slug = ?", [slug], (err: Error | null, row: tbl_landing_page) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ message: "Landing page no encontrada." });
            return;
        }
        res.json({
            message: "success",
            data: row
        });
    });
};

const deleteImage = (imagePath: string | undefined) => {
    if (imagePath && imagePath.startsWith('/uploads/')) {
        const fullPath = path.join(UPLOADS_BASE_PATH, path.basename(imagePath));
        fs.unlink(fullPath, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`Intento de eliminar imagen que no existe: ${fullPath}`);
                } else {
                    console.error('Error al eliminar la imagen:', fullPath, err);
                }
            } else {
                console.log(`Imagen eliminada: ${fullPath}`);
            }
        });
    }
};

// Crear una nueva landing page
export const createLandingPage = (req: Request, res: Response) => {
    const { slug, title, subtitle, description, cta_link, cta_text, content_html } = req.body;
    const main_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    if (!slug || !title) {
        if (main_image) deleteImage(main_image);
        return res.status(400).json({ error: 'Slug y título son obligatorios.' });
    }

    const stmt = db.prepare(`INSERT INTO tbl_landing_pages (slug, title, subtitle, description, main_image, cta_link, cta_text, content_html) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    stmt.run(slug, title, subtitle, description, main_image, cta_link, cta_text, content_html, function(this: RunResult, err: Error | null) { 
        if (err) {
            if (main_image) deleteImage(main_image);
            if (err.message.includes('UNIQUE constraint failed: landing_pages.slug')) {
                return res.status(409).json({ error: 'Ya existe una landing page con este slug.' });
            }
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({
            message: "Landing page creada con éxito",
            id: this.lastID, // Ahora TypeScript sabe que 'this' tiene 'lastID'
            data: { slug, title, main_image }
        });
    });
    stmt.finalize();
};


// Actualizar una landing page
export const updateLandingPage = (req: Request, res: Response) => {
    const id = req.params.id;
    const { slug, title, subtitle, description, cta_link, cta_text, content_html } = req.body;
    const new_main_image = req.file ? `/uploads/${req.file.filename}` : undefined;

    db.get("SELECT main_image FROM tbl_landing_page WHERE id = ?", [id], (err: Error | null, existingPage: tbl_landing_page) => {
        if (err) {
            // Si hay un nuevo archivo y hay un error de DB, eliminamos el archivo
            if (new_main_image) fs.unlinkSync(path.join(__dirname, `../../${new_main_image}`));
            return res.status(500).json({ error: err.message });
        }
        if (!existingPage) {
            // Si hay un nuevo archivo y la página no existe, eliminamos el archivo
            if (new_main_image) fs.unlinkSync(path.join(__dirname, `../../${new_main_image}`));
            return res.status(404).json({ message: "Landing page no encontrada para actualizar." });
        }

        const current_image = existingPage.main_image;
        const main_image_to_save = new_main_image || current_image; // Usar la nueva imagen si existe, sino la actual

        const query = `UPDATE tbl_landing_page SET slug = ?, title = ?, subtitle = ?, description = ?, main_image = ?, cta_link = ?, cta_text = ?, content_html = ? WHERE id = ?`;
        db.run(query,
            [slug, title, subtitle, description, main_image_to_save, cta_link, cta_text, content_html, id],
            function(err: Error | null) {
                if (err) {
                    // Si hay un nuevo archivo y hay un error de DB, eliminamos el archivo
                    if (new_main_image) fs.unlinkSync(path.join(__dirname, `../../${new_main_image}`));
                    if (err.message.includes('UNIQUE constraint failed: tbl_landing_page.slug')) {
                        return res.status(409).json({ error: 'Ya existe una landing page con este slug.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                if (this.changes === 0) {
                    // Si no se actualizó ninguna fila, podría ser porque el ID no existe o no hay cambios
                    return res.status(404).json({ message: "Landing page no encontrada o no se realizaron cambios." });
                }

                // Si se subió una nueva imagen y había una imagen anterior, la eliminamos
                if (new_main_image && current_image && current_image !== new_main_image) {
                    const oldImagePath = path.join(__dirname, `../../${current_image}`);
                    fs.unlink(oldImagePath, (err) => {
                        if (err) console.error('Error al eliminar la imagen antigua:', oldImagePath, err);
                    });
                }

                res.json({ message: "Landing page actualizada con éxito", changes: this.changes });
            }
        );
    });
};

// Eliminar una landing page
export const deleteLandingPage = (req: Request, res: Response) => {
    const id = req.params.id;

    db.get("SELECT main_image FROM tbl_landing_page WHERE id = ?", [id], (err: Error | null, page: tbl_landing_page) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!page) {
            return res.status(404).json({ message: "Landing page no encontrada para eliminar." });
        }

        db.run(`DELETE FROM tbl_landing_page WHERE id = ?`, [id], function(err: Error | null) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ message: "Landing page no encontrada o no se pudo eliminar." });
            }

            // Eliminar la imagen asociada si existe
            if (page.main_image) {
                const imagePath = path.join(__dirname, `../../${page.main_image}`);
                fs.unlink(imagePath, (err) => {
                    if (err) console.error('Error al eliminar la imagen:', imagePath, err);
                });
            }

            res.json({ message: "Landing page eliminada con éxito", changes: this.changes });
        });
    });
};