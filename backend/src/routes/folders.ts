import express, { Response } from 'express';
import Folder from '../models/Folder';
import { authenticateToken, requirePermission, AuthRequest } from '../middleware/auth';
import { getCacheService, CacheKeys } from '../services/cacheService';

const router = express.Router();

// Get all folders for a workspace
router.get('/workspace/:workspaceId', authenticateToken, requirePermission('read'), async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    
    const folders = await Folder.find({ workspaceId }).sort({ path: 1 });
    
    res.json(folders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch folders' });
  }
});

// Create a new folder
router.post('/', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, workspaceId, parentId, createdBy } = req.body;
    
    // Build path based on parent
    let path = workspaceId;
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (parentFolder) {
        path = `${parentFolder.path}${parentId}/`;
      }
    }
    path = `${path}/`;
    
    const folder = new Folder({
      name,
      workspaceId,
      parentId: parentId || null,
      path,
      createdBy,
    });
    
    await folder.save();
    
    // Update path with own ID after save
    folder.path = `${path}${folder._id}/`;
    await folder.save();
    
    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// Update a folder
router.put('/:id', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, parentId } = req.body;
    
    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    if (name) folder.name = name;
    
    // Handle parent change
    if (parentId !== undefined) {
      if (parentId === null) {
        // Moving to root
        folder.parentId = null;
        folder.path = `${folder.workspaceId}/${folder._id}/`;
      } else {
        const parentFolder = await Folder.findById(parentId);
        if (parentFolder) {
          folder.parentId = parentId;
          folder.path = `${parentFolder.path}${folder._id}/`;
        }
      }
    }
    
    await folder.save();
    
    res.json(folder);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update folder' });
  }
});

// Delete a folder
router.delete('/:id', authenticateToken, requirePermission('write'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const folder = await Folder.findById(id);
    if (!folder) {
      return res.status(404).json({ error: 'Folder not found' });
    }
    
    // Check if folder has children
    const childCount = await Folder.countDocuments({ parentId: id });
    if (childCount > 0) {
      return res.status(400).json({ error: 'Cannot delete folder with subfolders' });
    }
    
    await Folder.findByIdAndDelete(id);
    
    res.json({ message: 'Folder deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

export default router;
