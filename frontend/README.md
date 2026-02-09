# NoteNest Frontend

This folder contains the **frontend (UI)** of NoteNest.
It is built using **Next.js** and focuses on everything the user sees and interacts with.

You do NOT need backend knowledge to contribute here.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or above)
- npm or yarn

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Run the Frontend Locally


You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## ⌨️ Keyboard Shortcuts & Command Palette

### Command palette (⌘K / Ctrl+K)

Press **Ctrl+K** (Windows/Linux) or **Cmd+K** (macOS) from anywhere in the app to open the **command palette**. It provides fast navigation and actions without using the mouse.

- **Search:** Type to filter commands by name or keywords.
- **Navigate:** Use **↑** and **↓** to move, **Enter** to run the selected command.
- **Close:** Press **Esc** or **Ctrl+K** / **Cmd+K** again.

**Default commands (MVP):**

| Command              | Action                          |
| -------------------- | ------------------------------- |
| Create New Note      | Go to Notes and open create modal |
| Go to Notes          | Navigate to Notes page          |
| Go to Folders        | Placeholder (navigates to Notes) |
| Focus Search         | Focus the main search input     |
| Help / Shortcuts     | Placeholder for shortcuts help   |

The palette is built to be **extensible**: you can pass a custom `commands` prop to `<CommandPalette />` or extend the default list so new features can plug in easily.

### Other shortcuts

- **/** – Focus search (when on a page that has search).
- **N** – Create note (when on Dashboard or Notes).
- **Esc** – Close overlays / clear focus.

---

## Role-based UI (testing)

The UI hides or disables Create / Edit / Delete and Management actions based on the current user role (**Viewer**, **Editor**, **Admin**). Role is stored in the browser for demo purposes (no backend).

- **Switch role:** Use the **Role** dropdown in the sidebar footer. Choices: Viewer, Editor, Admin. The value is saved in `localStorage` under `notenest-user-role`.
- **Viewer:** Cannot create, edit, or delete notes; cannot open Management. Create Note appears disabled with a tooltip; delete is replaced by a lock icon.
- **Editor:** Can create, edit, and delete notes; cannot see the Management link.
- **Admin:** Full access, including the Management page (workspace settings placeholder).

See `docs/roles-access.md` for the full permission matrix.

---

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!