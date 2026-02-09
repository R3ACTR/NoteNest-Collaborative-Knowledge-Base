/**
 * Centralized role-based permission mapping for NoteNest UI.
 * Aligns with docs/roles-access.md: Admin, Editor, Viewer.
 * Frontend-only; backend must enforce authorization separately.
 */

export type UserRole = "admin" | "editor" | "viewer";

export const ROLES: UserRole[] = ["admin", "editor", "viewer"];

export function isValidRole(value: unknown): value is UserRole {
  return typeof value === "string" && ROLES.includes(value as UserRole);
}

/** Permissions for content (notes) */
export function canCreateNote(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canEditNote(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

export function canDeleteNote(role: UserRole): boolean {
  return role === "admin" || role === "editor";
}

/** Admin-only: invite/remove members, change roles, workspace settings, delete workspace */
export function canAccessManagement(role: UserRole): boolean {
  return role === "admin";
}

export interface Permissions {
  role: UserRole;
  canCreateNote: boolean;
  canEditNote: boolean;
  canDeleteNote: boolean;
  canAccessManagement: boolean;
  isViewer: boolean;
  isEditor: boolean;
  isAdmin: boolean;
}

export function getPermissions(role: UserRole): Permissions {
  return {
    role,
    canCreateNote: canCreateNote(role),
    canEditNote: canEditNote(role),
    canDeleteNote: canDeleteNote(role),
    canAccessManagement: canAccessManagement(role),
    isViewer: role === "viewer",
    isEditor: role === "editor",
    isAdmin: role === "admin",
  };
}
