import { jest } from '@jest/globals';
import { getSession } from '../../services/session.service';
import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';

jest.mock('../../config/env.js');
jest.mock('../../services/session.service.js');
jest.mock('jsonwebtoken');

const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;
const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('Auth Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as Partial<Response>;
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    it('should authenticate valid token and session', async () => {
        mockReq.headers = {
            authorization: 'Bearer valid-token',
            'x-session-id': 'session123'
        };

        (mockJwt.verify as jest.MockedFunction<any>).mockReturnValue({ userId: 'user123', email: 'test@example.com' });
        (mockGetSession as jest.MockedFunction<any>).mockResolvedValue({
            userId: 'user123',
            email: 'test@example.com',
            username: 'testuser',
            createdAt: Date.now()
        });

        await authenticate(mockReq as any, mockRes as Response, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect((mockReq as any).user).toEqual({
            userId: 'user123',
            email: 'test@example.com',
            username: 'testuser'
        });
    });

    it('should reject request without token', async () => {
        mockReq.headers = {};

        await authenticate(mockReq as any, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid session', async () => {
        mockReq.headers = {
            authorization: 'Bearer valid-token',
            'x-session-id': 'session123'
        };

        mockJwt.verify.mockReturnValue({ userId: 'user123', email: 'test@example.com' } as any);
        mockGetSession.mockResolvedValue(null);

        await authenticate(mockReq as any, mockRes as Response, mockNext);

        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockNext).not.toHaveBeenCalled();
    });
})

