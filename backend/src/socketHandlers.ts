import { Server as SocketIOServer, Socket } from "socket.io";
// import jwt from 'jsonwebtoken'; // Unused in this file explicitly now, token is checked but no jwt.verify call visible in original snippet, handled by middleware or TODO.
// Actually line 3 in original had import jwt.
import jwt from 'jsonwebtoken';
import Note from "./models/Note";
import NoteVersion from "./models/NoteVersion";
import Workspace from "./models/Workspace";
import User from "./models/User";
import { AuditService } from "./services/auditService";
import { YjsProvider } from "./yjsProvider";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  workspaceId?: string;
}

const activeUsers: Map<string, Set<string>> = new Map(); // noteId -> Set of userIds

export default function setupSocketHandlers(io: SocketIOServer) { // Setup socket handlers
  // Instantiate YjsProvider to handle collaboration events (join-note-yjs, yjs-update, etc.)
  new YjsProvider(io);

  io.use(async (socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not defined");
        return next(new Error("Server configuration error"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: string };
      const user = await User.findById(decoded.userId);

      if (!user) {
        return next(new Error("Authentication error"));
      }

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Socket authentication failed:", error);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log(`User ${socket.userId} connected`);

    socket.on("join-note", async (data: { noteId: string; workspaceId: string }) => {
      const { noteId, workspaceId } = data;

      // Validate access
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace || !workspace.members.some(m => m.userId === socket.userId!)) {
        socket.emit("error", { message: "Access denied" });
        return;
      }

      const note = await Note.findOne({ _id: noteId, workspaceId });
      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      socket.workspaceId = workspaceId;
      socket.join(`note-${noteId}`);

      // Track active user
      if (!activeUsers.has(noteId)) {
        activeUsers.set(noteId, new Set());
      }
      activeUsers.get(noteId)!.add(socket.userId!);

      // Broadcast active users
      io.to(`note-${noteId}`).emit("active-users", {
        noteId,
        users: Array.from(activeUsers.get(noteId)!)
      });

      console.log(`User ${socket.userId} joined note ${noteId}`);
    });

    socket.on("leave-note", (noteId: string) => {
      socket.leave(`note-${noteId}`);

      // Remove user from active tracking
      if (activeUsers.has(noteId)) {
        activeUsers.get(noteId)!.delete(socket.userId!);
        if (activeUsers.get(noteId)!.size === 0) {
          activeUsers.delete(noteId);
        } else {
          // Broadcast update
          io.to(`note-${noteId}`).emit("active-users", {
            noteId,
            users: Array.from(activeUsers.get(noteId)!)
          });
        }
      }
    });

    socket.on("update-note", async (data: { noteId: string; title: string; content: string; expectedVersion?: number }) => {
      const { noteId, title, content, expectedVersion } = data;

      // Validate note and permissions with OCC
      const note = await Note.findOne({ _id: noteId, workspaceId: socket.workspaceId }) as any;
      if (!note) {
        socket.emit("error", { message: "Note not found" });
        return;
      }

      // OCC check
      if (expectedVersion !== undefined && note.version !== expectedVersion) {
        socket.emit('note-update-conflict', {
          noteId,
          conflict: {
            error: 'Conflict',
            message: 'Note has been updated by another user. Please refresh and try again.',
            currentVersion: note.version,
            expectedVersion,
            serverData: {
              title: note.title,
              content: note.content,
              updatedAt: note.updatedAt
            },
            guidance: 'Fetch the latest version, merge your changes manually, and retry the update.'
          },
          clientChanges: { title, content }
        });
        return;
      }

      // Update note with incremented version
      note.title = title;
      note.content = content;
      note.version = note.version + 1;
      note.updatedAt = new Date();
      await note.save();

      // Create version using PersistenceManager
      // Requires PersistenceManager to be exported or imported. It wasn't imported in original file but require()'d.
      const persistence = require('./persistence').PersistenceManager.getInstance();
      await persistence.createVersion(noteId, socket.userId!, socket.workspaceId!, "Real-time edit");

      // Log audit
      await AuditService.logEvent(
        "note_updated",
        socket.userId!,
        socket.workspaceId!,
        noteId,
        "note",
        { title, version: note.version }
      );

      // Broadcast update to room
      socket.to(`note-${noteId}`).emit("note-updated", { noteId, title, content, updatedBy: socket.userId });

      console.log(`Note ${noteId} updated by ${socket.userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User ${socket.userId} disconnected`);

      // Remove user from all active notes they might be in
      if (socket.userId) {
        activeUsers.forEach((users, noteId) => {
          if (users.has(socket.userId!)) {
            users.delete(socket.userId!);

            if (users.size === 0) {
              activeUsers.delete(noteId);
            } else {
              io.to(`note-${noteId}`).emit("active-users", {
                noteId,
                users: Array.from(users)
              });
            }
          }
        });
      }
    });
  });
}

