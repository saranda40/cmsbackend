import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_if_not_set';

if (JWT_SECRET === 'fallback_secret_if_not_set') {
    console.warn('!ATENCION: JWT_SECRET no está definido en .env, Usando un secreto por defecto, no apto para producción')
}

export { JWT_SECRET };