// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config/db';
import { tbl_usuarios } from '../models/user';
import { JWT_SECRET } from '../utils/jwt';

const saltRounds = 10;

export const registerUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, saltRounds);

        db.run(`INSERT INTO users (username, password_hash) VALUES (?, ?)`,
            [username, passwordHash],
            function(err: Error | null) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed: users.username')) {
                        return res.status(409).json({ error: 'Este nombre de usuario ya existe.' });
                    }
                    return res.status(500).json({ error: err.message });
                }
                res.status(201).json({
                    message: "Usuario registrado con éxito",
                    userId: this.lastID,
                    username: username
                });
            }
        );
    } catch (error: any) {
        res.status(500).json({ error: 'Error al procesar la contraseña: ' + error.message });
    }
};

export const loginUser = (req: Request, res: Response) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son obligatorios.' });
    }

    db.get(`SELECT * FROM tbl_usuarios WHERE username = ?`, [username], async (err: Error | null, user: tbl_usuarios) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password_hash);

            if (isMatch) {
                // Generar JWT
                const token = jwt.sign(
                    { id: user.id, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '1h' } // El token expira en 1 hora
                );

                res.json({ message: "Login exitoso", email: user.email, token: token });
            } else {
                res.status(401).json({ error: 'Credenciales inválidas.' });
            }
        } catch (error: any) {
            res.status(500).json({ error: 'Error al verificar la contraseña: ' + error.message });
        }
    });
};