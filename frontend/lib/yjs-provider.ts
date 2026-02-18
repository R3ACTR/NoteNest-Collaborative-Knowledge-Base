import * as Y from 'yjs';
import { Socket } from 'socket.io-client';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
// import { Observable } from 'lib0/observable'; // Y.js providers usually extend Observable, but we can be simpler

export class YSocketIOProvider {
    doc: Y.Doc;
    socket: Socket;
    noteId: string;

    constructor(socket: Socket, noteId: string, doc: Y.Doc) {
        this.socket = socket;
        this.noteId = noteId;
        this.doc = doc;

        // Listen for sync messages from server
        this.socket.on('yjs-sync', (buffer: ArrayBuffer) => {
            const encoder = encoding.createEncoder();
            const decoder = decoding.createDecoder(new Uint8Array(buffer));
            const messageType = decoding.readVarUint(decoder);

            // Handle Sync Step 1/2 from Server
            // The server sent us a message, we might need to reply
            // We re-use logic similar to backend but client-side
            switch (messageType) {
                case syncProtocol.messageYjsSyncStep1:
                    syncProtocol.readSyncStep1(decoder, encoder, doc);
                    break;
                case syncProtocol.messageYjsSyncStep2:
                    // @ts-ignore
                    syncProtocol.readSyncStep2(decoder, doc, null);
                    break;
                case syncProtocol.messageYjsUpdate:
                    // @ts-ignore
                    syncProtocol.readUpdate(decoder, doc, null);
                    break;
            }

            // Reply if needed
            if (encoding.length(encoder) > 0) {
                const reply = encoding.toUint8Array(encoder);
                this.socket.emit('yjs-sync', { noteId, message: reply });
            }
        });

        // Listen for broadcast updates
        this.socket.on('yjs-update', (update: ArrayBuffer) => {
            Y.applyUpdate(doc, new Uint8Array(update));
        });

        // Listen for local updates and send to server
        doc.on('update', (update: Uint8Array, origin: any) => {
            if (origin !== this) { // Only send if update didn't come from us applying a server message
                // Send update to server
                this.socket.emit('yjs-update', { noteId, update });
            }
        });

        // Start sync
        // We wait for join-response or just start? 
        // Usually server initiates sync step 1 upon join.
    }

    destroy() {
        this.socket.off('yjs-sync');
        this.socket.off('yjs-update');
        // doc.off('update', ...) - harder to remove anonymous function, usually we just destroy doc or keep it
    }
}
