// Base Entity Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Workspace {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  members: { userId: string; role: 'admin' | 'editor' | 'viewer' }[];
  createdAt: string;
  updatedAt?: string;
}

export interface Note {
  _id: string;
  title: string;
  content: string;
  workspaceId: string;
  folderId?: string;
  author: string;
  tags?: string[];
  isPinned?: boolean;
  isFavorite?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  _id: string;
  name: string;
  workspaceId: string;
  parentId?: string;
  path: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteVersion {
  _id: string;
  noteId: string;
  versionNumber: number;
  contentSnapshot: {
    title: string;
    content: string;
  };
  author: string;
  workspaceId: string;
  timestamp: string;
  metadata?: {
    reason?: string;
    source?: string;
  };
}

export interface AuditLog {
  _id: string;
  action: string;
  actor: {
    _id: string;
    name: string;
    email: string;
  };
  workspaceId: string;
  target: string;
  targetType: string;
  timestamp: string;
  metadata: Record<string, any>;
}

// API Request Types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  workspaceId: string;
  folderId?: string;
  tags?: string[];
  authorId: string;
}

export interface UpdateNoteRequest {
  title: string;
  content: string;
  folderId?: string;
  tags?: string[];
  isPinned?: boolean;
  authorId: string;
}

export interface DeleteNoteRequest {
  authorId: string;
}

export interface RestoreNoteRequest {
  versionNumber: number;
  authorId: string;
}

export interface ForkNoteRequest {
  authorId: string;
  branchName?: string;
}

export interface MergeNoteRequest {
  forkedNoteId: string;
  authorId: string;
  mergeStrategy?: string;
}

export interface NoteDiff {
  title: {
    from: string;
    to: string;
    changed: boolean;
    patches: any[];
    diff: Array<{
      operation: 'delete' | 'insert' | 'equal';
      text: string;
    }>;
  };
  content: {
    from: string;
    to: string;
    changed: boolean;
    patches: any[];
    diff: Array<{
      operation: 'delete' | 'insert' | 'equal';
      text: string;
    }>;
  };
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
  ownerId: string;
}

export interface UpdateWorkspaceRequest {
  name: string;
  description?: string;
  ownerId: string;
}

export interface AddMemberRequest {
  userId: string;
  role: 'admin' | 'editor' | 'viewer';
  addedBy: string;
}

export interface UpdateMemberRoleRequest {
  role: 'admin' | 'editor' | 'viewer';
}

// API Response Types
export interface RegisterResponse {
  userId: string;
  message: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface UserProfileResponse extends User {}

export interface NotesResponse {
  notes: Note[];
}

export interface NoteResponse extends Note {}

export interface NoteVersionsResponse {
  versions: NoteVersion[];
}

export interface RestoreNoteResponse {
  note: Note;
  newVersion: NoteVersion;
}

export interface WorkspacesResponse {
  workspaces: Workspace[];
}

export interface WorkspaceResponse extends Workspace {}

export interface AuditLogsResponse {
  logs: AuditLog[];
}

// Common Types
export interface ErrorResponse {
  error: string;
}
