import dotenv from 'dotenv';
import { IEnvConfig } from '../types/env-types';

dotenv.config();

export const config: IEnvConfig = {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV,
    mongodb: {
        uri: process.env.MONGO_URI!
    },
    redis: {
        url: process.env.REDIS_URL!
    },
    secretKey: process.env.SECRET_KEY!,
    apiBaseUrl: process.env.API_BASE_URL!
}