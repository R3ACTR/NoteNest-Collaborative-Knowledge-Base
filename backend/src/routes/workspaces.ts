import express, { Request, Response } from 'express';
import crypto from 'crypto';
import Workspace from '../models/Workspace';
import WorkspaceInvite from '../models/WorkspaceInvite';
import User from '../models/User';
import { AuditService } from '../services/auditService';
import { authenticateToken, AuthRequest, requirePermission } from '../middleware/auth';
import { getCacheService, CacheKeys } from '../services/cacheService';
import { getEventBus } from '../services/eventBus';
import { EVENT_NAMES, WorkspaceCreatedEvent, MemberAddedToWorkspaceEvent, MemberRemovedFromWorkspaceEvent, MemberRoleUpdatedEvent } from '../types/events';

const router = express.Router();

// Get invite by token (Public)
router.get('/invites/:token', async (req: Request, res: Response) => {
  try {
    const invite = await WorkspaceInvite.findOne({ token: req.params.token, status: 'pending' });
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found or already used' });
    }
    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Invite has expired' });
    }

    const workspace = await Workspace.findById(invite.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json({
      workspaceName: workspace.name,
      email: invite.email,
      role: invite.role,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invite details' });
  }
});

// Accept an invite
router.post('/accept-invite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { token } = req.body;
    const invite = await WorkspaceInvite.findOne({ token, status: 'pending' });
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found or already used' });
    }
    if (new Date() > invite.expiresAt) {
      return res.status(400).json({ error: 'Invite has expired' });
    }

    const workspace = await Workspace.findById(invite.workspaceId);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(m => m.userId === req.user!._id.toString());
    if (existingMember) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    workspace.members.push({ userId: req.user!._id.toString(), role: invite.role as 'admin' | 'editor' | 'commenter' | 'viewer' });
    await workspace.save();

    invite.status = 'accepted';
    await invite.save();

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept invite' });
  }
});

// Get workspaces for a user
router.get('/user/:userId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }
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
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const ownerId = req.user!._id.toString();
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

// Get pending invites for workspace
router.get('/:id/invites', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    const invites = await WorkspaceInvite.find({ workspaceId: req.params.id, status: 'pending' });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch invites' });
  }
});

// Create an invite for workspace
router.post('/:id/invites', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { email, role } = req.body;
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

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    const invite = new WorkspaceInvite({
      workspaceId: req.params.id,
      email,
      role,
      token,
      inviterId: req.user!._id.toString(),
      expiresAt,
    });
    await invite.save();

    res.status(201).json(invite);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create invite' });
  }
});

// Revoke an invite
router.delete('/:id/invites/:inviteId', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    const invite = await WorkspaceInvite.findOne({ _id: req.params.inviteId, workspaceId: req.params.id });
    if (!invite) {
      return res.status(404).json({ error: 'Invite not found' });
    }

    invite.status = 'revoked';
    await invite.save();

    res.json({ message: 'Invite revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke invite' });
  }
});

export default router;
