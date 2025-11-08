import { randomBytes } from "crypto";
import { ISessionData } from "../types/session-types";
import { redis } from "../config/redis";

const SESSION_TTL = 24 * 60 * 60; // 24 hours in seconds

export const createSession = async (userId: string, email: string, username: string): Promise<string> => {
    const sessionId = randomBytes(32).toString('hex');
    const sessionData: ISessionData = {
        userId,
        email,
        username,
        createdAt: Date.now()
    };

    await redis.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(sessionData));
    await redis.sadd(`user_sessions:${userId}`, sessionId);
    await redis.expire(`user_sessions:${userId}`, SESSION_TTL);

    return sessionId;
};

export const getSession = async (sessionId: string): Promise<ISessionData | null> => {
    const data = await redis.get(`session:${sessionId}`);
    return data ? JSON.parse(data) : null;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
    const session = await getSession(sessionId);
    if (session) {
        await redis.srem(`user_sessions:${session.userId}`, sessionId);
    }
    await redis.del(`session:${sessionId}`);
};

export const deleteAllUserSessions = async (userId: string): Promise<void> => {
    const sessionIds = await redis.smembers(`user_sessions:${userId}`);
    if (sessionIds.length > 0) {
        const pipeline = redis.pipeline();
        sessionIds.forEach(id => pipeline.del(`session:${id}`));
        pipeline.del(`user_sessions:${userId}`);
        await pipeline.exec();
    }
};