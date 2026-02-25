import express, { Response } from 'express';
import Template, { ITemplate, TemplateCategory, TemplateVisibility } from '../models/Template';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import Workspace from '../models/Workspace';
import { BUILT_IN_TEMPLATES } from '../services/templateSeedData';

const router = express.Router();

/* ─────────────────────────────────────────────────────────────────
   Helper: verify that the requesting user is a member/owner of the
   workspace and return their role. Throws with HTTP status codes.
───────────────────────────────────────────────────────────────── */
async function resolveWorkspaceRole(
  workspaceId: string,
  userId: string
): Promise<'admin' | 'editor' | 'commenter' | 'viewer' | 'owner'> {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) throw { status: 404, message: 'Workspace not found' };

  if (workspace.owner === userId) return 'owner';

  const member = workspace.members.find((m: any) => m.userId === userId);
  if (!member) throw { status: 403, message: 'Not a member of this workspace' };

  return member.role as 'admin' | 'editor' | 'commenter' | 'viewer';
}

function canEdit(role: string) {
  return ['owner', 'admin', 'editor'].includes(role);
}
function canManage(role: string) {
  return ['owner', 'admin'].includes(role);
}

/* ─────────────────────────────────────────────────────────────────
   GET /api/templates/builtin
   Returns the built-in template library (no auth required).
───────────────────────────────────────────────────────────────── */
router.get('/builtin', (_req, res: Response) => {
  res.json({ templates: BUILT_IN_TEMPLATES });
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/templates/workspace/:workspaceId
   List templates visible to the requesting user in this workspace.
   Includes: workspace-scoped templates + user's private templates
   Query params: category, tags, search, visibility
───────────────────────────────────────────────────────────────── */
router.get('/workspace/:workspaceId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();
    const { category, tags, search, visibility } = req.query;

    await resolveWorkspaceRole(workspaceId, userId);

    const query: any = {
      $or: [
        { workspaceId, visibility: { $in: ['workspace', 'public'] } },
        { ownerId: userId, visibility: 'private' },
        { visibility: 'public' },
      ],
    };

    if (category) query.category = category;
    if (visibility) {
      // override the $or with precise visibility
      delete query.$or;
      query.workspaceId = workspaceId;
      query.visibility = visibility;
    }
    if (tags) {
      const tagList = (tags as string).split(',').map((t) => t.trim());
      query.tags = { $in: tagList };
    }
    if (search) {
      query.$text = { $search: search as string };
    }

    const templates = await Template.find(query)
      .sort({ isBuiltIn: -1, usageCount: -1, updatedAt: -1 })
      .select('-body -placeholders'); // lightweight list response

    res.json({ templates });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch templates' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   GET /api/templates/:id
   Full template detail including body & placeholders.
───────────────────────────────────────────────────────────────── */
router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Private templates only readable by their owner
    if (template.visibility === 'private' && template.ownerId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Workspace templates require membership
    if (template.workspaceId && template.visibility === 'workspace') {
      await resolveWorkspaceRole(template.workspaceId, userId);
    }

    res.json({ template });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to fetch template' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/templates/workspace/:workspaceId
   Create a new template (editor+ roles can create workspace templates,
   any member can create private templates).
───────────────────────────────────────────────────────────────── */
router.post('/workspace/:workspaceId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();

    const role = await resolveWorkspaceRole(workspaceId, userId);

    const { title, description, category, tags, body, placeholders, visibility } = req.body;

    // Only editors+ can create workspace-visible templates
    const requestedVisibility: TemplateVisibility = visibility || 'workspace';
    if (requestedVisibility !== 'private' && !canEdit(role)) {
      return res.status(403).json({ error: 'Only editors or admins can create shared templates' });
    }

    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }

    const previewContent = body.replace(/[#*`\[\]_>]/g, '').slice(0, 200).trim();

    const template = new Template({
      workspaceId,
      ownerId: userId,
      title: title.trim(),
      description: (description || '').trim(),
      category: category || 'general',
      tags: Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [],
      body,
      placeholders: Array.isArray(placeholders) ? placeholders : [],
      visibility: requestedVisibility,
      version: 1,
      usageCount: 0,
      previewContent,
      isBuiltIn: false,
    });

    await template.save();
    res.status(201).json({ template });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to create template' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   PUT /api/templates/:id
   Update a template. Owner or admin can edit; version bumps auto.
───────────────────────────────────────────────────────────────── */
router.put('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (template.isBuiltIn) return res.status(403).json({ error: 'Built-in templates cannot be modified' });

    // Must be owner, or workspace admin/owner
    const isOwner = template.ownerId === userId;
    let role = '';
    if (template.workspaceId) {
      try {
        role = await resolveWorkspaceRole(template.workspaceId, userId);
      } catch (_) {}
    }

    if (!isOwner && !canManage(role)) {
      return res.status(403).json({ error: 'Only the template owner or workspace admins can edit this template' });
    }

    const { title, description, category, tags, body, placeholders, visibility } = req.body;

    if (title !== undefined) template.title = title.trim();
    if (description !== undefined) template.description = description.trim();
    if (category !== undefined) template.category = category;
    if (tags !== undefined) template.tags = Array.isArray(tags) ? tags.map((t: string) => t.trim()) : [];
    if (body !== undefined) {
      template.body = body;
      template.previewContent = body.replace(/[#*`\[\]_>]/g, '').slice(0, 200).trim();
    }
    if (placeholders !== undefined) template.placeholders = placeholders;
    if (visibility !== undefined) template.visibility = visibility;

    template.version += 1;
    await template.save();

    res.json({ template });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to update template' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   DELETE /api/templates/:id
   Delete a template. Owner or workspace admin only.
───────────────────────────────────────────────────────────────── */
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ error: 'Template not found' });
    if (template.isBuiltIn) return res.status(403).json({ error: 'Built-in templates cannot be deleted' });

    const isOwner = template.ownerId === userId;
    let role = '';
    if (template.workspaceId) {
      try { role = await resolveWorkspaceRole(template.workspaceId, userId); } catch (_) {}
    }

    if (!isOwner && !canManage(role)) {
      return res.status(403).json({ error: 'Insufficient permissions to delete this template' });
    }

    await Template.findByIdAndDelete(id);
    res.json({ deleted: true, id });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to delete template' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/templates/:id/copy
   Copy (fork) a template into the user's workspace or as private.
───────────────────────────────────────────────────────────────── */
router.post('/:id/copy', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();
    const { targetWorkspaceId, visibility = 'workspace' } = req.body;

    const source = await Template.findById(id);
    if (!source) return res.status(404).json({ error: 'Template not found' });

    let workspaceId = targetWorkspaceId || source.workspaceId;
    if (workspaceId) {
      await resolveWorkspaceRole(workspaceId, userId);
    }

    const copied = new Template({
      workspaceId: workspaceId || null,
      ownerId: userId,
      title: `${source.title} (Copy)`,
      description: source.description,
      category: source.category,
      tags: [...source.tags],
      body: source.body,
      placeholders: source.placeholders.map((p) => ({ ...p })),
      visibility: visibility as TemplateVisibility,
      version: 1,
      usageCount: 0,
      previewContent: source.previewContent,
      isBuiltIn: false,
    });

    await copied.save();
    res.status(201).json({ template: copied });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to copy template' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/templates/:id/use
   Increment usageCount and return the rendered body with
   placeholders replaced by provided values.
───────────────────────────────────────────────────────────────── */
router.post('/:id/use', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { values = {} } = req.body; // { placeholderName: value }

    const template = await Template.findById(id);
    if (!template) return res.status(404).json({ error: 'Template not found' });

    // Replace placeholders
    let rendered = template.body;
    for (const [key, val] of Object.entries(values)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      rendered = rendered.replace(regex, String(val));
    }

    // Increment usage counter (fire-and-forget)
    Template.findByIdAndUpdate(id, { $inc: { usageCount: 1 } }).exec().catch(() => {});

    res.json({ title: template.title, body: rendered });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to apply template' });
  }
});

/* ─────────────────────────────────────────────────────────────────
   POST /api/templates/seed/:workspaceId
   Seed built-in templates for a workspace (admin only, idempotent).
───────────────────────────────────────────────────────────────── */
router.post('/seed/:workspaceId', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { workspaceId } = req.params;
    const userId = req.user._id.toString();

    const role = await resolveWorkspaceRole(workspaceId, userId);
    if (!canManage(role)) {
      return res.status(403).json({ error: 'Only workspace admins can seed templates' });
    }

    let seeded = 0;
    for (const tpl of BUILT_IN_TEMPLATES) {
      const exists = await Template.findOne({ workspaceId, title: tpl.title, isBuiltIn: true });
      if (!exists) {
        const previewContent = tpl.body.replace(/[#*`\[\]_>]/g, '').slice(0, 200).trim();
        await new Template({
          ...tpl,
          workspaceId,
          ownerId: userId,
          previewContent,
          version: 1,
          usageCount: 0,
        }).save();
        seeded++;
      }
    }

    res.json({ seeded, total: BUILT_IN_TEMPLATES.length });
  } catch (err: any) {
    res.status(err.status || 500).json({ error: err.message || 'Failed to seed templates' });
  }
});

export default router;
