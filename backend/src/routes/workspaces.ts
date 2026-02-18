import express, { Request, Response } from 'express';
import Workspace from '../models/Workspace';
import { AuditService } from '../services/auditService';
import { authenticateToken, AuthRequest, requirePermission } from '../middleware/auth';
import { getCacheService, CacheKeys } from '../services/cacheService';
import { getEventBus } from '../services/eventBus';
import { EVENT_NAMES, WorkspaceCreatedEvent, MemberAddedToWorkspaceEvent, MemberRemovedFromWorkspaceEvent, MemberRoleUpdatedEvent } from '../types/events';

const router = express.Router();

// Get workspaces for a user
router.get('/user/:userId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const cacheService = getCacheService();
    const cacheKey = CacheKeys.userWorkspaces(req.params.userId);

    // Try to get from cache first
    if (cacheService) {
      const cachedWorkspaces = await cacheService.get(cacheKey);
      if (cachedWorkspaces) {
        return res.json(cachedWorkspaces);
      }
    }

    const workspaces = await Workspace.find({ $or: [{ owner: req.params.userId }, { 'members.userId': req.params.userId }] });

    // Cache the result
    if (cacheService) {
      await cacheService.set(cacheKey, workspaces);
    }

    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workspaces' });
  }
});

// Create a new workspace
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, description, ownerId } = req.body;
    const workspace = new Workspace({ name, description, owner: ownerId });
    await workspace.save();

    // Emit domain event
    const eventBus = getEventBus();
    const event: WorkspaceCreatedEvent = {
      type: EVENT_NAMES.WORKSPACE_CREATED,
      timestamp: new Date(),
      actorId: ownerId,
      workspaceId: workspace._id.toString(),
      name,
      description,
      ownerId,
    };
    await eventBus.emit(EVENT_NAMES.WORKSPACE_CREATED, event);

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Add member to workspace
router.post('/:id/members', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check permissions: owner or admin
    const isOwner = workspace.owner === req.user!._id.toString();
    const member = workspace.members.find(m => m.userId === req.user!._id.toString());
    const isAdmin = member?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(m => m.userId === userId);
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    workspace.members.push({ userId, role });
    await workspace.save();

    // Emit domain event
    const eventBus = getEventBus();
    const event: MemberAddedToWorkspaceEvent = {
      type: EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE,
      timestamp: new Date(),
      actorId: req.user!._id.toString(),
      workspaceId: workspace._id.toString(),
      userId,
      role,
      addedBy: req.user!._id.toString(),
    };
    await eventBus.emit(EVENT_NAMES.MEMBER_ADDED_TO_WORKSPACE, event);

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Remove member from workspace
router.delete('/:id/members/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check permissions: owner or admin
    const isOwner = workspace.owner === req.user!._id.toString();
    const member = workspace.members.find(m => m.userId === req.user!._id.toString());
    const isAdmin = member?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Find the member to remove
    const memberIndex = workspace.members.findIndex(m => m.userId === req.params.userId);
    if (memberIndex === -1) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const removedMember = workspace.members.splice(memberIndex, 1)[0];
    await workspace.save();

    // Log the event
    await AuditService.logEvent(
      'member_removed_from_workspace',
      req.user!._id.toString(),
      workspace._id.toString(),
      req.params.userId,
      'user',
      { role: removedMember.role }
    );

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member' });
  }
});

// Update member role in workspace
router.put('/:id/members/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check permissions: owner or admin
    const isOwner = workspace.owner === req.user!._id.toString();
    const member = workspace.members.find(m => m.userId === req.user!._id.toString());
    const isAdmin = member?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Find the member to update
    const memberToUpdate = workspace.members.find(m => m.userId === req.params.userId);
    if (!memberToUpdate) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const oldRole = memberToUpdate.role;
    memberToUpdate.role = role;
    await workspace.save();

    // Emit domain event
    const eventBus = getEventBus();
    const event: MemberRoleUpdatedEvent = {
      type: EVENT_NAMES.MEMBER_ROLE_UPDATED,
      timestamp: new Date(),
      actorId: req.user!._id.toString(),
      workspaceId: workspace._id.toString(),
      userId: req.params.userId,
      oldRole,
      newRole: role,
      updatedBy: req.user!._id.toString(),
    };
    await eventBus.emit(EVENT_NAMES.MEMBER_ROLE_UPDATED, event);

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update member role' });
  }
});

// Get audit logs for workspace
router.get('/:id/audit-logs', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is a member of the workspace
    const isMember = workspace.members.some(m => m.userId === req.user!._id.toString()) || workspace.owner === req.user!._id.toString();
    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if user has admin role
    const member = workspace.members.find(m => m.userId === req.user!._id.toString());
    const isOwner = workspace.owner === req.user!._id.toString();
    const isAdmin = member?.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
    const skip = parseInt(req.query.skip as string) || 0;
    const logs = await AuditService.getLogsForWorkspace(req.params.id, limit, skip);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
