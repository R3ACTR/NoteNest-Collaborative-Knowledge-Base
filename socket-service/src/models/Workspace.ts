import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkspace extends Document {
    name: string;
    description?: string;
    owner: string; // user ID
    members: { userId: string; role: 'admin' | 'editor' | 'viewer' }[];
    createdAt: Date;
}

const WorkspaceSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    owner: { type: String, required: true },
    members: [{
        userId: { type: String, required: true },
        role: { type: String, enum: ['admin', 'editor', 'viewer'], required: true }
    }],
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
