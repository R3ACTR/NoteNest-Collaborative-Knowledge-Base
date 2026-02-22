import express, { Request, Response } from 'express';
import ActivityFeed from '../models/ActivityFeed';
import { authenticateToken, requirePermission, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get activity feed for a workspace
router.get('/workspace/:workspaceId', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const { limit = 30, skip = 0 } = req.query;

    const activities = await ActivityFeed.find({ workspaceId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await ActivityFeed.countDocuments({ workspaceId });

    res.json({
      activities,
      total,
    });
  } catch (error) {
    console.error('Failed to fetch activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Get activity feed for a specific note
router.get('/note/:noteId', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const { noteId } = req.params;
    const { limit = 20, skip = 0 } = req.query;

    const activities = await ActivityFeed.find({
      target: noteId,
      targetType: 'note',
    })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await ActivityFeed.countDocuments({
      target: noteId,
      targetType: 'note',
    });

    res.json({
      activities,
      total,
    });
  } catch (error) {
    console.error('Failed to fetch activity feed for note:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

export default router;
