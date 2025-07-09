import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from "../config/jwt";

// Extender el objeto Request de Express para añadir la propiedad 'user'
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number; email: string
            };
        }
    }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({message: 'Acceso denegado, no proporcionó Token'});
    }

    jwt.verify(token, JWT_SECRET, (err, user)=>{
        if (err) {
            return res.status(403).json({message: 'Token inválido o Expiado'})
        }
        // ajusta información
        req.user = user as {id:number, email: string};
        next() // siguiente tarea
    })
}
