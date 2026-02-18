import mongoose, { Schema, Document } from 'mongoose';

export interface IPermission extends Document {
  resourcePath: string; // materialized path, e.g., "workspaceId/folderId/noteId"
  subjectId: string; // user or group ID
  subjectType: 'user' | 'group';
  permissions: string[]; // e.g., ['read', 'write', 'delete']
  grantedBy: string; // user ID who granted
  expiresAt?: Date; // optional for temporary permissions
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema: Schema = new Schema({
  resourcePath: { type: String, required: true },
  subjectId: { type: String, required: true },
  subjectType: { type: String, enum: ['user', 'group'], required: true },
  permissions: [{ type: String, required: true }],
  grantedBy: { type: String, required: true },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indexes for efficient queries
PermissionSchema.index({ resourcePath: 1 });
PermissionSchema.index({ subjectId: 1, subjectType: 1 });
PermissionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for expiration

export default mongoose.model<IPermission>('Permission', PermissionSchema);
