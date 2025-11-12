import { jest } from '@jest/globals';
import { Request, Response } from 'express';
import { registerUser, loginUser } from '../../controllers/auth.controller';
import { createSession } from '../../services/session.service';

jest.mock('../../models/user.model.js');
jest.mock('../../services/session.service.js');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockUser = {
    findOne: jest.fn(),
    prototype: {
        save: jest.fn()
    }
} as any;
const mockCreateSession = createSession as jest.MockedFunction<typeof createSession>;
const mockBcrypt = {
    hash: jest.fn(),
    compare: jest.fn()
} as any;
const mockJwt = {
    sign: jest.fn()
} as any;

describe('Auth Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        mockReq = { body: {} };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        } as Partial<Response>;
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        it('should register user successfully', async () => {
            mockReq.body = {
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                age: 25,
                mobile: 1234567890,
                password: 'Test@123',
                confirmPassword: 'Test@123'
            };

            mockUser.findOne.mockResolvedValue(null);
            (mockBcrypt.hash as jest.MockedFunction<any>).mockResolvedValue('hashedPassword');
            (mockUser.prototype.save as jest.MockedFunction<any>).mockResolvedValue({
                _id: 'user123',
                username: 'testuser',
                email: 'test@example.com'
            });

            await registerUser(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'User registered successfully',
                user: expect.any(Object)
            });
        });

        it('should return error for missing fields', async () => {
            mockReq.body = { username: 'testuser' }; // Missing fields

            await registerUser(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Please fill all the fields'
            });
        });

        it('should return error for password mismatch', async () => {
            mockReq.body = {
                username: 'testuser',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                age: 25,
                mobile: 1234567890,
                password: 'Test@123',
                confirmPassword: 'Different@123'
            };

            await registerUser(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Passwords do not match'
            });
        });
    });

    describe('loginUser', () => {
        it('should login user successfully', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'Test@123'
            };

            const mockUserData = {
                _id: 'user123',
                email: 'test@example.com',
                username: 'testuser',
                password: 'hashedPassword'
            };

            // (mockUser.findOne as jest.MockedFunction<any>).mockReturnValue({
            //     select: jest.fn().mockResolvedValue(mockUserData)
            // } as any);

            mockBcrypt.compare.mockResolvedValue(true);
            mockJwt.sign.mockReturnValue('jwt-token');
            mockCreateSession.mockResolvedValue('session123');

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'User logged in successfully',
                token: 'jwt-token',
                sessionId: 'session123'
            });
        });

        it('should return error for invalid credentials', async () => {
            mockReq.body = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };

            // (mockUser.findOne as jest.MockedFunction<any>).mockReturnValue({
            //     select: jest.fn().mockResolvedValue(null)
            // } as any);

            await loginUser(mockReq as Request, mockRes as Response);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
    });
});
