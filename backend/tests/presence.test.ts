import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import setupSocketHandlers from '../../socket-service/src/socketHandlers';

describe('Real-time Presence & Cursors', () => {
  let server: SocketIOServer;
  let httpServer: any;
  let client1: ClientSocket;
  let client2: ClientSocket;
  const TEST_PORT = 6789;

  beforeEach(async () => {
    // Mock database calls
    jest.clearAllMocks();

    // Create HTTP server and Socket.IO server
    const http = require('http');
    httpServer = http.createServer();
    server = new SocketIOServer(httpServer, {
      cors: { origin: '*' },
    });

    // Setup socket handlers
    setupSocketHandlers(server);

    // Mock environment
    process.env.JWT_SECRET = 'test-secret';

    // Wait for server to listen
    await new Promise((resolve) => {
      httpServer.listen(TEST_PORT, resolve);
    });
  });

  afterEach(async () => {
    // Close all clients
    if (client1?.connected) client1.disconnect();
    if (client2?.connected) client2.disconnect();

    // Close server
    if (server) server.close();
    if (httpServer) httpServer.close();

    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it('should broadcast presence:list when user joins note', (done) => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 'user1' }, 'test-secret');

    client1 = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token },
    });

    client1.on('connect', () => {
      client1.emit('join-note', {
        noteId: 'note1',
        workspaceId: 'ws1',
        displayName: 'User 1',
        color: '#FF0000',
      });
    });

    client1.on('presence:list', (data) => {
      expect(data.presences).toBeDefined();
      expect(Array.isArray(data.presences)).toBe(true);
      done();
    });

    // Timeout safety
    setTimeout(() => {
      if (!client1.connected) {
        done(new Error('Client did not connect'));
      }
    }, 5000);
  });

  it('should broadcast presence:updated when presence changes', (done) => {
    const jwt = require('jsonwebtoken');
    const token1 = jwt.sign({ userId: 'user1' }, 'test-secret');
    const token2 = jwt.sign({ userId: 'user2' }, 'test-secret');

    let presenceListReceived = false;

    client1 = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token: token1 },
    });

    client2 = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token: token2 },
    });

    let client1JoinedNote = false;

    client1.on('connect', () => {
      client1.emit('join-note', {
        noteId: 'note1',
        workspaceId: 'ws1',
        displayName: 'User 1',
        color: '#FF0000',
      });
    });

    client1.on('presence:list', () => {
      presenceListReceived = true;
      if (!client1JoinedNote) {
        client1JoinedNote = true;
        // Now join client2
        client2.emit('join-note', {
          noteId: 'note1',
          workspaceId: 'ws1',
          displayName: 'User 2',
          color: '#00FF00',
        });
      }
    });

    // Client1 listens for presence:updated from client2
    client1.on('presence:updated', (data) => {
      expect(data.presence).toBeDefined();
      expect(data.presence.userId).toBe('user2');
      done();
    });

    // Client 2 setup
    client2.on('connect', () => {
      // Wait a bit then join note
      setTimeout(() => {
        client2.emit('join-note', {
          noteId: 'note1',
          workspaceId: 'ws1',
          displayName: 'User 2',
          color: '#00FF00',
        });
      }, 100);
    });

    // Timeout safety
    setTimeout(() => {
      if (!presenceListReceived) {
        done(new Error('Presence list not received'));
      }
    }, 5000);
  });

  it('should remove presence when user disconnects', (done) => {
    const jwt = require('jsonwebtoken');
    const token1 = jwt.sign({ userId: 'user1' }, 'test-secret');
    const token2 = jwt.sign({ userId: 'user2' }, 'test-secret');

    client1 = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token: token1 },
    });

    client2 = ioClient(`http://localhost:${TEST_PORT}`, {
      auth: { token: token2 },
    });

    let client1Ready = false;

    client1.on('connect', () => {
      client1.emit('join-note', {
        noteId: 'note1',
        workspaceId: 'ws1',
        displayName: 'User 1',
        color: '#FF0000',
      });
    });

    client1.on('presence:list', () => {
      if (!client1Ready) {
        client1Ready = true;
        client2.emit('join-note', {
          noteId: 'note1',
          workspaceId: 'ws1',
          displayName: 'User 2',
          color: '#00FF00',
        });
      }
    });

    let userRemovedDetected = false;

    client1.on('presence:removed', (data) => {
      expect(data.userId).toBe('user2');
      userRemovedDetected = true;
      done();
    });

    client2.on('connect', () => {
      setTimeout(() => {
        client2.emit('join-note', {
          noteId: 'note1',
          workspaceId: 'ws1',
          displayName: 'User 2',
          color: '#00FF00',
        });

        setTimeout(() => {
          client2.disconnect();
        }, 500);
      }, 100);
    });

    // Timeout safety
    setTimeout(() => {
      if (!userRemovedDetected) {
        done(new Error('User removal not detected'));
      }
    }, 5000);
  });
});
