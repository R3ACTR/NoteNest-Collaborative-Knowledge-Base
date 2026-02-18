# Socket Service

Standalone WebSocket microservice for NoteNest real-time collaboration.

## Features

- Real-time note editing with Socket.IO
- Y.js CRDT for collaborative editing
- Redis adapter for horizontal scaling
- JWT-based authentication via main API
- User presence tracking
- Audit logging integration

## Environment Variables

Copy `.env.example` to `.env` and configure:

- `MAIN_API_URL`: URL of the main API service
- `JWT_SECRET`: JWT secret (same as main backend)
- `REDIS_URL`: Redis connection URL
- `SOCKET_PORT`: Port for socket service (default: 5002)
- `MONGO_URI`: MongoDB connection string

## Running

```bash
npm install
npm run dev
```

## API

### Authentication

Clients must provide a socket token obtained from the main API:

```javascript
const socket = io('http://localhost:5002', {
  auth: {
    token: socketToken // from /api/socket/token
  }
});
```

### Events

- `join-note`: Join a note room
- `leave-note`: Leave a note room
- `update-note`: Update note content
- `join-note-yjs`: Join Y.js collaboration
- `yjs-update`: Y.js document updates
- `awareness-update`: User awareness updates

## Scaling

The service uses Redis adapter for Pub/Sub, allowing multiple instances to share state and scale horizontally.
