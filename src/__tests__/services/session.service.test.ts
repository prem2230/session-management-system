import { jest } from '@jest/globals';
import { createSession, deleteSession, getSession } from '../../services/session.service';

const mockRedis = {
    setex: jest.fn() as jest.MockedFunction<any>,
    sadd: jest.fn() as jest.MockedFunction<any>,
    expire: jest.fn() as jest.MockedFunction<any>,
    get: jest.fn() as jest.MockedFunction<any>,
    srem: jest.fn() as jest.MockedFunction<any>,
    del: jest.fn() as jest.MockedFunction<any>,
    smembers: jest.fn() as jest.MockedFunction<any>,
    pipeline: jest.fn(() => ({
        del: jest.fn() as jest.MockedFunction<any>,
        exec: jest.fn() as jest.MockedFunction<any>
    })) as jest.MockedFunction<any>
};

jest.mock('../../config/redis.js', () => ({
    redis: mockRedis
}));

describe('Session Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createSession', () => {
        it('should create session and return sessionId', async () => {
            mockRedis.setex.mockResolvedValue('OK');
            mockRedis.sadd.mockResolvedValue(1);
            mockRedis.expire.mockResolvedValue(1);

            const sessionId = await createSession('userId123', 'testuser@example.com', 'testuser');

            expect(sessionId).toBeDefined();
            expect(sessionId).toHaveLength(64);
            expect(mockRedis.setex).toHaveBeenCalledWith(
                `session:${sessionId}`,
                86400,
                expect.stringContaining('userId123')
            );
        });
    });

    describe('getSession', () => {
        it('should return session data when exists', async () => {
            const sessionData = {
                userId: 'userId123',
                email: 'testuser@example.com',
                username: 'testuser',
                createdAt: Date.now()
            };
            mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));

            const result = await getSession('sessionId123');

            expect(result).toEqual(sessionData);
            expect(mockRedis.get).toHaveBeenCalledWith('session:sessionId123');
        });

        it('should return null when session does not exist', async () => {
            mockRedis.get.mockResolvedValue(null);

            const result = await getSession('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('deleteSession', () => {
        it('should delete session and remove from user sessions', async () => {
            const sessionData = {
                userId: 'userId123',
                email: 'testuser@example.com',
                username: 'testuser',
                createdAt: Date.now()
            };
            mockRedis.get.mockResolvedValue(JSON.stringify(sessionData));
            mockRedis.srem.mockResolvedValue(1);
            mockRedis.del.mockResolvedValue(1);

            await deleteSession('sessionId123');

            expect(mockRedis.srem).toHaveBeenCalledWith('user_sessions:userId123', 'sessionId123');
            expect(mockRedis.del).toHaveBeenCalledWith('session:sessionId123');
        });

        it('should only delete session if it does not exist', async () => {
            mockRedis.get.mockResolvedValue(null);
            mockRedis.del.mockResolvedValue(1);

            await deleteSession('nonexistent');

            expect(mockRedis.srem).not.toHaveBeenCalled();
            expect(mockRedis.del).toHaveBeenCalledWith('session:nonexistent');
        });
    });
});