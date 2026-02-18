import { AuditService } from './auditService';
import { getCacheService, CacheKeys } from './cacheService';
import { getEventBus } from './eventBus';
import { EVENT_NAMES, DomainEvent } from '../types/events';
import logger from '../utils/logger';

// Audit Logging Listener
async function auditLoggingListener(event: DomainEvent): Promise<void> {
  let action: string;
  let target: string;
  let targetType: string;
  let metadata: Record<string, any> = {};

  switch (event.type) {
    case EVENT_NAMES.NOTE_CREATED:
      const noteCreated = event as any;
      action = 'note_created';
      target = noteCreated.noteId;
      targetType = 'note';
      metadata = { title: noteCreated.title };
      break;
    case EVENT_NAMES.NOTE_UPDATED:
      const noteUpdated = event as any;
      action = 'note_updated';
      target = noteUpdated.noteId;
      targetType = 'note';
      metadata = { title: noteUpdated.title, changes: noteUpdated.changes };
      break;
    case EVENT_NAMES.NOTE_DELETED:
      const noteDeleted = event as any;
      action = 'note_deleted';
      target = noteDeleted.noteId;
      targetType = 'note';
      metadata = { title: noteDeleted.title };
      break;
    case EVENT_NAMES.WORKSPACE_CREATED:
      const workspaceCreated = event as any;
      action = 'workspace_created';
      target = workspaceCreated.workspaceId;
      targetType = 'workspace';
      metadata = { name: workspaceCreated.name, description: workspaceCreated.description };
      break;
    case EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE:
      const memberAdded = event as any;
      action = 'member_added_to_workspace';
      target = memberAdded.userId;
      targetType = 'user';
      metadata = { role: memberAdded.role };
      break;
    case EVENT_NAMES.MEMBER_REMOVED_FROM_WORKSPACE:
      const memberRemoved = event as any;
      action = 'member_removed_from_workspace';
      target = memberRemoved.userId;
      targetType = 'user';
      metadata = { role: memberRemoved.role };
      break;
    case EVENT_NAMES.MEMBER_ROLE_UPDATED:
      const roleUpdated = event as any;
      action = 'member_role_updated';
      target = roleUpdated.userId;
      targetType = 'user';
      metadata = { oldRole: roleUpdated.oldRole, newRole: roleUpdated.newRole };
      break;
    default:
      logger.warn(`Unknown event type: ${event}`);
      return;
  }

  await AuditService.logEvent(action, event.actorId, event.workspaceId, target, targetType, metadata);
}

// Cache Invalidation Listener
async function cacheInvalidationListener(event: DomainEvent): Promise<void> {
  const cacheService = getCacheService();
  if (!cacheService) return;

  switch (event.type) {
    case EVENT_NAMES.NOTE_CREATED:
    case EVENT_NAMES.NOTE_UPDATED:
    case EVENT_NAMES.NOTE_DELETED:
      const noteEvent = event as any;
      await cacheService.delete(CacheKeys.note(noteEvent.noteId));
      await cacheService.delete(CacheKeys.workspaceNotes(noteEvent.workspaceId));
      await cacheService.delete(CacheKeys.noteVersions(noteEvent.noteId));
      break;
    case EVENT_NAMES.WORKSPACE_CREATED:
      const workspaceEvent = event as any;
      await cacheService.delete(CacheKeys.userWorkspaces(workspaceEvent.ownerId));
      break;
    case EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE:
    case EVENT_NAMES.MEMBER_REMOVED_FROM_WORKSPACE:
    case EVENT_NAMES.MEMBER_ROLE_UPDATED:
      const memberEvent = event as any;
      await cacheService.delete(CacheKeys.userWorkspaces(memberEvent.userId));
      break;
    default:
      // No cache invalidation needed
      break;
  }
}

// Activity Feed Listener (placeholder for future implementation)
async function activityFeedListener(event: DomainEvent): Promise<void> {
  // Placeholder: In a real implementation, this would update an activity feed
  // For now, just log the activity
  logger.info(`Activity: ${event.timestamp} - ${JSON.stringify(event)}`);
}

// Register all listeners
export function registerEventListeners(): void {
  const eventBus = getEventBus();

  // Audit logging for all events
  eventBus.subscribe(EVENT_NAMES.NOTE_CREATED, auditLoggingListener);
  eventBus.subscribe(EVENT_NAMES.NOTE_UPDATED, auditLoggingListener);
  eventBus.subscribe(EVENT_NAMES.NOTE_DELETED, auditLoggingListener);
  eventBus.subscribe(EVENT_NAMES.WORKSPACE_CREATED, auditLoggingListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE, auditLoggingListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_REMOVED_FROM_WORKSPACE, auditLoggingListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_ROLE_UPDATED, auditLoggingListener);

  // Cache invalidation for relevant events
  eventBus.subscribe(EVENT_NAMES.NOTE_CREATED, cacheInvalidationListener);
  eventBus.subscribe(EVENT_NAMES.NOTE_UPDATED, cacheInvalidationListener);
  eventBus.subscribe(EVENT_NAMES.NOTE_DELETED, cacheInvalidationListener);
  eventBus.subscribe(EVENT_NAMES.WORKSPACE_CREATED, cacheInvalidationListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE, cacheInvalidationListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_REMOVED_FROM_WORKSPACE, cacheInvalidationListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_ROLE_UPDATED, cacheInvalidationListener);

  // Activity feed updates
  eventBus.subscribe(EVENT_NAMES.NOTE_CREATED, activityFeedListener);
  eventBus.subscribe(EVENT_NAMES.NOTE_UPDATED, activityFeedListener);
  eventBus.subscribe(EVENT_NAMES.NOTE_DELETED, activityFeedListener);
  eventBus.subscribe(EVENT_NAMES.WORKSPACE_CREATED, activityFeedListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE, activityFeedListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_REMOVED_FROM_WORKSPACE, activityFeedListener);
  eventBus.subscribe(EVENT_NAMES.MEMBER_ROLE_UPDATED, activityFeedListener);

  logger.info('Event listeners registered successfully');
}
