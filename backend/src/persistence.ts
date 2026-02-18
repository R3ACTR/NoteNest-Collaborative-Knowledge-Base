import { Doc, encodeStateAsUpdate, applyUpdate, encodeStateVector, decodeStateVector, encodeStateAsUpdateV2 } from 'yjs';
import Note from './models/Note';
import NoteVersion from './models/NoteVersion';

export class PersistenceManager {
  private static instance: PersistenceManager;
  private flushIntervals: Map<string, NodeJS.Timeout> = new Map();

  static getInstance(): PersistenceManager {
    if (!PersistenceManager.instance) {
      PersistenceManager.instance = new PersistenceManager();
    }
    return PersistenceManager.instance;
  }

  async loadDocument(noteId: string): Promise<Doc | null> {
    try {
      const note = await Note.findById(noteId);
      if (note?.yjsState) {
        const doc = new Doc();
        applyUpdate(doc, note.yjsState);
        return doc;
      }
      return new Doc(); // New document
    } catch (error) {
      console.error(`Error loading document ${noteId}:`, error);
      return null;
    }
  }

  async saveDocument(noteId: string, doc: Doc): Promise<void> {
    try {
      const update = encodeStateAsUpdate(doc);
      await Note.findByIdAndUpdate(noteId, {
        yjsState: Buffer.from(update),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error(`Error saving document ${noteId}:`, error);
    }
  }

  startPeriodicFlush(noteId: string, doc: Doc, intervalMs: number = 30000): void {
    // Clear existing interval
    this.stopPeriodicFlush(noteId);

    const interval = setInterval(async () => {
      await this.saveDocument(noteId, doc);
    }, intervalMs);

    this.flushIntervals.set(noteId, interval);
  }

  stopPeriodicFlush(noteId: string): void {
    const interval = this.flushIntervals.get(noteId);
    if (interval) {
      clearInterval(interval);
      this.flushIntervals.delete(noteId);
    }
  }

  async mergeOfflineEdits(noteId: string, offlineDoc: Doc): Promise<Doc> {
    try {
      // Load current document state
      const currentDoc = await this.loadDocument(noteId);
      if (!currentDoc) {
        return offlineDoc; // No existing document, use offline edits
      }

      // Apply offline edits to current document
      const offlineUpdate = encodeStateAsUpdate(offlineDoc);
      applyUpdate(currentDoc, offlineUpdate);

      // Save merged document
      await this.saveDocument(noteId, currentDoc);

      return currentDoc;
    } catch (error) {
      console.error(`Error merging offline edits for ${noteId}:`, error);
      return offlineDoc; // Fallback to offline edits
    }
  }

  async getDocumentSnapshot(noteId: string): Promise<{ title: string; content: string } | null> {
    try {
      const doc = await this.loadDocument(noteId);
      if (!doc) return null;

      const title = doc.getText('title').toString() || 'Untitled';
      const content = doc.getText('content').toString() || '';

      return { title, content };
    } catch (error) {
      console.error(`Error getting snapshot for ${noteId}:`, error);
      return null;
    }
  }

  async reconstructDocument(noteId: string, targetVersion: number): Promise<Doc | null> {
    try {
      const versions = await NoteVersion.find({ noteId })
        .sort({ versionNumber: 1 })
        .lte('versionNumber', targetVersion);

      if (versions.length === 0) return null;

      const doc = new Doc();

      // Apply deltas in order
      for (const version of versions) {
        applyUpdate(doc, version.delta);
      }

      return doc;
    } catch (error) {
      console.error(`Error reconstructing document ${noteId} to version ${targetVersion}:`, error);
      return null;
    }
  }

  async createVersion(noteId: string, authorId: string, workspaceId: string, reason?: string, branchName?: string, parentVersion?: number): Promise<void> {
    try {
      const doc = await this.loadDocument(noteId);
      if (!doc) return;

      // Get latest version number
      const latestVersion = await NoteVersion.findOne({ noteId }).sort({ versionNumber: -1 });
      const nextVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

      // Create incremental update from previous state vector
      const prevStateVector = latestVersion ? latestVersion.stateVector : new Uint8Array(0);
      const update = encodeStateAsUpdateV2(doc, prevStateVector);
      const currentStateVector = encodeStateVector(doc);

      const version = new NoteVersion({
        noteId,
        versionNumber: nextVersionNumber,
        delta: Buffer.from(update),
        stateVector: Buffer.from(currentStateVector),
        author: authorId,
        workspaceId,
        parentVersion: parentVersion || (latestVersion ? latestVersion.versionNumber : undefined),
        branchName: branchName || (latestVersion ? latestVersion.branchName : undefined),
        metadata: { reason: reason || 'Manual save' },
      });

      await version.save();
    } catch (error) {
      console.error(`Error creating version for ${noteId}:`, error);
    }
  }

  cleanup(): void {
    for (const interval of this.flushIntervals.values()) {
      clearInterval(interval);
    }
    this.flushIntervals.clear();
  }
}
