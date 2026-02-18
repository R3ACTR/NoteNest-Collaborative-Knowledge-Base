import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";
import dotenv from "dotenv";
import setupSocketHandlers from './socketHandlers';
import { YjsProvider } from './yjsProvider';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'REDIS_URL', 'MAIN_API_URL'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example and set the required variables.');
  process.exit(1);
}

const app = createServer();
const io = new SocketIOServer(app, {
  cors: {
    origin: "http://localhost:3001", // Frontend URL
    methods: ["GET", "POST"]
  }
});

// Set up Redis adapter for scaling
const pubClient = createClient({ url: process.env.REDIS_URL });
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => console.error('Redis Pub Client Error', err));
subClient.on('error', (err) => console.error('Redis Sub Client Error', err));

io.adapter(createAdapter(pubClient, subClient));

// Initialize Y.js provider for CRDT collaboration
const yjsProvider = new YjsProvider(io);

// Socket.IO setup
setupSocketHandlers(io);

const PORT = process.env.SOCKET_PORT || 5002;

app.listen(PORT, () => {
  console.log(`🔌 Socket service running on http://localhost:${PORT}`);
});
