import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Permission from '../models/Permission';
import Group from '../models/Group';
import AccessLink from '../models/AccessLink';
import logger from '../utils/logger';
import { getCacheService, CacheKeys } from '../services/cacheService';

export interface AuthRequest extends Request {
  user?: any;
  effectivePermissions?: string[];
}

// Utility to escape regular expression special characters
export const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// New function to resolve effective permissions for a user on a resource path
export const resolvePermissions = async (userId: string, resourcePath: string): Promise<string[]> => {
  const cacheService = getCacheService();
  const cacheKey = CacheKeys.permission(userId, resourcePath);

  // Try to get from cache first
  if (cacheService) {
    const cachedPermissions = await cacheService.get<string[]>(cacheKey);
    if (cachedPermissions) {
      return cachedPermissions;
    }
  }

  const permissions: string[] = [];

  // Check workspace membership permissions for workspace-related resources
  if (resourcePath.includes('/')) {
    const workspaceId = resourcePath.split('/')[0];
    try {
      const workspace = await require('../models/Workspace').default.findById(workspaceId);
      if (workspace) {
        const member = workspace.members.find((m: any) => m.userId.toString() === userId);
        if (member) {
          // Grant permissions based on workspace role
          switch (member.role) {
            case 'admin':
              permissions.push('read', 'write', 'delete', 'manage_groups', 'manage_permissions');
              break;
            case 'editor':
              permissions.push('read', 'write');
              break;
            case 'viewer':
            default:
              permissions.push('read');
              break;
          }
        }
      }
    } catch (error) {
      // Ignore workspace lookup errors
    }
  }

  // Get direct user permissions
  const escapedResourcePath = escapeRegExp(resourcePath);
  const userPerms = await Permission.find({
    subjectId: userId,
    subjectType: 'user',
    resourcePath: { $regex: `^${escapedResourcePath}` }, // prefix match for inheritance
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]
  });

  userPerms.forEach(perm => permissions.push(...perm.permissions));

  // Get permissions from user's groups
  const user = await User.findById(userId);
  if (user && user.groups) {
    for (const groupId of user.groups) {
      const groupPerms = await Permission.find({
        subjectId: groupId,
        subjectType: 'group',
        resourcePath: { $regex: `^${escapedResourcePath}` },
        $or: [{ expiresAt: { $exists: false } }, { expiresAt: { $gt: new Date() } }]
      });
      groupPerms.forEach(perm => permissions.push(...perm.permissions));
    }
  }

  // Remove duplicates
  const uniquePermissions = [...new Set(permissions)];

  // Cache the result
  if (cacheService) {
    await cacheService.set(cacheKey, uniquePermissions, 300); // 5 minutes TTL for permissions
  }

  return uniquePermissions;
};

// Middleware to check permissions on a resource
export const requirePermission = (requiredPerm: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // For backward compatibility, allow admin users to access everything
    if (req.user.role === 'admin') {
      req.effectivePermissions = ['read', 'write', 'delete', 'manage_groups', 'manage_permissions'];
      return next();
    }

    // Construct resource path based on route
    let resourcePath = '';
    if (req.params.workspaceId) {
      resourcePath = req.params.workspaceId;
      if (req.params.id) {
        resourcePath += `/${req.params.id}`;
      }
    } else if (req.params.id) {
      resourcePath = req.params.id;
    } else if (req.body.workspaceId && req.path === '/') {
      // For POST /api/notes, workspaceId is in body
      resourcePath = req.body.workspaceId;
    } else {
      resourcePath = req.baseUrl + req.path;
    }

    const effectivePerms = await resolvePermissions(req.user._id.toString(), resourcePath);

    if (!effectivePerms.includes(requiredPerm)) {
      logger.warn(`Permission denied: user ${req.user._id} lacks ${requiredPerm} on ${resourcePath}`);
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    req.effectivePermissions = effectivePerms;
    next();
  };
};

// Middleware to validate access links
export const validateAccessLink = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.query.token as string;
  if (!token) return next();

  const link = await AccessLink.findOne({ token, used: false, expiresAt: { $gt: new Date() } });
  if (!link) {
    return res.status(403).json({ error: 'Invalid or expired access link' });
  }

  // Temporarily grant permissions via link
  req.effectivePermissions = link.permissions;
  next();
};
