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
    "block rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 text-white hover:bg-gray-700 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500";

  const activeClass =
    "bg-blue-600 text-white border-r-2 border-white";

  return (
    <aside
      className={`${collapsed ? "w-20" : "w-60"} min-h-screen flex flex-col shrink-0 bg-gray-900 border-r border-gray-800 text-white transition-all duration-300`}
      aria-label="Main navigation"
    >
      {/* HEADER */}
      <header className="flex items-center justify-between p-5 border-b border-gray-800">
        {!collapsed && (
          <Link
            href="/"
            className="font-bold text-xl tracking-tight text-white hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md px-2 py-1"
          >
            NoteNest
          </Link>
        )}

        {/* TOGGLE BUTTON */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-gray-700 transition-colors"
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
        <footer className="p-4 border-t border-gray-800 flex flex-col items-center gap-3">
          <div className="w-full">
            <label
              htmlFor="role-select"
              className="block text-sm mb-1 text-gray-300"
            >
              Role (for testing)
            </label>

            <select
              id="role-select"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 text-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 bg-blue-600 text-white">
            N
          </div>
        </footer>
      )}
    </aside>
  );
}
