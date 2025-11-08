import express from 'express';
import dotenv from 'dotenv';
import authRouter from './routes/auth.route.js';
import { config } from './config/env.js';
import { connectDB } from './config/database.js';

dotenv.config();

const app = express();

app.use(express.json());

connectDB();

app.use('/api/v1/auth', authRouter);

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});