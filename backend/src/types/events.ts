// Domain Events for NoteNest

export interface BaseEvent {
  type: string;
  timestamp: Date;
  actorId: string;
  workspaceId: string;
}

// Note Events
export interface NoteCreatedEvent extends BaseEvent {
  noteId: string;
  title: string;
  authorId: string;
}

export interface NoteUpdatedEvent extends BaseEvent {
  noteId: string;
  title: string;
  changes: {
    title?: { from: string; to: string };
    content?: { from: string; to: string };
  };
}

export interface NoteDeletedEvent extends BaseEvent {
  noteId: string;
  title: string;
}

// Workspace Events
export interface WorkspaceCreatedEvent extends BaseEvent {
  workspaceId: string;
  name: string;
  description?: string;
  ownerId: string;
}

// Member Events
export interface MemberAddedToWorkspaceEvent extends BaseEvent {
  workspaceId: string;
  userId: string;
  role: string;
  addedBy: string;
}

export interface MemberRemovedFromWorkspaceEvent extends BaseEvent {
  workspaceId: string;
  userId: string;
  role: string;
  removedBy: string;
}

export interface MemberRoleUpdatedEvent extends BaseEvent {
  workspaceId: string;
  userId: string;
  oldRole: string;
  newRole: string;
  updatedBy: string;
}

// Event Types Union
export type DomainEvent =
  | NoteCreatedEvent
  | NoteUpdatedEvent
  | NoteDeletedEvent
  | WorkspaceCreatedEvent
  | MemberAddedToWorkspaceEvent
  | MemberRemovedFromWorkspaceEvent
  | MemberRoleUpdatedEvent;

// Event Names
export const EVENT_NAMES = {
  NOTE_CREATED: 'note.created',
  NOTE_UPDATED: 'note.updated',
  NOTE_DELETED: 'note.deleted',
  WORKSPACE_CREATED: 'workspace.created',
  MEMBER_ADDED_TO_WORKSPACE: 'member.added_to_workspace',
  MEMBER_REMOVED_FROM_WORKSPACE: 'member.removed_from_workspace',
  MEMBER_ROLE_UPDATED: 'member.role_updated',
} as const;

export type EventName = typeof EVENT_NAMES[keyof typeof EVENT_NAMES];
