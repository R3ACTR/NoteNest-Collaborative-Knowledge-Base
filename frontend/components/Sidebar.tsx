"use client";

import { useState } from "react";
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

  // ✅ NEW STATE (for collapse)
  const [collapsed, setCollapsed] = useState(false);

  const linkBase =
    "block rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 text-stone-600 hover:bg-stone-200 hover:text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400";

  const activeClass =
    "bg-stone-200 text-stone-900 font-semibold border-r-2 border-black";

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-60"} min-h-screen flex flex-col shrink-0 bg-[#F3F0E6] border-r border-stone-200 text-stone-900 transition-all duration-300`}
      aria-label="Main navigation"
    >
      {/* HEADER */}
      <header className="flex items-center justify-between p-5 border-b border-stone-200/50">
        {!collapsed && (
          <Link
            href="/"
            className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-stone-900 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 rounded-md px-2 py-1"
          >
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-display text-xl pt-1">N</div>
            NoteNest
          </Link>
        )}

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-stone-200 transition-colors"
        >
          {collapsed ? "▶" : "◀"}
        </button>
      </header>

      {/* NAV */}
      <nav
        className="flex-1 p-3 space-y-1"
        role="navigation"
        aria-label="Workspace navigation"
      >
        <Link
          href={`/workspace/${activeWorkspace.id}`}
          className={`${linkBase} flex items-center ${
            collapsed ? "justify-center" : "gap-2"
          } ${
            pathname === `/workspace/${activeWorkspace.id}`
              ? activeClass
              : ""
          }`}
        >
          <svg
            className="w-4 h-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          {!collapsed && "Home"}
        </Link>

        <Link
          href={`/workspace/${activeWorkspace.id}/dashboard`}
          className={`${linkBase} ${
            collapsed ? "text-center" : ""
          } ${
            pathname === `/workspace/${activeWorkspace.id}/dashboard`
              ? activeClass
              : ""
          }`}
        >
          {!collapsed && "Dashboard"}
          {collapsed && <span className="text-sm">D</span>}
        </Link>

        <Link
          href={`/workspace/${activeWorkspace.id}/notes`}
          className={`${linkBase} ${
            collapsed ? "text-center" : ""
          } ${
            pathname === `/workspace/${activeWorkspace.id}/notes`
              ? activeClass
              : ""
          }`}
        >
          {!collapsed && "Notes"}
          {collapsed && <span className="text-sm">N</span>}
        </Link>

        {canAccessManagement && (
          <Link
            href="/management"
            className={`${linkBase} flex items-center ${
              collapsed ? "justify-center" : "gap-2"
            } ${pathname === "/management" ? activeClass : ""}`}
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0..."
              />
            </svg>
            {!collapsed && "Management"}
          </Link>
        )}
      </nav>

      {/* FOOTER */}
      {!collapsed && (
        <footer className="p-4 border-t border-stone-200/50 flex flex-col items-center gap-3">
          <div className="w-full">
            <label
              htmlFor="role-select"
              className="block text-sm mb-1 text-stone-500"
            >
              Role (for testing)
            </label>

            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-stone-200 bg-white text-stone-900 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-400"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-display shrink-0 bg-black text-white pt-1">
            N
          </div>
        </footer>
      )}
    </aside>
  );
}
