import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  docState?: Buffer;
  workspaceId: string;
  folderId?: string; // Reference to folder for organization
  author: string; // user ID
  tags?: string[];
  isPinned?: boolean; // Workspace-level pinned note
  isFavorite?: boolean; // User-level favorite note
  yjsState?: Buffer; // Y.js document state
  version: number; // For optimistic concurrency control
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  docState: { type: Buffer }, // Y.js binary state
  workspaceId: { type: String, required: true },
  folderId: { type: String, default: null }, // Link to folder (null = root)
  author: { type: String, required: true },
  tags: [{ type: String }],
  isPinned: { type: Boolean, default: false }, // Workspace-level pinned
  isFavorite: { type: Boolean, default: false }, // User-level favorite
  yjsState: { type: Buffer }, // Store Y.js document state
  version: { type: Number, default: 1 }, // For optimistic concurrency control
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient queries
NoteSchema.index({ workspaceId: 1, folderId: 1 });
NoteSchema.index({ workspaceId: 1, isPinned: 1 });
NoteSchema.index({ tags: 1 });
NoteSchema.index({ author: 1 });

export default mongoose.model<INote>('Note', NoteSchema);
