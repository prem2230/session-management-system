import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/session-types";
import { config } from "../config/env.js";
import jwt from "jsonwebtoken";
import { getSession } from "../services/session.service.js";

const verifyToken = (token: string) => {
    return jwt.verify(token, config.secretKey) as { userId: string; email: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        const sessionId = req.headers['x-session-id'] as string;

        if (!token || !sessionId) {
            return res.status(401).json({
                success: false,
                message: "Token and Session ID required"
            });
        }

        const decoded = verifyToken(token);
        const session = await getSession(sessionId);

        if (!session || session.userId !== decoded.userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid session"
            });
        }

        req.user = {
            userId: decoded.userId,
            email: session.email,
            username: session.username
        };

        req.sessionId = sessionId;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}