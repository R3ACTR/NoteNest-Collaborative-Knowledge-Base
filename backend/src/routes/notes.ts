import express, { Request, Response } from 'express';
import { Doc, encodeStateAsUpdate, encodeStateVector } from 'yjs';
import Note from '../models/Note';
import NoteVersion from '../models/NoteVersion';
import { PersistenceManager } from '../persistence';
import { AuditService } from '../services/auditService';
import { authenticateToken, validateAccessLink, requirePermission, AuthRequest } from '../middleware/auth';
import { diff_match_patch } from 'diff-match-patch';
import { getCacheService, CacheKeys } from '../services/cacheService';
import { getEventBus } from '../services/eventBus';
import { EVENT_NAMES, NoteCreatedEvent, NoteUpdatedEvent, NoteDeletedEvent } from '../types/events';

const router = express.Router();

// Get all notes for a workspace
router.get('/workspace/:workspaceId', authenticateToken, validateAccessLink, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const cacheService = getCacheService();
    const cacheKey = CacheKeys.workspaceNotes(workspaceId);

    // Try to get from cache first
    if (cacheService) {
      const cachedNotes = await cacheService.get(cacheKey);
      if (cachedNotes) {
        return res.json(cachedNotes);
      }
    }

    const notes = await Note.find({ workspaceId });

    // Cache the result
    if (cacheService) {
      await cacheService.set(cacheKey, notes);
    }

    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// Get single note by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch note' });
  }
});


// Create a new note
router.post('/', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, workspaceId, authorId } = req.body;
    const note = new Note({
      title,
      content,
      workspaceId,
      author: authorId,
      version: 1,
    });
    await note.save();

    // Create initial Y.js document and save full state as first version
    const doc = new Doc();
    doc.getText('title').insert(0, title || '');
    doc.getText('content').insert(0, content || '');
    const fullUpdate = encodeStateAsUpdate(doc);
    const stateVector = encodeStateVector(doc);

    // Create initial version with full state
    const version = new NoteVersion({
      noteId: note._id.toString(),
      versionNumber: 1,
      delta: Buffer.from(fullUpdate),
      stateVector: Buffer.from(stateVector),
      author: authorId,
      workspaceId,
      metadata: { reason: 'Initial creation' },
    });
    await version.save();

    // Save Y.js state to note
    const persistence = PersistenceManager.getInstance();
    await persistence.saveDocument(note._id.toString(), doc);

    // Emit domain event
    const eventBus = getEventBus();
    const event: NoteCreatedEvent = {
      type: EVENT_NAMES.NOTE_CREATED,
      timestamp: new Date(),
      actorId: authorId,
      workspaceId,
      noteId: note._id.toString(),
      title,
      authorId,
    };
    await eventBus.emit(EVENT_NAMES.NOTE_CREATED, event);

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

// Update a note with Optimistic Concurrency Control
router.put('/:id', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, authorId, expectedVersion } = req.body;

    // Fetch the current note
    const note = await Note.findById(id) as any;
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Check version for OCC
    if (expectedVersion !== undefined && note.version !== expectedVersion) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Note has been updated by another user. Please refresh and try again.',
        currentVersion: note.version,
        expectedVersion,
        clientChanges: { title, content },
        serverData: {
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt
        },
        guidance: 'Fetch the latest version, merge your changes manually, and retry the update.'
      });
    }

    // Update the note with incremented version
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      {
        title,
        content,
        version: note.version + 1,
        updatedAt: new Date()
      },
      { new: true }
    ) as any;

    // Create version using PersistenceManager
    const persistence = PersistenceManager.getInstance();
    await persistence.createVersion(id, authorId, note.workspaceId.toString(), "REST update");

    // Invalidate cache for this note and workspace notes
    const cacheService = getCacheService();
    if (cacheService) {
      await cacheService.delete(CacheKeys.note(id));
      await cacheService.delete(CacheKeys.workspaceNotes(note.workspaceId.toString()));
      await cacheService.delete(CacheKeys.noteVersions(id));
    }

    // Emit domain event
    const eventBus = getEventBus();
    const event: NoteUpdatedEvent = {
      type: EVENT_NAMES.NOTE_UPDATED,
      timestamp: new Date(),
      actorId: authorId,
      workspaceId: note.workspaceId.toString(),
      noteId: id,
      title,
      changes: {
        title: { from: note.title, to: title },
        content: { from: note.content, to: content },
      },
    };
    await eventBus.emit(EVENT_NAMES.NOTE_UPDATED, event);

    // Log the event
    await AuditService.logEvent(
      'note_updated',
      authorId,
      note.workspaceId.toString(),
      id,
      'note',
      { title, version: updatedNote?.version }
    );

    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

// Delete a note
router.delete('/:id', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { authorId } = req.body;
    const note = await Note.findByIdAndDelete(id);

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Emit domain event
    const eventBus = getEventBus();
    const event: NoteDeletedEvent = {
      type: EVENT_NAMES.NOTE_DELETED,
      timestamp: new Date(),
      actorId: authorId,
      workspaceId: note.workspaceId.toString(),
      noteId: id,
      title: note.title,
    };
    await eventBus.emit(EVENT_NAMES.NOTE_DELETED, event);

    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Get version history for a note
router.get('/:id/versions', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const versions = await NoteVersion.find({ noteId: id }).sort({ versionNumber: -1 });

    // Reconstruct content for each version
    const persistence = PersistenceManager.getInstance();
    const versionsWithContent = await Promise.all(
      versions.map(async (version) => {
        const doc = await persistence.reconstructDocument(id, version.versionNumber);
        if (doc) {
          return {
            ...version.toObject(),
            contentSnapshot: {
              title: doc.getText('title').toString(),
              content: doc.getText('content').toString(),
            },
          };
        }
        return version;
      })
    );

    res.json(versionsWithContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch versions' });
  }
});

// Restore a note to a specific version
router.post('/:id/restore', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { versionNumber, authorId } = req.body;

    const persistence = PersistenceManager.getInstance();
    const restoredDoc = await persistence.reconstructDocument(id, versionNumber);
    if (!restoredDoc) {
      return res.status(404).json({ error: 'Version not found' });
    }

    // Update the note with restored content
    const title = restoredDoc.getText('title').toString();
    const content = restoredDoc.getText('content').toString();

    const note = await Note.findByIdAndUpdate(
      id,
      { title, content, updatedAt: new Date() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Save current state as new version
    await persistence.saveDocument(id, restoredDoc);
    await persistence.createVersion(id, authorId, note.workspaceId.toString(), `Restored from version ${versionNumber}`);

    // Log the event
    await AuditService.logEvent(
      'note_restored',
      authorId,
      note.workspaceId.toString(),
      id,
      'note',
      { restoredFromVersion: versionNumber }
    );

    res.json({ note });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore note' });
  }
});

// Fork a note to create a divergent copy
router.post('/:id/fork', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { authorId, branchName } = req.body;

    const originalNote = await Note.findById(id);
    if (!originalNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Create forked note
    const forkedNote = new Note({
      title: `${originalNote.title} (Fork)`,
      content: originalNote.content,
      workspaceId: originalNote.workspaceId,
      author: authorId,
    });
    await forkedNote.save();

    // Copy Y.js state
    const persistence = PersistenceManager.getInstance();
    const originalDoc = await persistence.loadDocument(id);
    if (originalDoc) {
      await persistence.saveDocument(forkedNote._id.toString(), originalDoc);
    }

    // Create initial version for fork
    await persistence.createVersion(
      forkedNote._id.toString(),
      authorId,
      originalNote.workspaceId.toString(),
      `Forked from ${originalNote.title}`
    );

    // Log the event
    await AuditService.logEvent(
      'note_forked',
      authorId,
      originalNote.workspaceId.toString(),
      forkedNote._id.toString(),
      'note',
      { originalNoteId: id, branchName }
    );

    res.status(201).json(forkedNote);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fork note' });
  }
});

// Get diff between two versions
router.get('/:id/diff', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fromVersion, toVersion } = req.query;

    const persistence = PersistenceManager.getInstance();
    const fromDoc = fromVersion ? await persistence.reconstructDocument(id, parseInt(fromVersion as string)) : null;
    const toDoc = await persistence.reconstructDocument(id, parseInt(toVersion as string));

    if (!toDoc) {
      return res.status(404).json({ error: 'Version not found' });
    }

    const fromContent = fromDoc ? {
      title: fromDoc.getText('title').toString(),
      content: fromDoc.getText('content').toString(),
    } : { title: '', content: '' };

    const toContent = {
      title: toDoc.getText('title').toString(),
      content: toDoc.getText('content').toString(),
    };

    // Use diff-match-patch for detailed diff
    const dmp = new diff_match_patch();
    const titleDiff = dmp.diff_main(fromContent.title, toContent.title);
    dmp.diff_cleanupSemantic(titleDiff);
    const contentDiff = dmp.diff_main(fromContent.content, toContent.content);
    dmp.diff_cleanupSemantic(contentDiff);

    const diff = {
      title: {
        from: fromContent.title,
        to: toContent.title,
        changed: fromContent.title !== toContent.title,
        patches: dmp.patch_make(fromContent.title, toContent.title),
        diff: titleDiff.map(([op, text]: [number, string]) => ({
          operation: op === -1 ? 'delete' : op === 1 ? 'insert' : 'equal',
          text
        }))
      },
      content: {
        from: fromContent.content,
        to: toContent.content,
        changed: fromContent.content !== toContent.content,
        patches: dmp.patch_make(fromContent.content, toContent.content),
        diff: contentDiff.map(([op, text]: [number, string]) => ({
          operation: op === -1 ? 'delete' : op === 1 ? 'insert' : 'equal',
          text
        }))
      },
    };

    res.json(diff);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get diff' });
  }
});

// Merge a forked note back into the original
router.post('/:id/merge', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { forkedNoteId, authorId, mergeStrategy = 'overwrite' } = req.body;

    const originalNote = await Note.findById(id);
    const forkedNote = await Note.findById(forkedNoteId);
    if (!originalNote || !forkedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const persistence = PersistenceManager.getInstance();
    const originalDoc = await persistence.loadDocument(id);
    const forkedDoc = await persistence.loadDocument(forkedNoteId);

    if (!originalDoc || !forkedDoc) {
      return res.status(404).json({ error: 'Document state not found' });
    }

    // Simple merge strategy: overwrite with forked content
    // In a real implementation, you'd want conflict resolution
    const mergedTitle = forkedDoc.getText('title').toString();
    const mergedContent = forkedDoc.getText('content').toString();

    // Update original note
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title: mergedTitle, content: mergedContent, updatedAt: new Date() },
      { new: true }
    );

    // Save merged state
    await persistence.saveDocument(id, forkedDoc);
    await persistence.createVersion(id, authorId, originalNote.workspaceId.toString(), `Merged from fork ${forkedNote.title}`);

    // Log the event
    await AuditService.logEvent(
      'note_merged',
      authorId,
      originalNote.workspaceId.toString(),
      id,
      'note',
      { forkedNoteId, mergeStrategy }
    );

    res.json({ note: updatedNote });
  } catch (error) {
    res.status(500).json({ error: 'Failed to merge note' });
  }
});

export default router;
