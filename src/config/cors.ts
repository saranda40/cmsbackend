import { CorsOptions } from 'cors';
import dotenv from 'dotenv';
dotenv.config()

const LOCAL_HOST = process.env.LOCAL_HOST;

export const corsConfig: CorsOptions = {
    origin: function (origin, callback) {
        const whitelist = [LOCAL_HOST];

        if (process.argv[2] === '--api') {
            whitelist.push(undefined)
        }
        
        if (whitelist.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};
