import express, { Request, Response } from 'express';
import Permission from '../models/Permission';
import { AuditService } from '../services/auditService';
import { authenticateToken, AuthRequest, requirePermission } from '../middleware/auth';

const router = express.Router();

// Get permissions for a resource
router.get('/resource/:resourcePath', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const permissions = await Permission.find({ resourcePath: req.params.resourcePath });
    res.json(permissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

// Grant permission
router.post('/', authenticateToken, requirePermission('manage_permissions'), async (req: AuthRequest, res: Response) => {
  try {
    const { resourcePath, subjectId, subjectType, permissions, expiresAt } = req.body;
    const userId = req.user!._id.toString();

    const permission = new Permission({
      resourcePath,
      subjectId,
      subjectType,
      permissions,
      grantedBy: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });
    await permission.save();

    // Log the event
    await AuditService.logEvent(
      'permission_granted',
      userId,
      resourcePath.split('/')[0], // workspaceId
      subjectId,
      subjectType,
      { resourcePath, permissions, expiresAt }
    );

    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ error: 'Failed to grant permission' });
  }
});

// Revoke permission
router.delete('/:id', authenticateToken, requirePermission('manage_permissions'), async (req: AuthRequest, res: Response) => {
  try {
    const permission = await Permission.findById(req.params.id);
    if (!permission) {
      return res.status(404).json({ error: 'Permission not found' });
    }

    await Permission.findByIdAndDelete(req.params.id);

    // Log the event
    await AuditService.logEvent(
      'permission_revoked',
      req.user!._id.toString(),
      permission.resourcePath.split('/')[0],
      permission.subjectId,
      permission.subjectType,
      { resourcePath: permission.resourcePath, permissions: permission.permissions }
    );

    res.json({ message: 'Permission revoked' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke permission' });
  }
});

export default router;
