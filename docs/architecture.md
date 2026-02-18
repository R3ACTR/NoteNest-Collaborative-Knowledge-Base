# NoteNest – System Architecture

This document explains the **high-level architecture** of NoteNest.
It is intended to help contributors understand how different parts of the system
work together without requiring deep technical knowledge.

---

## 🧠 Architecture Overview

NoteNest follows a **standard three-layer architecture** commonly used in
modern web applications.

User (Browser)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
Frontend (Next.js)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
Backend (REST, GraphQL APIs)\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↓\
Database (MongoDB)


Each layer has a **clear responsibility** and can be worked on independently.

---

## Frontend Layer (Client)

### Responsibilities
- Display the user interface
- Handle user interactions
- Send requests to backend APIs
- Render notes, dashboards, and editors

### Key Features
- Dashboard UI
- Notes list and editor
- Workspace navigation
- Role-based UI rendering (read-only vs editable)

### Important Notes
- The frontend **does NOT directly access the database**
- All data comes through backend APIs
- Dummy or mocked data may be used during development

---

## Backend Layer (Server)

### Responsibilities
- Handle authentication and authorization
- Process API requests
- Apply business logic
- Enforce role-based access control (RBAC)
- Communicate with the database

### Typical Backend Flow
1. Receive request from frontend
2. Authenticate user
3. Check user permissions
4. Perform requested operation
5. Return response

### Example
> “Can this user edit this note?”

This decision is made **only in the backend**.

---

## Database Layer

### Responsibilities
- Store persistent data
- Maintain relationships between users, notes, and workspaces

### Typical Collections
- Users
- Notes
- Workspaces
- Roles / Permissions

### Notes
- Database design is abstracted behind backend logic
- Contributors usually do not interact with the database directly

---

## 👥 Workspaces (Core Concept)

A **workspace** represents a team or group.

Each workspace contains:
- Multiple users
- Multiple notes
- Assigned roles per user

Example:
Workspace: "OSQ Core Team"

- Admin: Organizer

- Editor: Contributor

- Viewer: Observer


Workspaces allow NoteNest to support **real-world collaboration**.

---

## Optimistic Concurrency Control (OCC)

NoteNest implements **Optimistic Concurrency Control** to prevent lost updates and ensure data integrity in collaborative editing scenarios.

### How OCC Works
- Each note has a `version` field that increments on every successful update
- Clients must submit their expected version when updating a note
- If the expected version doesn't match the current server version, a conflict is detected
- Conflicts return HTTP 409 with detailed resolution guidance

### Conflict Detection
When updating a note:
1. Client sends `expectedVersion` in request body
2. Server compares `expectedVersion` with current `note.version`
3. If versions match: increment version and apply update
4. If versions don't match: return 409 Conflict with merge guidance

### Conflict Response Structure
```json
{
  "error": "Conflict",
  "message": "Note has been updated by another user. Please refresh and try again.",
  "currentVersion": 5,
  "expectedVersion": 3,
  "clientChanges": { "title": "New Title", "content": "New content" },
  "serverData": {
    "title": "Server Title",
    "content": "Server content",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "guidance": "Fetch the latest version, merge your changes manually, and retry the update."
}
```

### Integration Points
OCC is integrated across all update mechanisms:
- **REST API**: PUT `/api/notes/:id` with `expectedVersion` in body
- **Socket Updates**: `update-note` event includes `expectedVersion`
- **Version History**: Each update creates a version snapshot
- **Cache Invalidation**: Occurs only after successful updates
- **Event Emission**: Domain events fired post-successful update

### Benefits
- Prevents silent data corruption
- Protects collaborative editing integrity
- Strengthens offline-first reliability
- Aligns with production-grade SaaS standards

## Event-Driven Architecture

NoteNest uses an **internal event bus** and **domain events** to decouple core business logic from side-effects, improving maintainability and scalability.

### Event Bus
- Lightweight internal event emitter
- Supports synchronous and asynchronous event handlers
- Centralized event registration and emission
- Error handling ensures event failures don't crash core requests

### Domain Events
Core actions emit structured domain events that other modules can subscribe to:

- `note.created` - Emitted when a new note is created
- `note.updated` - Emitted when a note is modified
- `note.deleted` - Emitted when a note is deleted
- `workspace.created` - Emitted when a new workspace is created
- `member.added_to_workspace` - Emitted when a user joins a workspace
- `member.removed_from_workspace` - Emitted when a user leaves a workspace
- `member.role_updated` - Emitted when a member's role changes

### Event Listeners
Dedicated listeners handle side-effects independently:

- **Audit Logging**: Records all user actions for compliance and debugging
- **Cache Invalidation**: Clears cached data when underlying data changes
- **Activity Feed**: Updates real-time activity streams (placeholder for future implementation)

### Benefits
- Reduces tight coupling between services
- Improves long-term scalability
- Enables future microservice extraction
- Aligns with modern backend patterns

## Authentication vs Authorization

### Authentication
- Verifies *who* the user is
- Example: login using email and password

### Authorization
- Verifies *what* the user can do
- Example: can edit or only view notes

Both are handled in the backend.

---

## Search & Indexing (Planned)

Search allows users to:
- Find notes by keyword
- Quickly access information

Basic search:
- Simple text matching

Advanced search (optional):
- Indexed search
- Full-text search

---

## Separation of Concerns

Each layer is independent:

| Layer       | Can be worked on independently |
|-------------|--------------------------------|
Frontend      |              Yes               |
Backend       |              Yes               |
Documentation |              Yes               |
UI/UX         |              Yes               |

This allows contributors with different skill levels to collaborate efficiently.

---

##  Why This Architecture?

This architecture:
- Is easy to understand
- Mirrors real-world industry systems
- Scales well with contributors
- Encourages clean code and collaboration

---

## Final Note

You do NOT need to understand the entire architecture to contribute.
Pick one layer, focus on it, and collaborate with others.

That is how real software teams work 🚀
