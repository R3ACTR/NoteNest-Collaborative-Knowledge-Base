import {
  AuditLog,
  Workspace,
  Note,
  NoteVersion,
  User,
  Folder,
  Template,
  TemplateCategory,
  TemplateVisibility,
  TemplatePlaceholder,
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
  Template,
  TemplateCategory,
  TemplateVisibility,
  TemplatePlaceholder,
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

  /* ---------- Auth ---------- */
  async login(email: string, password: string): Promise<LoginResponse> {
    return this.request('/api/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string): Promise<RegisterResponse> {
    return this.request('/api/users/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
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

  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return this.request(`/api/notes/${noteId}/versions`);
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

  async getNoteVersions(noteId: string): Promise<NoteVersion[]> {
    return this.request(`/api/notes/${noteId}/versions`);
  }

  async getNoteDiff(
    noteId: string,
    version1: string | number,
    version2: string | number
  ): Promise<NoteDiff> {
    return this.request(
      `/api/notes/${noteId}/diff?v1=${version1}&v2=${version2}`
    );
  }

  async restoreNoteVersion(
    noteId: string,
    versionNumber: number | string,
    authorId: string
  ): Promise<RestoreNoteResponse> {
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

  /* ---------- Tags & Folders ---------- */
  async getWorkspaceTags(workspaceId: string): Promise<string[]> {
    return this.request(`/api/notes/workspace/${workspaceId}/tags`);
  }

  /* ---------- Folders ---------- */
  async getFolders(workspaceId: string): Promise<Folder[]> {
    return this.request(`/api/folders/workspace/${workspaceId}`);
  }

  async createFolder(data: { name: string; workspaceId: string; parentId?: string }): Promise<Folder> {
    return this.request('/api/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(folderId: string): Promise<void> {
    return this.request(`/api/folders/${folderId}`, { method: 'DELETE' });
  }

  /* ---------- Invites ---------- */
  async getInvites(workspaceId: string): Promise<unknown[]> {
    return this.request(`/api/workspaces/${workspaceId}/invites`);
  }

  /* ---------- Authentication ---------- */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<UserProfileResponse> {
    return this.request("/api/auth/profile");
  }

  /* ---------- Notifications ---------- */
  async getNotifications(
    workspaceId?: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<{ notifications: any[]; total: number; unreadCount: number }> {
    const params = new URLSearchParams();
    if (workspaceId) params.append("workspaceId", workspaceId);
    params.append("limit", limit.toString());
    params.append("skip", skip.toString());
    return this.request(`/api/notifications?${params.toString()}`);
  }

  async getUnreadNotificationCount(): Promise<{ unreadCount: number }> {
    return this.request("/api/notifications/count");
  }

  async markNotificationAsRead(notificationId: string): Promise<any> {
    return this.request(`/api/notifications/${notificationId}/read`, {
      method: "PATCH",
    });
  }

  async dismissNotification(
    notificationId: string
  ): Promise<{ message: string }> {
    return this.request(`/api/notifications/${notificationId}`, {
      method: "DELETE",
    });
  }

  async markAllNotificationsAsRead(
    workspaceId?: string
  ): Promise<{ message: string; modifiedCount: number }> {
    return this.request("/api/notifications/read-all", {
      method: "PATCH",
      body: JSON.stringify({ workspaceId }),
    });
  }

  /* ---------- Activity Feed ---------- */
  async getWorkspaceActivity(
    workspaceId: string,
    limit: number = 30,
    skip: number = 0
  ): Promise<{ activities: any[]; total: number }> {
    return this.request(
      `/api/activities/workspace/${workspaceId}?limit=${limit}&skip=${skip}`
    );
  }

  async getNoteActivity(
    noteId: string,
    limit: number = 20,
    skip: number = 0
  ): Promise<{ activities: any[]; total: number }> {
    return this.request(
      `/api/activities/note/${noteId}?limit=${limit}&skip=${skip}`
    );
  }
  /* ---------- Templates ---------- */
  async getBuiltInTemplates(): Promise<{ templates: Template[] }> {
    return this.request('/api/templates/builtin');
  }

  async getWorkspaceTemplates(
    workspaceId: string,
    params?: { category?: string; tags?: string; search?: string; visibility?: string }
  ): Promise<{ templates: Template[] }> {
    const q = new URLSearchParams(params as Record<string, string> || {}).toString();
    return this.request(`/api/templates/workspace/${workspaceId}${q ? `?${q}` : ''}`);
  }

  async getTemplate(id: string): Promise<{ template: Template }> {
    return this.request(`/api/templates/${id}`);
  }

  async createTemplate(
    workspaceId: string,
    data: Omit<Partial<Template>, '_id' | 'usageCount' | 'isBuiltIn' | 'version'>
  ): Promise<{ template: Template }> {
    return this.request(`/api/templates/workspace/${workspaceId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTemplate(
    id: string,
    data: Partial<Template>
  ): Promise<{ template: Template }> {
    return this.request(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteTemplate(id: string): Promise<{ deleted: boolean; id: string }> {
    return this.request(`/api/templates/${id}`, { method: 'DELETE' });
  }

  async copyTemplate(
    id: string,
    targetWorkspaceId?: string,
    visibility?: string
  ): Promise<{ template: Template }> {
    return this.request(`/api/templates/${id}/copy`, {
      method: 'POST',
      body: JSON.stringify({ targetWorkspaceId, visibility }),
    });
  }

  async useTemplate(
    id: string,
    values: Record<string, string>
  ): Promise<{ title: string; body: string }> {
    return this.request(`/api/templates/${id}/use`, {
      method: 'POST',
      body: JSON.stringify({ values }),
    });
  }

  async seedBuiltInTemplates(workspaceId: string): Promise<{ seeded: number; total: number }> {
    return this.request(`/api/templates/seed/${workspaceId}`, { method: 'POST' });
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