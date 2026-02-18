import { Doc, encodeStateAsUpdate, applyUpdate } from 'yjs';
import { Awareness, applyAwarenessUpdate } from 'y-protocols/awareness';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { PersistenceManager } from './persistence';
import Workspace from './models/Workspace';
import Note from './models/Note';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  workspaceId?: string;
}

export class YjsProvider {
  private io: SocketIOServer;
  private persistence: PersistenceManager;
  private docs: Map<string, Doc> = new Map();
  private awareness: Map<string, Awareness> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.persistence = PersistenceManager.getInstance();
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      socket.on('join-note-yjs', async (data: { noteId: string; workspaceId: string }) => {
        const { noteId, workspaceId } = data;

        // Validate access
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace || !workspace.members.some(m => m.userId === socket.userId!)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const note = await Note.findOne({ _id: noteId, workspaceId });
        if (!note) {
          socket.emit('error', { message: 'Note not found' });
          return;
        }

        socket.workspaceId = workspaceId;
        socket.join(`note-${noteId}`);

        // Initialize or get Y.js document
        let doc = this.docs.get(noteId);
        if (!doc) {
          doc = await this.persistence.loadDocument(noteId) || new Doc();
          this.docs.set(noteId, doc);

          // Set up awareness
          const awareness = new Awareness(doc);
          this.awareness.set(noteId, awareness);

          // Start periodic persistence
          this.persistence.startPeriodicFlush(noteId, doc);
        }

        // Send initial document state
        const update = encodeStateAsUpdate(doc);
        socket.emit('yjs-init', { noteId, update });

        // Send current awareness states
        const awareness = this.awareness.get(noteId);
        if (awareness) {
          const awarenessStates = awareness.getStates();
          socket.emit('awareness-init', { noteId, states: Array.from(awarenessStates.entries()) });
        }
      });

      // Handle Y.js updates
      socket.on('yjs-update', async (updateData: { noteId: string; update: Uint8Array }) => {
        const { noteId, update } = updateData;
        if (!socket.rooms.has(`note-${noteId}`)) return;

        const doc = this.docs.get(noteId);
        if (doc) {
          applyUpdate(doc, update);
          // Broadcast to other clients
          socket.to(`note-${noteId}`).emit('yjs-update', updateData);

          // Create version on significant changes (throttle to avoid too many versions)
          // This could be enhanced with change detection logic
          if (Math.random() < 0.1) { // 10% chance to create version (for demo)
            await this.persistence.createVersion(
              noteId,
              socket.userId!,
              socket.workspaceId!,
              'Auto-saved during collaboration'
            );
          }
        }
      });

      // Handle awareness updates
      socket.on('awareness-update', (awarenessData: { noteId: string; update: Uint8Array }) => {
        const { noteId, update } = awarenessData;
        if (!socket.rooms.has(`note-${noteId}`)) return;

        const awareness = this.awareness.get(noteId);
        if (awareness) {
          applyAwarenessUpdate(awareness, update, socket.id);
          // Broadcast awareness to room (excluding sender)
          socket.to(`note-${noteId}`).emit('awareness-update', awarenessData);
        }
      });

      socket.on('leave-note-yjs', (noteId: string) => {
        socket.leave(`note-${noteId}`);

        // Remove user from awareness
        const awareness = this.awareness.get(noteId);
        if (awareness && socket.userId) {
          awareness.setLocalState(null);
        }

        // Clean up if no more users
        const room = this.io.sockets.adapter.rooms.get(`note-${noteId}`);
        if (!room || room.size === 0) {
          this.persistence.stopPeriodicFlush(noteId);
          this.docs.delete(noteId);
          this.awareness.delete(noteId);
        }
      });

      socket.on('disconnect', () => {
        // Clean up awareness states
        this.awareness.forEach((awareness, noteId) => {
          if (socket.userId) {
            awareness.setLocalState(null);
          }
        });
      });
    });
  }

  async getDocumentSnapshot(noteId: string): Promise<{ title: string; content: string } | null> {
    return this.persistence.getDocumentSnapshot(noteId);
  }

  cleanup(): void {
    this.persistence.cleanup();
    this.docs.clear();
    this.awareness.clear();
  }
}
