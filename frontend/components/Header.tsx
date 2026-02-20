"use client";

import React from "react";
import WorkspaceSelector from "@/components/WorkspaceSelector";
import { useUserRole } from "@/contexts/UserRoleContext";
import Button from "@/components/Button";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header
        className="flex items-center gap-4 border-b px-6 py-4 bg-black border-gray-800 text-white"
        role="banner"
      >
        {/* Workspace Gradient Box */}
        <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
          <WorkspaceSelector />
        </div>

        {/* Title Gradient Box */}
        <div className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
          <h1
            className="text-lg font-semibold shrink-0 text-white"
            id="page-title"
          >
            {title}
          </h1>
        </div>

        {showSearch && (
          <div className="flex-1 max-w-md">
            <label htmlFor="search-input" className="sr-only">
              Search notes
            </label>

            {/* 🔥 Gradient Search Box with White Border */}
            <div className="rounded-xl bg-gradient-to-r from-blue-600/40 to-purple-600/40 border border-white px-4 py-2 focus-within:ring-2 focus-within:ring-white transition-all duration-200">
              <input
                id="search-input"
                type="search"
                data-shortcut="search"
                placeholder="Search notes..."
                aria-label="Search notes"
                className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white appearance-none"
                style={{ WebkitTextFillColor: "white" }}
              />
            </div>
          </div>
        )}

        <nav
          className="shrink-0 ml-auto flex items-center gap-3"
          aria-label="User actions"
        >
          {isAuthenticated && (
            <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 shadow-md">
              <Button
                onClick={logout}
                variant="secondary"
                size="sm"
                aria-label="Logout from your account"
                title="Sign out of your account"
              >
                Logout
              </Button>
            </div>
          )}
          {action}
        </nav>
      </header>
    </>
  );
}
