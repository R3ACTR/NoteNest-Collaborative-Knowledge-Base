"use client";

import React from "react";
import WorkspaceSelector from "@/components/WorkspaceSelector";
import { useUserRole } from "@/contexts/UserRoleContext";
import Button from "@/components/Button";

interface HeaderProps {
  title?: string;
  /** When true, shows a search input that can be focused with / shortcut */
  showSearch?: boolean;
  /** Optional node rendered on the right (e.g. Create Note button) */
  action?: React.ReactNode;
}

export default function Header({
  title = "Dashboard",
  showSearch = false,
  action,
}: HeaderProps) {
  const { isAuthenticated, logout } = useUserRole();

  return (
    <>
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header
        className="flex items-center gap-4 border-b px-6 py-4"
        style={{
          background: "var(--color-background)",
          borderColor: "var(--color-border-light)",
        }}
        role="banner"
      >
        <WorkspaceSelector />
        <h1
          className="text-xl font-semibold shrink-0"
          style={{ color: "var(--color-text-primary)" }}
          id="page-title"
        >
          {title}
        </h1>
        {showSearch && (
          <div className="flex-1 max-w-md">
            <label htmlFor="search-input" className="sr-only">
              Search notes
            </label>
            <input
              id="search-input"
              type="search"
              data-shortcut="search"
              placeholder="Search notes…"
              aria-label="Search notes"
className="w-full rounded-lg border px-3 py-2 text-sm transition-colors placeholder:text-[var(--color-text-secondary)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"

              style={{
                borderColor: "var(--color-border-light)",
                color: "var(--color-text-primary)",
                background: "var(--color-background)",
                fontSize: "var(--font-size-sm)",
              }}
            />
          </div>
        )}
        <nav className="shrink-0 ml-auto flex items-center gap-3" aria-label="User actions">
          {isAuthenticated && (
          <Button
  onClick={logout}
  variant="secondary"
  size="sm"
  aria-label="Logout from your account"
  title="Sign out of your account"
>
  Logout
</Button>

          )}
          {action}
        </nav>
      </header>
    </>
  );
}
