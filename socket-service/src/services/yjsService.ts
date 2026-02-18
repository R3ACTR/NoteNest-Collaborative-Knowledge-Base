import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import Note from '../models/Note';

// In-memory storage for active YDocs 
// In a real production app, this might need Redis or a more robust scaling strat
// For this microservice, we will use this map, but since we are enabling multiple instances,
// we might run into issues if users are connected to different instances for the SAME note.
// With Socket.IO Redis Adapter, messages are broadcasted, but Y.js state needs to be consistent.
// Startups usually stick to Sticky Sessions for WS to ensure same doc instance.
// For now, we assume sticky sessions or single instance for state + Redis for broadcast.
const docs: Map<string, Y.Doc> = new Map();

/**
 * Gets or creates a Y.Doc for a specific note.
 * If creating, it tries to load state from MongoDB.
 */
export const getYDoc = async (noteId: string): Promise<Y.Doc> => {
    if (docs.has(noteId)) {
        return docs.get(noteId)!;
    }

    const doc = new Y.Doc();
    doc.gc = true;

    // Load initial state from DB
    try {
        const note = await Note.findById(noteId);
        if (note && note.docState) {
            Y.applyUpdate(doc, new Uint8Array(note.docState));
        } else if (note && note.content) {
            // If no binary state, populate from content string (migration)
            const yText = doc.getText('content');
            if (yText.length === 0) {
                yText.insert(0, note.content);
            }
        }
    } catch (e) {
        console.error(`Failed to load doc state for ${noteId}`, e);
    }

    docs.set(noteId, doc);

    // Persistence hook: Debounce save to DB
    let debounce: NodeJS.Timeout | null = null;
    const saveHandler = (update: Uint8Array, origin: any) => {
        if (origin === 'db-load') return; // Don't save if it came from DB

        if (debounce) clearTimeout(debounce);
        debounce = setTimeout(async () => {
            try {
                const state = Y.encodeStateAsUpdate(doc);
                // Also sync text content for search/preview
                const content = doc.getText('content').toString();

                await Note.findByIdAndUpdate(noteId, {
                    docState: Buffer.from(state),
                    content: content,
                    updatedAt: new Date()
                });
                console.log(`Saved Y.js state for note ${noteId}`);
            } catch (err) {
                console.error("Error saving Y.js state", err);
            }
        }, 2000); // Save every 2 seconds of inactivity
    };

    doc.on('update', saveHandler);

    return doc;
};

/**
 * Processes a Y.js update message from a client
 */
export const handleYjsMessage = async (noteId: string, message: Uint8Array, socketCallback: (response: Uint8Array) => void) => {
    const doc = await getYDoc(noteId);

    const encoder = encoding.createEncoder();
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

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
        default:
            console.warn(`Unknown Y.js message type: ${messageType}`);
            return;
    }

    if (encoding.length(encoder) > 0) {
        socketCallback(encoding.toUint8Array(encoder));
    }
};

export const removeDoc = (noteId: string) => {
    const doc = docs.get(noteId);
    if (doc) {
        doc.destroy();
        docs.delete(noteId);
    }
}
