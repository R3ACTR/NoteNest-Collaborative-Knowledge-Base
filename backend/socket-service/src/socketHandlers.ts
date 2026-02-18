import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import Note from '@backend/models/Note';
import NoteVersion from '@backend/models/NoteVersion';
import User from '@backend/models/User';
import { retryIdempotent } from '@backend/utils/retry';
import { metrics } from '@backend/utils/metrics';
import logger from '@backend/utils/logger';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  workspaceId?: string;
}

const activeUsers: Map<string, Set<string>> = new Map(); // noteId -> Set of userIds

export default function setupSocketHandlers(io: SocketIOServer) {
  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      // Verify socket token issued by main API
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      if (decoded.type !== 'socket') {
        return next(new Error("Invalid token type"));
      }
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    socket.on("join-note", async (data: { noteId: string; workspaceId: string }) => {
      const { noteId, workspaceId } = data;

      // Validate workspace access via main API with retry and timeout
      try {
        await retryIdempotent(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

          const response = await fetch(`${process.env.MAIN_API_URL}/api/workspaces/${workspaceId}/validate-access`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${socket.handshake.auth.token}`
            },
            body: JSON.stringify({ userId: socket.userId }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        });
      } catch (error) {
        metrics.increment('httpRequestFailures');
        if (error instanceof Error && error.name === 'AbortError') {
          metrics.increment('httpRequestTimeouts');
          logger.warn('Workspace validation timeout');
        }
        socket.emit("error", { message: "Validation failed" });
        return;
      }

      // Validate note exists in workspace
      const note = await Note.findOne({ _id: noteId, workspaceId });
      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      socket.workspaceId = workspaceId;
      socket.join(`note-${noteId}`);

      // Track active users
      if (!activeUsers.has(noteId)) {
        activeUsers.set(noteId, new Set());
      }
      activeUsers.get(noteId)!.add(socket.userId!);

      // Send current active users
      const activeUserIds = Array.from(activeUsers.get(noteId)!);
      const users = await User.find({ _id: { $in: activeUserIds } }).select("_id name");
      socket.emit("active-users", users);

      // Broadcast to others in the room
      const user = await User.findById(socket.userId);
      socket.to(`note-${noteId}`).emit("user-joined", { userId: socket.userId, name: user?.name });

      console.log(`User ${socket.userId} joined note ${noteId}`);
    });

    // Y.js collaboration events
    socket.on("join-note-yjs", (data: { noteId: string; workspaceId: string }) => {
      // Delegate to YjsProvider
      socket.emit("yjs-ready", { noteId: data.noteId });
    });

    socket.on("leave-note", (noteId: string) => {
      socket.leave(`note-${noteId}`);

      if (activeUsers.has(noteId)) {
        activeUsers.get(noteId)!.delete(socket.userId!);
        if (activeUsers.get(noteId)!.size === 0) {
          activeUsers.delete(noteId);
        }
      }

      socket.to(`note-${noteId}`).emit("user-left", { userId: socket.userId });
    });

    socket.on("update-note", async (data: { noteId: string; title: string; content: string; expectedVersion?: number }) => {
      const { noteId, title, content, expectedVersion } = data;

      // Validate note and permissions via main API with OCC, retry, and timeout
      try {
        await retryIdempotent(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

          const response = await fetch(`${process.env.MAIN_API_URL}/api/notes/${noteId}/validate-update`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${socket.handshake.auth.token}`
            },
            body: JSON.stringify({ userId: socket.userId, expectedVersion }),
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorData = await response.json() as any;
            if (response.status === 409) {
              // Conflict detected
              socket.emit('note-update-conflict', {
                noteId,
                conflict: errorData,
                clientChanges: { title, content }
              });
              return;
            }
            throw new Error(errorData.error || "Permission denied");
          }
        });
      } catch (error) {
        metrics.increment('httpRequestFailures');
        if (error instanceof Error && error.name === 'AbortError') {
          metrics.increment('httpRequestTimeouts');
          logger.warn('Note validation timeout');
        }
        socket.emit("error", { message: "Validation failed" });
        return;
      }

      // Update note with incremented version
      const note = await Note.findById(noteId);
      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      note.title = title;
      note.content = content;
      note.version = note.version + 1;
      note.updatedAt = new Date();
      await note.save();

      // Create version
      const version = new NoteVersion({
        noteId,
        versionNumber: note.version,
        contentSnapshot: { title, content },
        author: socket.userId,
        workspaceId: socket.workspaceId,
        metadata: { reason: "Real-time edit" },
      });
      await version.save();

      // Log audit via main API
      try {
        await fetch(`${process.env.MAIN_API_URL}/api/audit/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${socket.handshake.auth.token}`
          },
          body: JSON.stringify({
            action: "note_updated",
            userId: socket.userId,
            workspaceId: socket.workspaceId,
            resourceId: noteId,
            resourceType: "note",
            details: { title, version: note.version }
          })
        });
      } catch (error) {
        console.error("Failed to log audit:", error);
      }

      // Broadcast update to room
      socket.to(`note-${noteId}`).emit("note-updated", { noteId, title, content, updatedBy: socket.userId });

      console.log(`Note ${noteId} updated by ${socket.userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);
      // Clean up active users
      activeUsers.forEach((users, noteId) => {
        users.delete(socket.userId!);
        if (users.size === 0) {
          activeUsers.delete(noteId);
        }
      });
    });
  });
}
