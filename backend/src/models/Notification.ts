import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: string; // user ID receiving the notification
  type: string; // 'mention', 'comment', 'permission_invite', 'note_shared'
  title: string; // notification title
  message: string; // notification message
  relatedNoteId?: string; // related note ID (for mention/comment notifications)
  relatedUserId?: string; // user who triggered the notification
  relatedWorkspaceId: string; // workspace ID
  actionUrl?: string; // URL to navigate to (e.g., /notes/{noteId})
  isRead: boolean; // whether user has read the notification
  dismissedAt?: Date; // when user dismissed the notification
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
  recipientId: { type: String, required: true, index: true },
  type: { type: String, required: true, enum: ['mention', 'comment', 'permission_invite', 'note_shared', 'member_added'] },
  title: { type: String, required: true },
  message: { type: String, required: true },
  relatedNoteId: { type: String, index: true },
  relatedUserId: { type: String },
  relatedWorkspaceId: { type: String, required: true, index: true },
  actionUrl: { type: String },
  isRead: { type: Boolean, default: false, index: true },
  dismissedAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
});

// Index for efficient queries
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientId: 1, relatedWorkspaceId: 1, createdAt: -1 });

export default mongoose.model<INotification>('Notification', NotificationSchema);
