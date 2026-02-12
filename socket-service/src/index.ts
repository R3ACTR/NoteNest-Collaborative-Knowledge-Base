import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { createAdapter } from "@socket.io/redis-adapter";
import { Redis } from "ioredis";
import setupSocketHandlers from "./socketHandlers";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Environment variables
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/notenest";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

// Connect to MongoDB
mongoose.connect(MONGO_URI)
    .then(() => console.log("📊 [Socket Service] Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Setup Redis Adapter
const pubClient = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const subClient = pubClient.duplicate();

pubClient.on('error', (err) => {
    console.error('Redis Pub Client Error:', err);
});
subClient.on('error', (err) => {
    console.error('Redis Sub Client Error:', err);
});

// Retrieve allowed origins from env or default
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000", "http://localhost:3001"];

const io = new Server(httpServer, {
    cors: {
        origin: ALLOWED_ORIGINS,
        methods: ["GET", "POST"]
    },
    adapter: createAdapter(pubClient, subClient)
});

// Setup Socket Handlers
setupSocketHandlers(io);

// Health Check
app.get("/health", (req, res) => {
    res.json({ status: "ok", service: "socket-service" });
});

httpServer.listen(PORT, () => {
    console.log(`🚀 Socket Service running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    httpServer.close(() => {
        console.log('HTTP server closed');
        mongoose.disconnect();
        pubClient.quit();
        subClient.quit();
    });
});
