"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { SkeletonList } from "@/components/Skeleton";
import { usePermissions } from "@/hooks/usePermissions";

const CREATE_RESTRICTED_TITLE = "You need Editor or Admin role to create notes.";

export default function DashboardPage() {
  const { canCreateNote } = usePermissions();
  const [recentActivity, setRecentActivity] = useState<Array<{ id: number; action: string; timestamp: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activityPanelOpen, setActivityPanelOpen] = useState(false);

  useEffect(() => {
    // Simulate loading dashboard data (no backend)
    const timer = setTimeout(() => {
      setRecentActivity([]);
      setLoadError(null);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const retryLoad = () => {
    setLoadError(null);
    setIsLoading(true);
    setTimeout(() => {
      setRecentActivity([]);
      setIsLoading(false);
    }, 600);
  };

  const cardStyle = {
    background: "var(--color-background)",
    borderColor: "var(--color-border-light)",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
  };

  const sectionCardClass =
    "rounded-2xl border overflow-hidden flex flex-col transition-all duration-200 hover:shadow-md";

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title="Dashboard"
          showSearch
          action={
            canCreateNote ? (
              <Link
                href="/notes?new=1"
                className="btn-primary"
                data-shortcut="create-note"
                style={{
                  fontSize: "var(--font-size-sm)",
                  padding: "var(--space-sm) var(--space-md)",
                  minHeight: "36px",
                }}
              >
                Create Note
              </Link>
            ) : (
              <span
                className="inline-flex items-center rounded-lg border px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                style={{
                  minHeight: "36px",
                  borderColor: "var(--color-border-light)",
                  color: "var(--color-text-muted)",
                }}
                title={CREATE_RESTRICTED_TITLE}
              >
                Create Note
              </span>
            )
          }
        />
        <main
          className="flex-1 p-6 sm:p-8 overflow-auto flex gap-6"
          style={{ background: "var(--color-background)" }}
        >
          <div className="flex-1 min-w-0 flex flex-col gap-8 max-w-4xl">
            {/* Welcome — compact hero */}
            <section
              className="rounded-2xl border p-6 sm:p-7 transition-shadow duration-200 hover:shadow-md"
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border-light)",
                boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.06)",
                borderLeftWidth: "4px",
                borderLeftColor: "var(--color-info)",
              }}
            >
              <h2
                className="text-xl sm:text-2xl font-bold mb-2"
                style={{
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.025em",
                  lineHeight: "var(--line-height-tight)",
                }}
              >
                Welcome 👋
              </h2>
              <p
                className="text-sm sm:text-base max-w-xl"
                style={{
                  color: "var(--color-text-secondary)",
                  lineHeight: "var(--line-height-relaxed)",
                }}
              >
                This is your NoteNest dashboard. Get started by creating your first note.
              </p>
            </section>

            {loadError && (
              <ErrorState
                title="Couldn't load dashboard"
                message={loadError}
                variant="error"
                onDismiss={() => setLoadError(null)}
                action={
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="btn-primary"
                    style={{ fontSize: "var(--font-size-sm)", padding: "var(--space-sm) var(--space-md)" }}
                  >
                    Try again
                  </button>
                }
                className="mb-0"
              />
            )}

            {/* Quick Actions — card */}
            <div>
              <section
                className={sectionCardClass}
                style={{ ...cardStyle, minHeight: "160px" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ borderBottom: "1px solid var(--color-border-light)" }}
                >
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "var(--color-info)",
                    }}
                    aria-hidden
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                  <h3 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Quick Actions
                  </h3>
                </div>
                <div className="flex-1 px-5 py-4 flex flex-wrap items-center gap-3">
                  {canCreateNote ? (
                    <Link
                      href="/notes?new=1"
                      className="btn-primary inline-flex items-center gap-2 min-h-[40px]"
                      style={{
                        fontSize: "var(--font-size-sm)",
                        padding: "var(--space-sm) var(--space-md)",
                      }}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Note
                    </Link>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 min-h-[40px] rounded-lg border px-3 py-2 text-sm opacity-70 cursor-not-allowed"
                      style={{
                        borderColor: "var(--color-border-light)",
                        color: "var(--color-text-muted)",
                      }}
                      title={CREATE_RESTRICTED_TITLE}
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Note
                    </span>
                  )}
                  <Link
                    href="/notes"
                    className="btn-secondary inline-flex items-center gap-2 min-h-[40px]"
                    style={{
                      fontSize: "var(--font-size-sm)",
                      padding: "var(--space-sm) var(--space-md)",
                    }}
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View All Notes
                  </Link>
                </div>
              </section>
            </div>
          </div>

          {/* Toggle: rightmost, vertical center — open/close Recent Activity panel */}
          <button
            type="button"
            onClick={() => setActivityPanelOpen((open) => !open)}
            className="fixed z-30 flex items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] focus-visible:ring-[var(--color-info)]"
            style={{
              top: "50%",
              right: "1.5rem",
              transform: "translateY(-50%)",
              background: "var(--color-info)",
              color: "white",
              borderColor: "rgba(59, 130, 246, 0.4)",
              width: "48px",
              height: "48px",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.25)",
            }}
            aria-expanded={activityPanelOpen}
            aria-label={activityPanelOpen ? "Close Recent Activity panel" : "Open Recent Activity panel"}
          >
            <svg
              className="w-5 h-5 shrink-0 transition-transform duration-200"
              style={{ transform: activityPanelOpen ? "rotate(180deg)" : "none" }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Recent Activity panel — inline right column */}
          {activityPanelOpen && (
            <aside
              className="w-80 shrink-0 flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 shadow-md"
              style={{
                background: "var(--color-background)",
                borderColor: "var(--color-border-light)",
                maxHeight: "calc(100vh - 8rem)",
              }}
              role="complementary"
              aria-label="Recent Activity"
            >
              <div
                className="flex items-center justify-between gap-3 px-5 py-4 shrink-0"
                style={{ borderBottom: "1px solid var(--color-border-light)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{
                      background: "rgba(59, 130, 246, 0.12)",
                      color: "var(--color-info)",
                    }}
                    aria-hidden
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <h2 className="text-base font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    Recent Activity
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivityPanelOpen(false)}
                  className="btn-icon rounded-xl min-w-[36px] min-h-[36px] flex items-center justify-center"
                  style={{ color: "var(--color-text-secondary)" }}
                  aria-label="Close Recent Activity panel"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 overflow-auto p-4 min-h-0">
                {isLoading ? (
                  <div className="animate-fade-in rounded-xl border p-4" style={cardStyle}>
                    <SkeletonList count={3} variant="list-item" />
                  </div>
                ) : recentActivity.length === 0 ? (
                  <div
                    className="state-content-enter rounded-xl border p-5 card-elevate"
                    style={cardStyle}
                  >
                    <EmptyState
                      size="compact"
                      icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      }
                      title="No recent activity"
                      description="Your activity will be displayed here as you use NoteNest."
                    />
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {recentActivity.map((activity) => (
                      <li key={activity.id}>
                        <div className="rounded-xl border p-3 transition-shadow duration-200 hover:shadow-sm" style={cardStyle}>
                          <div className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                            {activity.action}
                          </div>
                          <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                            {activity.timestamp}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </aside>
          )}
        </main>
      </div>
    </div>
  );
}
