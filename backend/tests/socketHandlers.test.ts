
import setupSocketHandlers from '../src/socketHandlers';
import User from '../src/models/User';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Socket } from 'socket.io';

// Mock socket.io types if needed, or just use any for mocks
type MockNext = (err?: any) => void;

describe('Socket Authentication Middleware', () => {
    let ioMiddleware: any;
    let mockIo: any;

    beforeAll(() => {
        // Mock IO server
        mockIo = {
            use: (middleware: any) => {
                ioMiddleware = middleware;
            },
            on: jest.fn(), // We don't need to test connection handler logic here, just middleware
        };

        // Setup handlers to capture middleware
        setupSocketHandlers(mockIo as any);
    });

    it('should reject connection without token', async () => {
        const mockSocket = {
            handshake: {
                auth: {}
            }
        };
        const next = jest.fn();

        await ioMiddleware(mockSocket, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('Authentication error');
    });

    it('should reject connection with invalid token', async () => {
        const mockSocket = {
            handshake: {
                auth: {
                    token: 'invalid-token'
                }
            }
        };
        const next = jest.fn();

        await ioMiddleware(mockSocket, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('Authentication error');
    });

    it('should reject connection with valid token but non-existent user', async () => {
        const nonExistentUserId = new mongoose.Types.ObjectId();
        const token = jwt.sign({ userId: nonExistentUserId }, process.env.JWT_SECRET || 'test-jwt-secret');

        const mockSocket = {
            handshake: {
                auth: {
                    token
                }
            }
        };
        const next = jest.fn();

        await ioMiddleware(mockSocket, next);

        expect(next).toHaveBeenCalledWith(expect.any(Error));
        expect(next.mock.calls[0][0].message).toBe('Authentication error');
    });

    it('should accept connection with valid token and existing user', async () => {
        // Create a user
        const user = new User({
            email: 'socket-test@example.com',
            password: 'password123',
            name: 'Socket Test User'
        });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'test-jwt-secret');

        const mockSocket: any = {
            handshake: {
                auth: {
                    token
                }
            },
            userId: undefined
        };
        const next = jest.fn();

        await ioMiddleware(mockSocket, next);

        expect(next).toHaveBeenCalledWith(); // No error
        expect(next).not.toHaveBeenCalledWith(expect.any(Error));
        expect(mockSocket.userId).toBe(user._id.toString());
    });
});
