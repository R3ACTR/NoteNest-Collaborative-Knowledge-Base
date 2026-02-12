# Note Organization in NoteNest

This document outlines the recommended approach for organizing notes in NoteNest using a **hybrid folder + tag model**. This proposal balances structure with flexibility to support diverse team workflows.

---

## 📋 Overview

NoteNest uses a **hybrid organization model** that combines:

1. **Hierarchical Folders** – Primary structure for browsing and navigation
2. **Tags** – Cross-referencing and discovery across folder boundaries
3. **Pinned/Favorite Notes** – Quick access to high-priority content

This approach provides the **familiarity of folders** with the **flexibility of tags**, enabling teams to organize knowledge in a way that scales from small projects to large organizations.

---

## 🗂️ Organization Model

### 1. Hierarchical Folders (Primary Structure)

Folders provide a **visual hierarchy** for organizing notes, similar to file systems and tools like Google Drive or Notion.

#### How It Works

```
Workspace: "Engineering Team"
├── 📁 Backend
│   ├── 📁 API Design
│   │   └── 📝 REST API Guidelines
│   └── 📁 Database
│       └── 📝 Schema Design
├── 📁 Frontend
│   └── 📝 Component Library
└── 📁 DevOps
    └── 📝 CI/CD Pipeline
```

#### Key Features

- **Nested structure**: Folders can contain subfolders and notes
- **Materialized paths**: Backend uses path indexing for efficient queries
- **No strict depth limit**: Teams can nest as deep as needed (though 3-5 levels is recommended for UX)
- **Workspace-scoped**: All folders belong to a workspace

#### When to Use Folders

✅ **Use folders when:**

- Content clearly belongs to one category (e.g., "Backend Documentation")
- You want to apply permissions at a structural level
- Team members need to browse by department or project

❌ **Avoid over-nesting:**

- Too many levels (>5) can make navigation cumbersome
- Deeply nested folders reduce discoverability

---

### 2. Tags (Cross-Referencing)

Tags enable **cross-referencing** notes that span multiple categories or contexts.

#### How It Works

Notes can have multiple tags:

```
📝 "API Design Guidelines"
   Tags: #best-practices, #onboarding, #backend
```

Users can:

- Filter notes by tag across all folders
- Discover related content from different areas
- Search using tag combinations

#### Key Features

- **Workspace-wide**: Tags are centralized per workspace to maintain consistency
- **Multi-tagging**: Notes can belong to multiple categories simultaneously
- **Autocomplete**: Tag suggestions prevent duplication and sprawl

#### When to Use Tags

✅ **Use tags for:**

- Cross-functional topics (e.g., `#onboarding` spans multiple departments)
- Temporal references (e.g., `#q1-2026`, `#urgent`)
- Content types (e.g., `#reference`, `#tutorial`, `#meeting-notes`)

❌ **Avoid:**

- Using tags as a replacement for folders (reduces browsing UX)
- Creating too many similar tags (e.g., `#backend`, `#backend-dev`, `#backend-team`)

---

### 3. Pinned / Favorite Notes

Quick access mechanisms for high-priority content.

#### Pinned Notes (Workspace-Level)

- **Controlled by**: Admins and Editors
- **Visibility**: All workspace members
- **Use case**: Critical docs, team onboarding, shared resources

#### Favorite Notes (User-Level)

- **Controlled by**: Individual users
- **Visibility**: Personal to each user
- **Use case**: Frequently accessed notes, personal bookmarks

---

## ⚖️ Pros and Cons

### Folder-Based Organization

| ✅ **Pros** | ❌ **Cons** |
|------------|------------|
| Familiar to most users | Rigid – notes can only live in one place |
| Visual hierarchy for browsing | Hard to represent multi-category content |
| Easy folder-level permissions | Deep nesting reduces discoverability |

---

### Tag-Based Organization

| ✅ **Pros** | ❌ **Cons** |
|------------|------------|
| Flexible – notes belong to multiple categories | Less visual structure for browsing |
| Great for cross-functional teams | Requires discipline to avoid tag sprawl |
| Scales well with search | Can feel overwhelming for new users |

---

### Hybrid Model (Recommended)

| ✅ **Pros** | ⚠️ **Considerations** |
|------------|----------------------|
| Combines structure and flexibility | Requires clear guidelines on when to use folders vs tags |
| Friendly for new users, powerful for advanced users | Slightly more complex UI/UX |
| Supports multiple workflows naturally | Teams need onboarding on best practices |
| Aligns with tools like Notion, Confluence, Obsidian | — |

---

## 🎯 Example Use Cases

### **Use Case 1: Engineering Team**

**Folder Structure:**

```
📁 Engineering
├── 📁 Backend
│   ├── 📝 API Design Guidelines   (#best-practices, #onboarding)
│   └── 📝 Database Schema         (#backend, #reference)
├── 📁 Frontend
│   └── 📝 Component Library       (#ui, #reference)
└── 📁 DevOps
    └── 📝 Deployment Checklist    (#ops, #critical)
```

**Tag Usage:**

- Search `#onboarding` → Shows API guidelines + other onboarding docs across folders
- Search `#reference` → Surfaces all reference materials regardless of location

---

### **Use Case 2: Product Team**

**Folder Structure:**

```
📁 Product
├── 📁 Roadmap
│   └── 📝 Q1 2026 Goals           (#planning, #all-hands)
├── 📁 Research
│   └── 📝 User Feedback Analysis  (#ux, #data)
└── 📁 Launches
    └── 📝 Feature X Launch Plan   (#launch, #urgent)
```

**Tag Usage:**

- `#all-hands` → Company-wide important docs
- `#urgent` → Time-sensitive items across all categories

---

### **Use Case 3: Mixed Team (Cross-Functional)**

**Folder Structure:**

```
📁 Projects
└── 📁 Feature X
    ├── 📝 Technical Spec          (#backend, #frontend)
    ├── 📝 Design Mockups          (#ui, #design)
    └── 📝 Launch Checklist        (#ops, #launch)
```

**Tag Usage:**

- Project-based folders, but tags allow filtering by discipline (`#backend`, `#design`)
- Team members can filter by their area of expertise across all projects

---

## 💡 Recommendations

### **For Teams Starting Fresh**

1. **Start with broad folders** (e.g., by department or project)
2. **Add tags as needed** for cross-cutting concerns
3. **Pin critical docs** (onboarding, processes, guidelines)
4. **Review organization quarterly** to prevent sprawl

### **For Migrating from Other Tools**

1. **Map existing structure** to folders first
2. **Add tags retroactively** for improved discoverability
3. **Avoid over-complicating** – simplicity beats perfection

### **Best Practices**

- ✅ **Keep folder depth ≤ 5 levels** for better UX
- ✅ **Use consistent tag naming** (lowercase, hyphens)
- ✅ **Pin no more than 5-7 notes** per workspace (reduces clutter)
- ✅ **Establish workspace-wide tagging conventions** early

---

## 🔧 Technical Alignment

### **Backend Support**

NoteNest's backend **already supports** this hybrid model:

| Feature | Backend Model | Field |
|---------|--------------|-------|
| Folders | `Folder` | `parentId`, `path` (materialized paths) |
| Tags | `Note` | `tags[]` (array of strings) |
| Workspace Scoping | `Workspace`, `Folder`, `Note` | `workspaceId` |

**What's Next (Implementation):**

- Link Notes to Folders (add `folderId` field to `Note` model)
- Build UI for folder navigation
- Implement tag filtering and autocomplete
- Add pinned/favorite notes feature

---

## 🚀 Next Steps

This document provides the **design rationale** for note organization. Future work includes:

1. **Database schema update** – Link notes to folders
2. **Frontend UI** – Folder tree navigation + tag filters
3. **API endpoints** – CRUD operations for folders and tags
4. **User documentation** – How-to guides for end users

---

## 📚 References

- [NoteNest Architecture](architecture.md)
- [Backend Folder Model](../backend/src/models/Folder.ts)
- [Backend Note Model](../backend/src/models/Note.ts)
- [Issue #7: Propose Note Organization Structure](https://github.com/R3ACTR/NoteNest-Collaborative-Knowledge-Base/issues/7)
