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

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
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

  async pinNote(id: string, isPinned: boolean): Promise<Note> {
    return this.request(`/api/notes/${id}/pin`, {
      method: "PATCH",
      body: JSON.stringify({ isPinned }),
    });
  }

  /* ---------- Bulk Operations ---------- */
  async bulkPinNotes(noteIds: string[], isPinned: boolean, authorId: string): Promise<{ modifiedCount: number }> {
    return this.request("/api/notes/bulk/pin", {
      method: "POST",
      body: JSON.stringify({ noteIds, isPinned, authorId }),
    });
  }

  async bulkDeleteNotes(noteIds: string[], authorId: string): Promise<{ deletedCount: number }> {
    return this.request("/api/notes/bulk", {
      method: "DELETE",
      body: JSON.stringify({ noteIds, authorId }),
    });
  }

  async bulkMoveNotesToFolder(
    noteIds: string[],
    folderId: string | null,
    authorId: string
  ): Promise<{ modifiedCount: number }> {
    return this.request("/api/notes/bulk/move-to-folder", {
      method: "PATCH",
      body: JSON.stringify({ noteIds, folderId, authorId }),
    });
  }

  async bulkAddTagsToNotes(
    noteIds: string[],
    tags: string[],
    authorId: string
  ): Promise<{ modifiedCount: number }> {
    return this.request("/api/notes/bulk/add-tags", {
      method: "PATCH",
      body: JSON.stringify({ noteIds, tags, authorId }),
    });
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