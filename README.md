# NoteNest 📝

> **Collaborative Knowledge Base for Teams**

NoteNest is an open-source, team-based knowledge base that allows users to create, organize, and collaborate on notes and documentation in real time. It mirrors **industry-grade documentation and collaboration tools** used by modern teams.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)
[![Open Source Quest](https://img.shields.io/badge/OSQ-Participant-blue.svg)](OSQ.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📝 **Rich Note Editor** | Structured documentation with Markdown support |
| 👥 **Team Workspaces** | Collaborative spaces for your team |
| 🔐 **Role-Based Access** | Fine-grained permissions (Admin, Editor, Viewer) |
| 🔍 **Search & Indexing** | Find notes quickly with powerful search |
| 📁 **Organization** | Folders and tags to keep notes organized |
| 🚀 **Scalable Backend** | Built for performance and growth |

### Coming Soon
- 🔎 Full-text search
- 🤖 AI-assisted summaries

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│   Next.js  •  Tailwind CSS  •  Modern React Components  │
├─────────────────────────────────────────────────────────┤
│                      Backend                            │
│   Node.js  •  REST / GraphQL APIs  •  JWT Auth          │
├─────────────────────────────────────────────────────────┤
│                      Database                           │
│                      MongoDB                            │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **MongoDB** (local) or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base.git
   cd NoteNest-Collaborative-Knowledge-Base
   ```

2. **Install dependencies (root + backend + frontend)**

   ```bash
   npm run install:all
   ```

   Or install manually: `npm install` at the repo root, then `npm install` in both `backend/` and `frontend/`.

3. **Run backend and frontend with one command**

   From the **repository root**:

   ```bash
   npm run dev
   ```

   This starts both the backend and the frontend in parallel. Backend runs at `http://localhost:5000`, frontend at `http://localhost:3000`.

   To run them separately: `npm run dev:backend` or `npm run dev:frontend` from the root, or run `npm run dev` inside `backend/` or `frontend/`.

4. **Backend environment (optional)**  
   If the backend needs a `.env` file (e.g. MongoDB URI), create `backend/.env` from `backend/.env.example` and edit as needed.

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/notenest

# JWT Secret (use a strong random string)
JWT_SECRET=your-secret-key-here

# Server Port
PORT=5000
```

---

## 📁 Project Structure

```
notenest/
├── frontend/           # Next.js frontend application
│   ├── components/     # Reusable React components
│   ├── pages/          # Next.js pages
│   └── styles/         # Tailwind CSS styles
│
├── backend/            # Node.js backend APIs
│   ├── controllers/    # Request handlers
│   ├── models/         # MongoDB models
│   ├── routes/         # API routes
│   └── middleware/     # Auth & validation middleware
│
├── docs/               # Project documentation
├── .github/            # GitHub workflows & templates
├── CONTRIBUTING.md     # Contribution guidelines
├── ROADMAP.md          # Feature roadmap
└── README.md           # You are here!
```

---

## 🧩 How to Contribute

We welcome contributions of all sizes! Here's how to get started:

### 1. Find an Issue

Browse our [Issues](https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base/issues) and look for:

| Label | Description |
|-------|-------------|
| `good first issue` | Perfect for newcomers |
| `frontend` | UI/React work |
| `backend` | API/Node.js work |
| `documentation` | Docs and guides |
| `bug` | Something needs fixing |

### 2. Fork & Clone

```bash
# Fork via GitHub UI, then:
git clone https://github.com/YOUR-USERNAME/NoteNest-Collaborative-Knowledge-Base.git
cd NoteNest-Collaborative-Knowledge-Base
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes

- Write clean, readable code
- Add comments where helpful
- Follow existing code style
- Test your changes locally

### 4. Submit a Pull Request

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

Then open a PR on GitHub with a clear description of your changes.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Setup Guide](docs/setup.md) | Detailed local setup instructions |
| [Architecture](docs/architecture.md) | System architecture overview |
| [API Reference](docs/api.md) | API endpoints documentation |
| [Roles & Access](docs/roles-access.md) | RBAC documentation |

---

## 📝 What Makes a Good Note?

A well-written note is clear, structured, and useful to others. Follow these principles when contributing notes to NoteNest:

### 1. Clear Purpose

Every note should answer: **"Why does this exist?"**

- Start with a descriptive title that tells readers what the note is about
- Include a brief summary at the top explaining the note's purpose
- Focus on one topic per note instead of mixing multiple unrelated ideas

### 2. Structured Content

Organize information logically so readers can scan and find what they need:

- Use headings and subheadings to break down complex topics
- Group related information together
- Present steps or lists in a clear, numbered or bulleted format
- Keep paragraphs short (2-4 sentences max)

### 3. Actionable Information

Good notes help people **do something** or **understand something**:

- Provide specific examples instead of vague descriptions
- Include code snippets, commands, or screenshots when relevant
- Add links to related documentation or resources
- Specify prerequisites or requirements upfront

### 4. Consistent Formatting

Follow Markdown conventions to maintain readability:

- Use `code blocks` for commands, file names, and technical terms
- Apply **bold** for emphasis on key terms
- Use > blockquotes for important warnings or notes
- Format links meaningfully: `[Link Text](url)` instead of raw URLs

### 5. Good vs. Weak Examples

**❌ Weak Note:**

```
Setup stuff
Just install the things and run it. Ask someone if it doesn't work.
```

**✅ Good Note:**

```markdown
## Local Development Setup

This guide helps you set up NoteNest on your local machine.

### Prerequisites
- Node.js v18+
- MongoDB running locally

### Steps
1. Clone the repository
2. Run `npm install` in both `/frontend` and `/backend`
3. Configure `.env` file (see Environment Variables section)
4. Start backend: `npm run dev` from `/backend`
5. Start frontend: `npm run dev` from `/frontend`

### Troubleshooting
- If MongoDB connection fails, verify it's running: `mongod --version`
```

**The difference?** The good note is specific, structured, and actionable.

---

## 🔒 Security

Found a security vulnerability? Please read our [Security Policy](SECURITY.md) for responsible disclosure guidelines.

⚠️ **Do NOT report security issues via public GitHub issues.**

---

## 📍 Roadmap

See our [Roadmap](ROADMAP.md) for planned features:

- [x] Core note editor
- [x] Team workspaces
- [ ] Full-text search
- [ ] AI-assisted features
- [ ] Mobile app

---

## 📊 Evaluation (OSQ)

Contributions are evaluated based on:

- ✅ Code quality and clarity
- ✅ Documentation
- ✅ Consistency with project style
- ✅ Collaboration and communication

**Quality and learning matter more than quantity!**

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE.md) file for details.

---

## 🙏 Acknowledgements

- [Open Source Quest (OSQ)](https://github.com/R3ACTR) community
- All our amazing contributors ❤️

---

<div align="center">

**Happy contributing! 🚀**

[Report Bug](https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base/issues) · [Request Feature](https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base/issues) · [Join Discussion](https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base/discussions)

</div>
