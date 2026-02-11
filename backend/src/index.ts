import express, { Request, Response } from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import setupSocketHandlers from './socketHandlers';
import { YjsProvider } from './yjsProvider';
import workspaceRoutes from './routes/workspaces';
import noteRoutes from './routes/notes';
import userRoutes from './routes/users';
import groupRoutes from './routes/groups';
import permissionRoutes from './routes/permissions';
import { requestLoggingMiddleware } from './middleware/logging';
import { authenticateToken } from './middleware/auth';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example and set the required variables.');
  process.exit(1);
}

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:3001", // Frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use(requestLoggingMiddleware);

// Connect to MongoDB
const MONGO_URI = process.env.MONGO_URI!;
mongoose.connect(MONGO_URI)
  .then(() => console.log("📊 Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/workspaces', authenticateToken, workspaceRoutes);
app.use('/api/notes', authenticateToken, noteRoutes);
app.use('/api/groups', authenticateToken, groupRoutes);
app.use('/api/permissions', authenticateToken, permissionRoutes);

// Socket.IO setup
setupSocketHandlers(io);

// Initialize Y.js provider for CRDT collaboration
const yjsProvider = new YjsProvider(io);

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "NoteNest backend running",
  });
});

app.get("/notes", (_req: Request, res: Response) => {
  res.json([
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
  ]);
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`📘 NoteNest backend running on http://localhost:${PORT}`);
});
