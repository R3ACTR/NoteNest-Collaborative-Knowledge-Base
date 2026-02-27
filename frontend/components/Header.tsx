"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import WorkspaceSelector from "@/components/WorkspaceSelector";
import { useUserRole } from "@/contexts/UserRoleContext";
import Button from "@/components/Button";
import NotificationCenter from "@/components/NotificationCenter";

interface HeaderProps {
  title?: string;
  showSearch?: boolean;
  action?: React.ReactNode;
}

function HeaderInner({
  title = "Dashboard",
  showSearch = false,
  action,
}: HeaderProps) {
  const { isAuthenticated, logout } = useUserRole();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [workspaceId, setWorkspaceId] = useState<string>("");

  // 🔐 Logout confirmation
  const handleLogoutClick = () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    logout();
  };

  // Load workspace ID for notifications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("currentWorkspaceId");
      if (stored) setWorkspaceId(stored);
    }
  }, []);

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    router.replace(`?${params.toString()}`);
  };

  return (
    <>
      {/* Skip to main content (accessibility) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header
        className="sticky top-0 z-40 flex items-center gap-4 border-b px-6 py-4 bg-[#F3F0E6]/90 backdrop-blur-sm border-stone-200/50"
        role="banner"
      >
        <WorkspaceSelector />

        <h1
          id="page-title"
          className="font-display text-3xl font-bold shrink-0 text-stone-900"
        >
          {title}
        </h1>

        {showSearch && (
          <div className="flex-1 max-w-md relative">
            <label htmlFor="search-input" className="sr-only">
              Search notes
            </label>
            <input
              id="search-input"
              type="search"
              placeholder="Search notes…"
              aria-label="Search notes"
              value={search}
              onChange={(e) => {
                const value = e.target.value;
                const params = new URLSearchParams(searchParams.toString());

                if (value) {
                  params.set("search", value);
                } else {
                  params.delete("search");
                }

                router.replace(`?${params.toString()}`);
              }}
              className="w-full rounded-full border border-stone-200 bg-white pl-4 pr-10 py-2 text-sm placeholder:text-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none focus:text-stone-600 p-1"
                aria-label="Clear search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        )}

        <nav
          className="shrink-0 ml-auto flex items-center gap-3"
          aria-label="User actions"
        >
          {isAuthenticated && (
            <>
              <NotificationCenter workspaceId={workspaceId} />
              <Button
                onClick={handleLogoutClick}
                variant="secondary"
                size="sm"
                aria-label="Logout from your account"
                title="Sign out of your account"
              >
                Logout
              </Button>
            </>
          )}
          {action}
        </nav>
      </header>
    </>
  );
}

export default function Header(props: HeaderProps) {
  return (
    <Suspense
      fallback={
        <header
          className="sticky top-0 z-40 flex items-center gap-4 border-b px-6 py-4 bg-[#F3F0E6]/90 backdrop-blur-sm border-stone-200/50"
          role="banner"
        />
      }
    >
      <HeaderInner {...props} />
    </Suspense>
  );
}