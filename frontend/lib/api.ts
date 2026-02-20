import {
  AuditLog,
  Workspace,
  Note,
  NoteVersion,
  User,
  Folder,
  CreateWorkspaceRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
  DeleteNoteRequest,
  RestoreNoteRequest,
  ForkNoteRequest,
  MergeNoteRequest,
  NoteDiff,
  RegisterRequest,
  LoginRequest,
  RegisterResponse,
  LoginResponse,
  UserProfileResponse,
  NotesResponse,
  NoteResponse,
  NoteVersionsResponse,
  RestoreNoteResponse,
  WorkspacesResponse,
  WorkspaceResponse,
  AuditLogsResponse,
  ErrorResponse,
} from '../../shared/types';

export type {
  AuditLog,
  Workspace,
  Note,
  NoteVersion,
  User,
  Folder,
  CreateWorkspaceRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
  DeleteNoteRequest,
  RestoreNoteRequest,
  ForkNoteRequest,
  MergeNoteRequest,
  NoteDiff,
  RegisterRequest,
  LoginRequest,
  RegisterResponse,
  LoginResponse,
  UserProfileResponse,
  NotesResponse,
  NoteResponse,
  NoteVersionsResponse,
  RestoreNoteResponse,
  WorkspacesResponse,
  WorkspaceResponse,
  AuditLogsResponse,
  ErrorResponse,
};
// import { io } from "socket.io-client"; // Added at bottom

// Re-export types for convenience

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5002';

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set. Please create a .env file based on .env.example.');
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Permission denied');
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.json();
  }

  // Workspaces
  async getWorkspacesForUser(userId: string): Promise<Workspace[]> {
    return this.request(`/api/workspaces/user/${userId}`);
  }

  async createWorkspace(data: CreateWorkspaceRequest): Promise<Workspace> {
    return this.request('/api/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addMemberToWorkspace(workspaceId: string, data: AddMemberRequest): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async removeMemberFromWorkspace(workspaceId: string, userId: string): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateMemberRole(workspaceId: string, userId: string, data: UpdateMemberRoleRequest): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAuditLogs(workspaceId: string, limit = 50, skip = 0): Promise<AuditLog[]> {
    return this.request(`/api/workspaces/${workspaceId}/audit-logs?limit=${limit}&skip=${skip}`);
  }

  // Notes
  async getNotesForWorkspace(workspaceId: string): Promise<Note[]> {
    return this.request(`/api/notes/workspace/${workspaceId}`);
  }

  async getNote(id: string): Promise<Note> {
    return this.request(`/api/notes/${id}`);
  }

  async createNote(data: CreateNoteRequest): Promise<Note> {
    return this.request('/api/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
    return this.request(`/api/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string, data: DeleteNoteRequest): Promise<void> {
    return this.request(`/api/notes/${id}`, {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  }

  // Users
  async register(email: string, password: string, name: string): Promise<{ userId: string; message: string }> {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/api/users/${id}`);
  }

  // Note Versions
  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return this.request(`/api/notes/${noteId}/versions`);
  }

  async restoreNoteVersion(noteId: string, versionNumber: number, authorId: string): Promise<RestoreNoteResponse> {
    return this.request(`/api/notes/${noteId}/restore`, {
      method: 'POST',
      body: JSON.stringify({ versionNumber, authorId }),
    });
  }

  async forkNote(noteId: string, data: ForkNoteRequest): Promise<Note> {
    return this.request(`/api/notes/${noteId}/fork`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async mergeNote(noteId: string, data: MergeNoteRequest): Promise<RestoreNoteResponse> {
    return this.request(`/api/notes/${noteId}/merge`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getNoteDiff(noteId: string, fromVersion?: number, toVersion?: number): Promise<NoteDiff> {
    const params = new URLSearchParams();
    if (fromVersion !== undefined) params.append('fromVersion', fromVersion.toString());
    if (toVersion !== undefined) params.append('toVersion', toVersion.toString());
    return this.request(`/api/notes/${noteId}/diff?${params.toString()}`);
  }

  // Folders
  async getFolders(workspaceId: string): Promise<any[]> {
    return this.request(`/api/folders/workspace/${workspaceId}`);
  }

  async createFolder(data: { name: string; workspaceId: string; parentId?: string; createdBy: string }): Promise<any> {
    return this.request('/api/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFolder(id: string, data: { name?: string; parentId?: string }): Promise<any> {
    return this.request(`/api/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(id: string): Promise<void> {
    return this.request(`/api/folders/${id}`, {
      method: 'DELETE',
    });
  }

  // Tags
  async getWorkspaceTags(workspaceId: string): Promise<string[]> {
    return this.request(`/api/notes/workspace/${workspaceId}/tags`);
  }

  // Pin note
  async toggleNotePin(noteId: string, isPinned: boolean): Promise<Note> {
    return this.request(`/api/notes/${noteId}/pin`, {
      method: 'PATCH',
      body: JSON.stringify({ isPinned }),
    });
  }
}


import { io } from "socket.io-client";

export const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002", {
  autoConnect: false,
  auth: (cb) => {
    // We'll insert the token here when connecting
    const token = localStorage.getItem('token');
    cb({ token });
  }
});

export const apiService = new ApiService();

