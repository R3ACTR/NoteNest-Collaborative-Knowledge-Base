import {
  AuditLog,
  Workspace,
  Note,
  NoteVersion,
  User,
  CreateWorkspaceRequest,
  AddMemberRequest,
  UpdateMemberRoleRequest,
  CreateNoteRequest,
  UpdateNoteRequest,
  DeleteNoteRequest,
  RestoreNoteRequest,
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
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

  async restoreNoteVersion(noteId: string, data: RestoreNoteRequest): Promise<RestoreNoteResponse> {
    return this.request(`/api/notes/${noteId}/restore`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
