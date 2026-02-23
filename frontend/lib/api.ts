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
} from "../../shared/types";

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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5002";

/* ---------- Safe API base URL ---------- */
function getApiBaseUrl() {
  if (!API_BASE_URL) {
    console.warn(
      "NEXT_PUBLIC_API_URL is not set. API requests will be disabled."
    );
    return "";
  }
  return API_BASE_URL;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<any> {
    const baseUrl = getApiBaseUrl();
    if (!baseUrl) {
      throw new Error("API base URL is not configured");
    }

    const url = `${baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Permission denied");
      }
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  /* ---------- Workspaces ---------- */
  async getWorkspacesForUser(userId: string): Promise<Workspace[]> {
    return this.request(`/api/workspaces/user/${userId}`);
  }

  async createWorkspace(
    data: CreateWorkspaceRequest
  ): Promise<Workspace> {
    return this.request("/api/workspaces", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async addMemberToWorkspace(
    workspaceId: string,
    data: AddMemberRequest
  ): Promise<Workspace> {
    return this.request(`/api/workspaces/${workspaceId}/members`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async removeMemberFromWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<Workspace> {
    return this.request(
      `/api/workspaces/${workspaceId}/members/${userId}`,
      { method: "DELETE" }
    );
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<Workspace> {
    return this.request(
      `/api/workspaces/${workspaceId}/members/${userId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async getAuditLogs(
    workspaceId: string,
    limit = 50,
    skip = 0
  ): Promise<AuditLog[]> {
    return this.request(
      `/api/workspaces/${workspaceId}/audit-logs?limit=${limit}&skip=${skip}`
    );
  }

  async getInviteDetails(token: string): Promise<any> {
    return this.request(`/api/workspaces/invite/${token}`);
  }

  async acceptInvite(token: string): Promise<any> {
    return this.request(`/api/workspaces/invite/${token}/accept`, {
      method: "POST",
    });
  }

  async getInvites(workspaceId: string): Promise<any[]> {
    return this.request(`/api/workspaces/${workspaceId}/invites`);
  }

  async createInvite(workspaceId: string, email: string, role: string): Promise<any> {
    return this.request(`/api/workspaces/${workspaceId}/invites`, {
      method: "POST",
      body: JSON.stringify({ email, role }),
    });
  }

  async revokeInvite(workspaceId: string, inviteId: string): Promise<any> {
    return this.request(`/api/workspaces/${workspaceId}/invites/${inviteId}`, {
      method: "DELETE",
    });
  }

  /* ---------- Notes ---------- */
  async getNotesForWorkspace(workspaceId: string): Promise<Note[]> {
    return this.request(`/api/notes/workspace/${workspaceId}`);
  }

  async getNote(id: string): Promise<Note> {
    return this.request(`/api/notes/${id}`);
  }

  async createNote(data: CreateNoteRequest): Promise<Note> {
    return this.request("/api/notes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateNote(id: string, data: UpdateNoteRequest): Promise<Note> {
    return this.request(`/api/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteNote(id: string, data: DeleteNoteRequest): Promise<void> {
    return this.request(`/api/notes/${id}`, {
      method: "DELETE",
      body: JSON.stringify(data),
    });
  }

  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return this.request(`/api/notes/${noteId}/versions`);
  }

  async getNoteDiff(noteId: string, version1Id: string | number, version2Id: string | number): Promise<NoteDiff> {
    return this.request(`/api/notes/${noteId}/diff?v1=${version1Id}&v2=${version2Id}`);
  }

  async restoreNoteVersion(noteId: string, versionNumber: number | string, authorId: string): Promise<RestoreNoteResponse> {
    return this.request(`/api/notes/${noteId}/restore`, {
      method: "POST",
      body: JSON.stringify({ versionNumber, authorId }),
    });
  }

  async forkNote(noteId: string, data: ForkNoteRequest): Promise<Note> {
    return this.request(`/api/notes/${noteId}/fork`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async mergeNote(noteId: string, data: MergeNoteRequest): Promise<Note> {
    return this.request(`/api/notes/${noteId}/merge`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getWorkspaceTags(workspaceId: string): Promise<string[]> {
    return this.request(`/api/workspaces/${workspaceId}/tags`);
  }

  async getFolders(workspaceId: string): Promise<Folder[]> {
    return this.request(`/api/workspaces/${workspaceId}/folders`);
  }

  /* ---------- Users ---------- */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<{ userId: string; message: string }> {
    return this.request("/api/users/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: User }> {
    return this.request("/api/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getUser(id: string): Promise<User> {
    return this.request(`/api/users/${id}`);
  }
}

/* ---------- Socket ---------- */
import { io } from "socket.io-client";

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    const token = localStorage.getItem("token");
    cb({ token });
  },
});

export const apiService = new ApiService();