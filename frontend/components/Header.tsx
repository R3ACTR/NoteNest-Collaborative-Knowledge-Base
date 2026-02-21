"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function HeaderInner({
  title = "Dashboard",
  showSearch = false,
  action,
}: HeaderProps) {
  const { isAuthenticated, logout } = useUserRole();

  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

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
              className="w-full rounded-full border border-stone-200 bg-white px-4 py-2 text-sm transition-colors placeholder:text-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-stone-400 shadow-sm"
            />
          </div>
        )}

        <nav
          className="shrink-0 ml-auto flex items-center gap-3"
          aria-label="User actions"
        >
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