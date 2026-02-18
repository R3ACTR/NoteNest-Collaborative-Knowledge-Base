import mongoose, { Schema, Document } from 'mongoose';

export interface IFolder extends Document {
  name: string;
  workspaceId: string;
  parentId?: string | null; // null for root folders
  path: string; // materialized path, e.g., "workspaceId/folderId1/folderId2/"
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}

const FolderSchema: Schema = new Schema({
  name: { type: String, required: true },
  workspaceId: { type: String, required: true },
  parentId: { type: String, default: null },
  path: { type: String, required: true, unique: true }, // ensure unique paths
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient path queries
// FolderSchema.index({ path: 1 }); // Removed duplicate index
FolderSchema.index({ workspaceId: 1 });

export default mongoose.model<IFolder>('Folder', FolderSchema);
