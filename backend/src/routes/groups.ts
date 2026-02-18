import express, { Request, Response } from 'express';
import Group from '../models/Group';
import User from '../models/User';
import { AuditService } from '../services/auditService';
import { authenticateToken, AuthRequest, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get groups for a workspace
router.get('/workspace/:workspaceId', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const groups = await Group.find({ workspaceId: req.params.workspaceId });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Create a new group
router.post('/', authenticateToken, requirePermission('manage_groups'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, workspaceId, parentId } = req.body;
    const userId = req.user!._id.toString();

    // Build path
    let path = workspaceId;
    if (parentId) {
      const parentGroup = await Group.findById(parentId);
      if (!parentGroup) {
        return res.status(404).json({ error: 'Parent group not found' });
      }
      path = `${parentGroup.path}/${parentId}`;
    }

    const group = new Group({
      name,
      description,
      workspaceId,
      parentId,
      path,
      members: [],
      createdBy: userId,
    });
    await group.save();

    // Log the event
    await AuditService.logEvent(
      'group_created',
      userId,
      workspaceId,
      group._id.toString(),
      'group',
      { name, description }
    );

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Add member to group
router.post('/:id/members', authenticateToken, requirePermission('manage_groups'), async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();

      // Update user's groups
      await User.findByIdAndUpdate(userId, { $addToSet: { groups: group._id.toString() } });

      // Log the event
      await AuditService.logEvent(
        'member_added_to_group',
        req.user!._id.toString(),
        group.workspaceId,
        userId,
        'user',
        { groupId: group._id.toString() }
      );
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add member to group' });
  }
});

// Remove member from group
router.delete('/:id/members/:userId', authenticateToken, requirePermission('manage_groups'), async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const memberIndex = group.members.indexOf(req.params.userId);
    if (memberIndex > -1) {
      group.members.splice(memberIndex, 1);
      await group.save();

      // Update user's groups
      await User.findByIdAndUpdate(req.params.userId, { $pull: { groups: group._id.toString() } });

      // Log the event
      await AuditService.logEvent(
        'member_removed_from_group',
        req.user!._id.toString(),
        group.workspaceId,
        req.params.userId,
        'user',
        { groupId: group._id.toString() }
      );
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove member from group' });
  }
});

// Delete a group
router.delete('/:id', authenticateToken, requirePermission('manage_groups'), async (req: AuthRequest, res: Response) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Remove group from all users
    await User.updateMany({ groups: group._id.toString() }, { $pull: { groups: group._id.toString() } });

    await Group.findByIdAndDelete(req.params.id);

    // Log the event
    await AuditService.logEvent(
      'group_deleted',
      req.user!._id.toString(),
      group.workspaceId,
      req.params.id,
      'group',
      { name: group.name }
    );

    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

export default router;
