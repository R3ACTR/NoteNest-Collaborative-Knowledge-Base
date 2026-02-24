import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import workspaceRoutes from './routes/workspaces';
import noteRoutes from './routes/notes';
import folderRoutes from './routes/folders';
import userRoutes from './routes/users';
import groupRoutes from './routes/groups';
import permissionRoutes from './routes/permissions';
import notificationRoutes from './routes/notifications';
import activityRoutes from './routes/activity';
import templateRoutes from './routes/templates';
import { requestLoggingMiddleware } from './middleware/logging';
import { authenticateToken } from './middleware/auth';
import { initializeCache, getCacheService, CacheKeys } from './services/cacheService';
import { registerEventListeners } from './services/eventListeners';
import { metrics } from './utils/metrics';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example and set the required variables.');
  process.exit(1);
}

export const app = express(); // Initialize express

app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use(requestLoggingMiddleware);

// Initializations (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    // Determine Mongo URI: prefer provided, otherwise start an in-memory mongo for local dev
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      console.warn('MONGO_URI not set — starting mongodb-memory-server for development');
      try {
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        // persist the uri for other modules
        process.env.MONGO_URI = mongoUri;
        console.log(`🧪 mongodb-memory-server running at ${mongoUri}`);
      } catch (err) {
        console.error('Failed to start mongodb-memory-server:', err);
      }
    }

    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri);
        console.log('📊 Connected to MongoDB');
      } catch (err) {
        console.error('MongoDB connection error:', err);
        console.warn('Attempting to start mongodb-memory-server as a fallback');
        try {
          const mongod = await MongoMemoryServer.create();
          const fallbackUri = mongod.getUri();
          process.env.MONGO_URI = fallbackUri;
          await mongoose.connect(fallbackUri);
          console.log('📊 Connected to fallback in-memory MongoDB');
        } catch (err2) {
          console.error('Fallback in-memory MongoDB failed:', err2);
        }
      }
    }

    // Initialize Redis cache
    initializeCache().then(() => {
      console.log('🔄 Redis cache initialized');
    }).catch((err: unknown) => {
      console.warn('⚠️  Redis cache initialization failed, continuing without cache:', err instanceof Error ? err.message : String(err));
    });

    // Register event listeners
    registerEventListeners();
  })();
}

// Routes
app.use('/api/users', userRoutes);
app.use('/api/workspaces', authenticateToken, workspaceRoutes);
app.use('/api/notes', authenticateToken, noteRoutes);
app.use('/api/folders', authenticateToken, folderRoutes);
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/permissions', authenticateToken, permissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/templates', templateRoutes);

// Endpoint to issue socket tokens
app.post('/api/socket/token', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const socketToken = jwt.sign({ userId, type: 'socket' }, process.env.JWT_SECRET!, { expiresIn: '1h' });
  res.json({ token: socketToken });
});

// Validation endpoints for socket service
app.post('/api/workspaces/:workspaceId/validate-access', authenticateToken, async (req: Request, res: Response) => {
  const { workspaceId } = req.params;
  const userId = (req as any).user._id.toString();

  try {
    const workspace = await require('./models/Workspace').default.findById(workspaceId);
    if (!workspace || (workspace.owner !== userId && !workspace.members.some((m: any) => m.userId === userId))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    res.json({ valid: true });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

app.post('/api/notes/:noteId/validate-update', authenticateToken, async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const { expectedVersion } = req.body;
  const userId = (req as any).user._id.toString();

  try {
    const note = await require('./models/Note').default.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const workspace = await require('./models/Workspace').default.findById(note.workspaceId);
    const member = workspace?.members.find((m: any) => m.userId === userId);
    const isOwner = workspace?.owner === userId;
    const userRole = isOwner ? 'admin' : member?.role;

    if (!isOwner && !member) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (userRole === "viewer") {
      return res.status(403).json({ error: 'Permission denied' });
    }

    // Check version for OCC
    if (expectedVersion !== undefined && note.version !== expectedVersion) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Note has been updated by another user. Please refresh and try again.',
        currentVersion: note.version,
        expectedVersion,
        serverData: {
          title: note.title,
          content: note.content,
          updatedAt: note.updatedAt
        },
        guidance: 'Fetch the latest version, merge your changes manually, and retry the update.'
      });
    }

    res.json({ valid: true, currentVersion: note.version });
  } catch (error) {
    res.status(500).json({ error: 'Validation failed' });
  }
});

app.post('/api/notes/:noteId/create-version', authenticateToken, async (req: Request, res: Response) => {
  const { noteId } = req.params;
  const { reason } = req.body;
  const authorId = (req as any).user._id.toString();

  try {
    const note = await require('./models/Note').default.findById(noteId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const persistence = require('./persistence').PersistenceManager.getInstance();
    await persistence.createVersion(noteId, authorId, note.workspaceId.toString(), reason);

    res.json({ versionCreated: true });
  } catch (error) {
    res.status(500).json({ error: 'Version creation failed' });
  }
});

app.post('/api/audit/log', authenticateToken, async (req: Request, res: Response) => {
  const auditData = req.body;
  try {
    const userId = (req as any).user._id.toString();
    const AuditService = require('./services/auditService').AuditService;
    await AuditService.logEvent(
      auditData.action,
      userId,
      auditData.workspaceId,
      auditData.resourceId,
      auditData.resourceType,
      auditData.details
    );
    res.json({ logged: true });
  } catch (error) {
    res.status(500).json({ error: 'Logging failed' });
  }
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "NoteNest backend running",
  });
});

app.get("/metrics", (_req: Request, res: Response) => {
  const circuitBreaker = getCacheService()?.['circuitBreaker']; // Access private property for demo
  const metricsData = metrics.getMetrics();
  res.json({
    ...metricsData,
    circuitBreakerState: circuitBreaker?.getState() || 'N/A',
    circuitBreakerFailureCount: circuitBreaker?.getFailureCount() || 0,
  });
});

app.get("/notes", async (_req: Request, res: Response) => {
  const cacheService = getCacheService();
  const cacheKey = 'sample_notes';

  // Try to get from cache first
  if (cacheService) {
    const cachedNotes = await cacheService.get(cacheKey);
    if (cachedNotes) {
      return res.json(cachedNotes);
    }
  }

  const notes = [
    {
      id: "1",
      title: "Getting Started with NoteNest",
      content: "Welcome to NoteNest! This is a sample note to demonstrate the notes API.",
      createdAt: "2026-01-15T10:30:00.000Z",
    },
    {
      id: "2",
      title: "Team Collaboration Tips",
      content: "Use tags and folders to organize your team's knowledge base effectively.",
      createdAt: "2026-01-20T14:45:00.000Z",
    },
    {
      id: "3",
      title: "Markdown Support",
      content: "NoteNest supports Markdown formatting for rich text documentation.",
      createdAt: "2026-01-25T09:15:00.000Z",
    },
  ];

  // Cache the result
  if (cacheService) {
    await cacheService.set(cacheKey, notes);
  }

  res.json(notes);
});

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`📘 NoteNest backend running on http://localhost:${PORT}`);
  });
}
