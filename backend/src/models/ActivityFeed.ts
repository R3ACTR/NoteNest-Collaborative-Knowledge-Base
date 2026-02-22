import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityFeed extends Document {
  workspaceId: string; // workspace ID
  actorId: string; // user ID who performed the action
  action: string; // 'note_created', 'note_updated', 'note_deleted', 'member_added', 'member_removed', 'member_role_updated'
  target: string; // ID of the affected entity (note ID, user ID, etc.)
  targetType: string; // 'note', 'user', 'workspace'
  targetTitle?: string; // title of the affected entity (e.g., note title or user name)
  metadata: Record<string, any>; // additional data like old/new values
  createdAt: Date;
}

const ActivityFeedSchema: Schema = new Schema({
  workspaceId: { type: String, required: true, index: true },
  actorId: { type: String, required: true },
  action: { type: String, required: true },
  target: { type: String, required: true },
  targetType: { type: String, required: true },
  targetTitle: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Index for efficient queries
ActivityFeedSchema.index({ workspaceId: 1, createdAt: -1 });

export default mongoose.model<IActivityFeed>('ActivityFeed', ActivityFeedSchema);
