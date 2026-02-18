import mongoose, { Schema, Document } from 'mongoose';

export interface INoteVersion extends Document {
  noteId: string;
  versionNumber: number;
  delta: Buffer; // Y.js update from previous version (full state for v1)
  stateVector: Buffer; // Y.js state vector after applying this delta
  author: string; // user ID
  timestamp: Date;
  metadata?: {
    reason?: string;
    source?: string;
  };
  workspaceId: string; // for workspace-awareness
  parentVersion?: number; // for branching support
  branchName?: string; // optional branch identifier
}

const NoteVersionSchema: Schema = new Schema({
  noteId: { type: String, required: true },
  versionNumber: { type: Number, required: true },
  delta: { type: Buffer, required: true },
  author: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  metadata: {
    reason: { type: String },
    source: { type: String },
  },
  workspaceId: { type: String, required: true },
  parentVersion: { type: Number },
  branchName: { type: String },
});

// Compound index for efficient querying by noteId and versionNumber
NoteVersionSchema.index({ noteId: 1, versionNumber: 1 });

export default mongoose.model<INoteVersion>('NoteVersion', NoteVersionSchema);
