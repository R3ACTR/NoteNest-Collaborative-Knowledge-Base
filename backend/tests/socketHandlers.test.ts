
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
    let connectionHandler: any;

    beforeAll(() => {
        // Mock IO server
        mockIo = {
            use: (middleware: any) => {
                ioMiddleware = middleware;
            },
            on: jest.fn((event, handler) => {
                if (event === 'connection') {
                    connectionHandler = handler;
                }
            }),
            to: jest.fn(() => ({
                emit: jest.fn()
            })),
            sockets: {
                adapter: {
                    rooms: new Map()
                }
            }
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

describe('Socket Event Handlers - Presence Tracking', () => {
    let mockIo: any;
    let connectionHandler: any;
    let mockSocket: any;

    // We need to mock models since the handlers use them
    const mockWorkspaceFindById = jest.spyOn(require('../src/models/Workspace').default, 'findById');
    const mockNoteFindOne = jest.spyOn(require('../src/models/Note').default, 'findOne');

    beforeEach(() => {
        jest.clearAllMocks();

        mockIo = {
            use: jest.fn(),
            on: jest.fn((event, handler) => {
                if (event === 'connection') {
                    connectionHandler = handler;
                }
            }),
            to: jest.fn(() => ({
                emit: jest.fn()
            })),
            sockets: {
                adapter: {
                    rooms: new Map()
                }
            }
        };

        setupSocketHandlers(mockIo);

        mockSocket = {
            userId: 'user123',
            join: jest.fn(),
            leave: jest.fn(),
            on: jest.fn(),
            emit: jest.fn(),
            to: jest.fn(() => ({
                emit: jest.fn()
            })),
            rooms: new Set(),
            workspaceId: undefined
        };
    });

    it('should track user and emit active-users on join-note', async () => {
        // Trigger connection
        connectionHandler(mockSocket);

        // Get the join-note handler
        const joinNoteHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'join-note')[1];

        // Mock DB responses
        mockWorkspaceFindById.mockResolvedValue({
            members: [{ userId: 'user123' }]
        } as any);
        mockNoteFindOne.mockResolvedValue({
            _id: 'note1'
        } as any);

        const mockEmit = jest.fn();
        mockIo.to = jest.fn(() => ({ emit: mockEmit }));

        await joinNoteHandler({ noteId: 'note1', workspaceId: 'ws1' });

        expect(mockIo.to).toHaveBeenCalledWith('note-note1');
        expect(mockEmit).toHaveBeenCalledWith('active-users', {
            noteId: 'note1',
            users: expect.arrayContaining(['user123'])
        });
    });

    it('should remove user and emit active-users on leave-note', async () => {
        // Trigger connection
        connectionHandler(mockSocket);

        // Setup initial state (user joined)
        const joinNoteHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'join-note')[1];
        // Mock DB responses
        mockWorkspaceFindById.mockResolvedValue({
            members: [{ userId: 'user123' }]
        } as any);
        mockNoteFindOne.mockResolvedValue({
            _id: 'note1'
        } as any);

        const mockEmit = jest.fn();
        mockIo.to = jest.fn(() => ({ emit: mockEmit }));

        await joinNoteHandler({ noteId: 'note1', workspaceId: 'ws1' });

        // Clear previous emits
        mockEmit.mockClear();

        // Get leave-note handler
        const leaveNoteHandler = mockSocket.on.mock.calls.find((call: any) => call[0] === 'leave-note')[1];

        // Simulate another user is in the room so we can see the emit (if only 1 user leaves and room empty coverage says we might delete key, so logic differentiation)
        // Actually our logic says if size == 0 delete. So we won't see emit if user123 is the only one.
        // Let's add another user first "manually" or via another socket logic?
        // Accessing the private module variable `activeUsers` is hard.
        // But we can check if it calls emit.
        // If unique user leaves, it deletes note key, NO emit.

        await leaveNoteHandler('note1');

        // Should NOT emit if they were the only one
        expect(mockEmit).not.toHaveBeenCalled();

        // If we want to test emit on leave, we need 2 users.
    });

    it('should emit active-users when one of two users leaves', async () => {
        // Trigger connection for user 1
        connectionHandler(mockSocket);
        const joinNoteHandler1 = mockSocket.on.mock.calls.find((call: any) => call[0] === 'join-note')[1];

        const mockSocket2 = { ...mockSocket, userId: 'user456', on: jest.fn(), join: jest.fn(), leave: jest.fn() };
        connectionHandler(mockSocket2);
        const joinNoteHandler2 = mockSocket2.on.mock.calls.find((call: any) => call[0] === 'join-note')[1];

        mockWorkspaceFindById.mockResolvedValue({ members: [{ userId: 'user123' }, { userId: 'user456' }] } as any);
        mockNoteFindOne.mockResolvedValue({ _id: 'note1' } as any);

        const mockEmit = jest.fn();
        mockIo.to = jest.fn(() => ({ emit: mockEmit }));

        // Both join
        await joinNoteHandler1({ noteId: 'note1', workspaceId: 'ws1' });
        await joinNoteHandler2({ noteId: 'note1', workspaceId: 'ws1' });

        mockEmit.mockClear();

        // User 1 leaves
        const leaveNoteHandler1 = mockSocket.on.mock.calls.find((call: any) => call[0] === 'leave-note')[1];
        await leaveNoteHandler1('note1');

        expect(mockIo.to).toHaveBeenCalledWith('note-note1');
        expect(mockEmit).toHaveBeenCalledWith('active-users', {
            noteId: 'note1',
            users: ['user456'] // user123 left
        });
    });
});
