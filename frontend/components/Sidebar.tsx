"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { useUserRole } from "@/contexts/UserRoleContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { type UserRole } from "@/lib/permissions";

export default function Sidebar() {
  const pathname = usePathname();
  const { canAccessManagement } = usePermissions();
  const { role, setRole } = useUserRole();
  const { activeWorkspace } = useWorkspace();
  const linkBase =
    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2";
  const linkActive = {
    background: "rgba(59, 130, 246, 0.1)",
    color: "var(--color-info)",
  };
 const linkInactive = {
  color: "var(--color-text-primary)",
  opacity: 0.85,
};



  return (
    <aside
      className="w-60 min-h-screen flex flex-col border-r shrink-0"
      style={{
        background: "var(--color-background)",
        borderColor: "var(--color-border-light)",
      }}
      aria-label="Main navigation"
    >
      <header className="p-5 border-b" style={{ borderColor: "var(--color-border-light)" }}>
        <Link
          href="/"
          className="font-bold text-xl tracking-tight hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md px-2 py-1"
          style={{ color: "var(--color-text-primary)" }}
          aria-label="NoteNest home page"
        >
          NoteNest
        </Link>
      </header>

      <nav className="flex-1 p-3 space-y-1" role="navigation" aria-label="Workspace navigation">
        <Link
          href={`/workspace/${activeWorkspace.id}`}
          className={`${linkBase} flex items-center gap-2`}
          style={pathname === `/workspace/${activeWorkspace.id}` ? linkActive : linkInactive}
          aria-current={pathname === `/workspace/${activeWorkspace.id}` ? "page" : undefined}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Home
        </Link>
        <Link
          href={`/workspace/${activeWorkspace.id}/dashboard`}
          className={linkBase}
          style={pathname === `/workspace/${activeWorkspace.id}/dashboard` ? linkActive : linkInactive}
          aria-current={pathname === `/workspace/${activeWorkspace.id}/dashboard` ? "page" : undefined}
        >
          Dashboard
        </Link>
        <Link
          href={`/workspace/${activeWorkspace.id}/notes`}
          className={linkBase}
          style={pathname === `/workspace/${activeWorkspace.id}/notes` ? linkActive : linkInactive}
          aria-current={pathname === `/workspace/${activeWorkspace.id}/notes` ? "page" : undefined}
        >
          Notes
        </Link>
        {canAccessManagement && (
          <Link
            href="/management"
            className={`${linkBase} flex items-center gap-2`}
            style={pathname === "/management" ? linkActive : linkInactive}
            aria-current={pathname === "/management" ? "page" : undefined}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Management
          </Link>
        )}
      </nav>

      <footer
        className="p-4 border-t flex flex-col items-center gap-3"
        style={{ borderColor: "var(--color-border-light)" }}
      >
        <div className="w-full">
          <label htmlFor="role-select" className="block text-sm font-medium text-gray-700 mb-1">
            Role (for testing)
          </label>
          <select
            id="role-select"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            style={{
              borderColor: "var(--color-border-light)",
              color: "var(--color-text-primary)",
              background: "var(--color-background)",
            }}
            aria-describedby="role-description"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <div id="role-description" className="sr-only">
            Switch user role for testing purposes. Changes are saved in localStorage.
          </div>
        </div>
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
          style={{
            background: "var(--color-info)",
            color: "white",
          }}
          aria-label="User avatar"
          role="img"
        >
          N
        </div>
      </footer>
    </aside>
  );
}
