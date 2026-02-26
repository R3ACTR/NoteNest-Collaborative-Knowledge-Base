import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import Note from "./models/Note";
import Workspace from "./models/Workspace";
import { getYDoc, handleYjsMessage } from "./services/yjsService";
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';

// Removed AuditService import as it was unused in the provided code
// If it IS needed, we'll need to migrate that service too or call an API.

interface Presence {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  color: string;
  status: 'active' | 'idle' | 'away';
  cursor?: { line: number; index: number } | null;
  selection?: { from: number; to: number } | null;
  updatedAt: number;
}

interface AuthenticatedSocket extends Socket {
    userId?: string;
    workspaceId?: string;
    displayName?: string;
    avatarUrl?: string;
}

// Presence map: roomId -> Map<userId, Presence>
const presenceMap: Map<string, Map<string, Presence>> = new Map();

export default function setupSocketHandlers(io: SocketIOServer) {
    io.use(async (socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error: Token required"));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
            socket.userId = decoded.userId;
            next();
        } catch (error) {
            next(new Error("Authentication error: Invalid or expired token"));
        }
    });

    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`User ${socket.userId} connected`);

        socket.on("join-note", async (data: { noteId: string; workspaceId: string; displayName?: string; avatarUrl?: string; color?: string }) => {
            const { noteId, workspaceId, displayName, avatarUrl, color } = data;

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
            socket.displayName = displayName || `User-${socket.userId}`;
            socket.avatarUrl = avatarUrl;
            socket.join(`note-${noteId}`);
            console.log(`User ${socket.userId} joined note ${noteId}`);

            // Initialize presence for this room if not exists
            const roomId = `note-${noteId}`;
            if (!presenceMap.has(roomId)) {
                presenceMap.set(roomId, new Map());
            }

            // Create and store user presence
            const userPresence: Presence = {
                userId: socket.userId!,
                displayName: socket.displayName,
                avatarUrl: avatarUrl,
                color: color || `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                status: 'active',
                cursor: null,
                selection: null,
                updatedAt: Date.now()
            };

            presenceMap.get(roomId)!.set(socket.userId!, userPresence);

            // Broadcast current presence list to all users in room
            const presenceList = Array.from(presenceMap.get(roomId)!.values());
            io.to(roomId).emit("presence:list", { presences: presenceList });

            // Initialize Y.js Doc
            const doc = await getYDoc(noteId, io);

            // Send initial sync step 1 to client so they can respond with their state
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, syncProtocol.messageYjsSyncStep1);
            syncProtocol.writeSyncStep1(encoder, doc);
            socket.emit("yjs-sync", encoding.toUint8Array(encoder));
        });

        socket.on("yjs-sync", async (data: { noteId: string, message: Uint8Array }) => {
            // Handle Y.js sync protocol
            const message = new Uint8Array(data.message);

            await handleYjsMessage(data.noteId, message, (response) => {
                // Send response back to sender
                socket.emit("yjs-sync", response);
            }, io);
        });

        socket.on("yjs-update", async (data: { noteId: string, update: Uint8Array }) => {
            const doc = await getYDoc(data.noteId, io);
            const update = new Uint8Array(data.update);

            try {
                const Y = await import('yjs');
                Y.applyUpdate(doc, update);

                // Broadcast to other clients in the room
                socket.to(`note-${data.noteId}`).emit("yjs-update", update);
            } catch (e) {
                console.error("Error applying update", e);
            }
        });

        // Handle presence updates
        socket.on("presence:update", (data: { noteId: string; presence: Partial<Presence> }) => {
            const { noteId, presence } = data;
            const roomId = `note-${noteId}`;

            if (!presenceMap.has(roomId)) {
                return;
            }

            const userPresence = presenceMap.get(roomId)!.get(socket.userId!);
            if (!userPresence) {
                return;
            }

            // Update presence fields
            Object.assign(userPresence, presence, { userId: socket.userId, updatedAt: Date.now() });

            // Broadcast update to other users in room (excluding sender)
            socket.to(roomId).emit("presence:updated", { presence: userPresence });
        });

        // Handle presence heartbeat (keep-alive)
        socket.on("presence:heartbeat", (data: { noteId: string }) => {
            const { noteId } = data;
            const roomId = `note-${noteId}`;

            if (!presenceMap.has(roomId)) {
                return;
            }

            const userPresence = presenceMap.get(roomId)!.get(socket.userId!);
            if (userPresence) {
                userPresence.status = 'active';
                userPresence.updatedAt = Date.now();
            }
        });

        socket.on("disconnect", () => {
            // Clean up presence from all rooms
            for (const [roomId, presences] of presenceMap.entries()) {
                if (presences.has(socket.userId!)) {
                    presences.delete(socket.userId!);
                    // Broadcast removal to room
                    io.to(roomId).emit("presence:removed", { userId: socket.userId });
                    // Clean up empty rooms
                    if (presences.size === 0) {
                        presenceMap.delete(roomId);
                    }
                }
            }
            console.log(`User ${socket.userId} disconnected`);
        });
    });
}
