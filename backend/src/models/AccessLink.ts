import mongoose, { Schema, Document } from 'mongoose';

export interface IAccessLink extends Document {
  token: string; // unique token for the link
  resourcePath: string; // path to the resource being shared
  permissions: string[]; // permissions granted via this link
  invitedBy: string; // user ID who created the link
  invitedEmail?: string; // optional email of the invitee
  expiresAt: Date; // expiration date
  used: boolean; // whether the link has been used
  createdAt: Date;
}

const AccessLinkSchema: Schema = new Schema({
  token: { type: String, required: true, unique: true },
  resourcePath: { type: String, required: true },
  permissions: [{ type: String, required: true }],
  invitedBy: { type: String, required: true },
  invitedEmail: { type: String },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Indexes
// AccessLinkSchema.index({ token: 1 }); // Removed duplicate index
AccessLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

export default mongoose.model<IAccessLink>('AccessLink', AccessLinkSchema);
