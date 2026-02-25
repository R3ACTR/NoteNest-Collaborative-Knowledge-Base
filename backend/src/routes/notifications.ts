import express, { Request, Response } from 'express';
import Notification from '../models/Notification';
import { authenticateToken, requirePermission, AuthRequest } from '../middleware/auth';
import { getCacheService, CacheKeys } from '../services/cacheService';

const router = express.Router();

// Get unread notification count for user
router.get('/count', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const count = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
      dismissedAt: null,
    });
    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Failed to get notification count:', error);
    res.status(500).json({ error: 'Failed to get notification count' });
  }
});

// Get notifications for authenticated user
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { limit = 20, skip = 0, workspaceId } = req.query;

    const query: any = {
      recipientId: userId,
      dismissedAt: null,
    };

    if (workspaceId) {
      query.relatedWorkspaceId = workspaceId;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      total,
      unreadCount: await Notification.countDocuments({ ...query, isRead: false }),
    });
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.recipientId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    notification.isRead = true;
    notification.updatedAt = new Date();
    await notification.save();

    // Invalidate cache
    const cacheService = getCacheService();
    if (cacheService) {
      await cacheService.delete(`notifications:${userId}`);
    }

    res.json(notification);
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// Dismiss notification
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { id } = req.params;

    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Verify ownership
    if (notification.recipientId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    notification.dismissedAt = new Date();
    notification.updatedAt = new Date();
    await notification.save();

    // Invalidate cache
    const cacheService = getCacheService();
    if (cacheService) {
      await cacheService.delete(`notifications:${userId}`);
    }

    res.json({ message: 'Notification dismissed' });
  } catch (error) {
    console.error('Failed to dismiss notification:', error);
    res.status(500).json({ error: 'Failed to dismiss notification' });
  }
});

// Mark all notifications as read for user
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!._id.toString();
    const { workspaceId } = req.body;

    const query: any = {
      recipientId: userId,
      isRead: false,
      dismissedAt: null,
    };

    if (workspaceId) {
      query.relatedWorkspaceId = workspaceId;
    }

    const result = await Notification.updateMany(query, {
      isRead: true,
      updatedAt: new Date(),
    });

    // Invalidate cache
    const cacheService = getCacheService();
    if (cacheService) {
      await cacheService.delete(`notifications:${userId}`);
    }

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

export default router;
