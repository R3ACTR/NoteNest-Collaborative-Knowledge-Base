import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import Note from "./models/Note";
import Workspace from "./models/Workspace";
import { getYDoc, handleYjsMessage } from "./services/yjsService";
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';

// Removed AuditService import as it was unused in the provided code
// If it IS needed, we'll need to migrate that service too or call an API.

interface AuthenticatedSocket extends Socket {
    userId?: string;
    workspaceId?: string;
}

export default function setupSocketHandlers(io: SocketIOServer) {
    io.use(async (socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error("Authentication error"));
        }

        try {
            // TODO: Verify JWT token and extract userId
            // For now, matching the previous logic: assuming token IS userId or verified elsewhere
            socket.userId = token;
            next();
        } catch (error) {
            next(new Error("Authentication error"));
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
            console.log(`User ${socket.userId} joined note ${noteId}`);

            // Initialize Y.js Doc
            const doc = await getYDoc(noteId);

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
            });
        });

        socket.on("yjs-update", async (data: { noteId: string, update: Uint8Array }) => {
            const doc = await getYDoc(data.noteId);
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

        socket.on("disconnect", () => {
            console.log(`User ${socket.userId} disconnected`);
        });
    });
}
