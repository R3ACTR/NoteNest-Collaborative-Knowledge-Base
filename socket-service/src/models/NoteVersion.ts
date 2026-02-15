import mongoose, { Schema, Document } from 'mongoose';

export interface INoteVersion extends Document {
    noteId: string;
    versionNumber: number;
    contentSnapshot: {
        title: string;
        content: string;
    };
    author: string; // user ID
    timestamp: Date;
    metadata?: {
        reason?: string;
        source?: string;
    };
    workspaceId: string; // for workspace-awareness
}

const NoteVersionSchema: Schema = new Schema({
    noteId: { type: String, required: true },
    versionNumber: { type: Number, required: true },
    contentSnapshot: {
        title: { type: String, required: true },
        content: { type: String, required: true },
    },
    author: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: {
        reason: { type: String },
        source: { type: String },
    },
    workspaceId: { type: String, required: true },
});

// Compound index for efficient querying by noteId and versionNumber
NoteVersionSchema.index({ noteId: 1, versionNumber: 1 });

export default mongoose.model<INoteVersion>('NoteVersion', NoteVersionSchema);
