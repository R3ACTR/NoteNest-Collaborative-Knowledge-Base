import mongoose, { Schema, Document } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  description?: string;
  workspaceId: string;
  parentId?: string; // null for root groups
  path: string; // materialized path, e.g., "workspaceId/groupId1/groupId2/"
  members: string[]; // user IDs
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  workspaceId: { type: String, required: true },
  parentId: { type: String, default: null },
  path: { type: String, required: true, unique: true },
  members: [{ type: String }],
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient path queries
// GroupSchema.index({ path: 1 }); // Removed duplicate index
GroupSchema.index({ workspaceId: 1 });
GroupSchema.index({ members: 1 });

export default mongoose.model<IGroup>('Group', GroupSchema);
